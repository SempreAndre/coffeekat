import { Router } from 'express'
import { db, auth } from '../config/firebase.js'

const router = Router()

/**
 * GET /api/public/products
 * Lista os produtos ativos para a vitrine (público)
 */
router.get('/products', async (req, res) => {
  try {
    const snapshot = await db.collection('products')
      .where('active', '==', true)
      .get()
      
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Ordenar por nome em memória para evitar a necessidade de criar um Índice Composto no Firestore no modo free.
    products.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    return res.status(200).json({ success: true, data: products })
  } catch (error) {
    console.error('❌ Erro ao buscar produtos (vitrine):', error.message)
    return res.status(500).json({ error: 'ERRO_INTERNO', message: 'Erro ao carregar a vitrine.' })
  }
})

/**
 * POST /api/public/register
 * Cadastra um novo cliente e aplica as 5 regras da Senha Forte diretamente no servidor.
 */
router.post('/register', async (req, res) => {
  const { email, password, name, phone, document, address, nickname } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Email, senha e nome são obrigatórios.' })
  }

  // Verificação de Senha no Backend
  if (password.length < 8) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter no mínimo 8 caracteres' })
  if (!/[A-Z]/.test(password)) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter pelo menos uma letra maiúscula' })
  if (!/[a-z]/.test(password)) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter pelo menos uma letra minúscula' })
  if (!/[0-9]/.test(password)) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter pelo menos um número' })
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter pelo menos um caractere especial' })

  try {
    const userRecord = await auth.createUser({
      email: email.trim(),
      password: password,
      displayName: name.trim()
    })

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      phone: phone || '',
      document: document || '',
      address: address || '',
      nickname: nickname || '',
      role: 'user',
      createdAt: new Date().toISOString()
    }

    await db.collection('users').doc(userRecord.uid).set(newUser)

    return res.status(201).json({ success: true, message: 'Conta criada com sucesso.' })
  } catch (error) {
    console.error('❌ Erro no registro de cliente:', error.message)
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'EMAIL_EM_USO', message: 'Este e-mail já está em uso.' })
    }
    return res.status(500).json({ error: 'ERRO_INTERNO', message: 'Erro ao criar conta.' })
  }
})

/**
 * POST /api/public/orders
 * Recebe o carrinho, valida estoque, desconta e salva o pedido real.
 */
router.post('/orders', async (req, res) => {
  const { userId, customerName, items, total, address, notes, createdAt } = req.body

  if (!items || !items.length || !total || !address) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Dados do pedido incompletos.' })
  }

  try {
    // Transação garante que ou abate o estoque e salva pedido, ou desfaz tudo se faltar café!
    await db.runTransaction(async (transaction) => {
      // 1. Localiza os produtos no banco
      const productRefs = items.map(item => db.collection('products').doc(item.productId))
      const productDocs = await transaction.getAll(...productRefs)
      
      const stockUpdates = []

      // 2. Valida estoque individual
      productDocs.forEach((pDoc, index) => {
        if (!pDoc.exists) {
          throw new Error(`O produto ${items[index].name} não está mais disponível no banco de dados.`)
        }
        
        const currentStock = pDoc.data().stock || 0
        const requestedQuantity = items[index].quantity

        if (currentStock < requestedQuantity) {
          throw new Error(`Sem estoque suficiente para ${items[index].name}. Quantidade disponível: ${currentStock}.`)
        }

        stockUpdates.push({
          ref: pDoc.ref,
          newStock: currentStock - requestedQuantity
        })
      })

      // 3. Atualiza os estoques descontando
      stockUpdates.forEach(update => {
        transaction.update(update.ref, { stock: update.newStock })
      })

      // 4. Salva a "nota" do pedido oficial
      const newOrderRef = db.collection('orders').doc()
      transaction.set(newOrderRef, {
        userId: userId || 'anonymous',
        customerName: req.body.customerName || 'Cliente Expresso',
        items,
        total,
        address,
        notes: notes || '',
        status: 'Pendente', 
        createdAt: createdAt || new Date().toISOString()
      })
    })

    return res.status(201).json({ success: true, message: 'Pedido processado e estoque abatido.' })
  } catch (error) {
    console.error('❌ Erro no fechamento do pedido:', error.message)
    return res.status(500).json({ error: 'ORDER_FAILED', message: error.message })
  }
})

export default router
