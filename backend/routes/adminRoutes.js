/**
 * Coffee Kat Backend - Rotas Administrativas
 * 
 * Todas as rotas aqui são protegidas por:
 * 1. verifySession - Verifica se o usuário está autenticado
 * 2. requireAdmin - Verifica se o usuário tem role 'admin'
 * 
 * Essas rotas fazem a ponte entre o frontend e o Firestore,
 * garantindo que o frontend nunca acesse o banco diretamente.
 */

import { Router } from 'express'
import { verifySession, requireAdmin } from '../middlewares/authMiddleware.js'
import { auth, db } from '../config/firebase.js'
import { put } from '@vercel/blob'

const router = Router()

// Aplica os middlewares de segurança em TODAS as rotas deste router
router.use(verifySession)
router.use(requireAdmin)

/**
 * GET /api/admin/stats
 * Retorna estatísticas do dashboard administrativo.
 */
router.get('/stats', async (req, res) => {
  try {
    const usersSnap = await db.collection('users').where('role', '==', 'user').get()
    const productsSnap = await db.collection('products').get()
    const ordersSnap = await db.collection('orders').get()

    let ordersToday = 0
    let salesToday = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    ordersSnap.forEach(doc => {
      const data = doc.data()
      if (data.createdAt) {
        const orderDate = new Date(data.createdAt)
        if (orderDate >= today) {
          ordersToday++
          salesToday += (data.total || 0)
        }
      }
    })

    const stats = {
      salesToday: `R$ ${salesToday.toFixed(2).replace('.', ',')}`,
      ordersToday,
      activeCustomers: usersSnap.size,
      productsInStock: productsSnap.size,
    }

    return res.status(200).json({ success: true, data: stats })
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error.message)
    return res.status(500).json({
      error: 'ERRO_INTERNO',
      message: 'Erro ao buscar estatísticas do dashboard.',
    })
  }
})

/**
 * GET /api/admin/products
 * Lista todos os produtos.
 */
router.get('/products', async (req, res) => {
  try {
    const snapshot = await db.collection('products').orderBy('name').get()
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return res.status(200).json({ success: true, data: products })
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error.message)
    return res.status(500).json({ error: 'ERRO_INTERNO', message: 'Erro ao buscar produtos.' })
  }
})

/**
 * POST /api/admin/products
 * Cria um novo produto.
 */
router.post('/products', async (req, res) => {
  try {
    const { name, price, category, description, stock, imageBase64 } = req.body

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'DADOS_INCOMPLETOS', message: 'Nome e preço são obrigatórios.' })
    }

    let imageUrl = ''
    if (imageBase64) {
      try {
        // Pega de data:image/png;base64,.... a string base
        const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ error: 'FORMATO_IMAGEM', message: 'Formato base64 inválido.' })
        }
        
        const mimeType = matches[1]
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')
        const extension = mimeType.split('/')[1] || 'jpg'
        
        const fileName = `products/${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}.${extension}`
        
        const blob = await put(fileName, buffer, { 
          access: 'public', 
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType: mimeType 
        })
        
        imageUrl = blob.url
      } catch (uploadError) {
        console.error('❌ Erro no upload para Vercel Blob:', uploadError)
        return res.status(500).json({ 
          error: 'UPLOAD_FAILED', 
          message: 'Falha ao salvar a imagem. Verifique se o BLOB_READ_WRITE_TOKEN está na Vercel e é válido: ' + uploadError.message 
        })
      }
    }

    const newProduct = {
      name: String(name).trim(),
      price: Number(price),
      category: String(category || '').trim(),
      description: String(description || '').trim(),
      stock: Number(stock || 0),
      image: imageUrl,
      active: true,
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid,
    }

    const docRef = await db.collection('products').add(newProduct)
    return res.status(201).json({ success: true, data: { id: docRef.id, ...newProduct } })
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error.message)
    return res.status(500).json({ error: 'ERRO_INTERNO', message: 'Erro ao criar produto.' })
  }
})

/**
 * GET /api/admin/customers
 * Lista todos os clientes.
 */
router.get('/customers', async (req, res) => {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'user').get()
    const customers = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        nickname: data.nickname || '',
        phone: data.phone || '',
        createdAt: data.createdAt || '',
      }
    })
    return res.status(200).json({ success: true, data: customers })
  } catch (error) {
    console.error('❌ Erro ao buscar clientes:', error.message)
    return res.status(500).json({ error: 'ERRO_INTERNO', message: 'Erro ao buscar clientes.' })
  }
})

/**
 * POST /api/admin/users
 * Cria um novo administrador.
 */
router.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validações básicas no backend
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return res.status(400).json({ error: 'NOME_INVALIDO', message: 'O nome deve ter pelo menos 3 caracteres.' })
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'EMAIL_INVALIDO', message: 'O e-mail fornecido é inválido.' })
    }
    
    // Verificação de Senha Forte
    if (!password || typeof password !== 'string') return res.status(400).json({ error: 'SENHA_INVALIDA', message: 'Senha inválida' })
    if (password.length < 8) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter no mínimo 8 caracteres' })
    if (!/[A-Z]/.test(password)) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter pelo menos uma letra maiúscula' })
    if (!/[a-z]/.test(password)) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter pelo menos uma letra minúscula' })
    if (!/[0-9]/.test(password)) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter pelo menos um número' })
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return res.status(400).json({ error: 'SENHA_FRACA', message: 'Senha deve ter pelo menos um caractere especial' })

    // Cria o usuário no Firebase Auth
    const userRecord = await auth.createUser({
      email: email.trim(),
      password: password,
      displayName: name.trim(),
    })

    // Salva o documento no Firestore com role 'admin'
    const newAdmin = {
      name: name.trim(),
      email: email.trim(),
      role: 'admin',
      createdAt: new Date().toISOString(),
    }

    await db.collection('users').doc(userRecord.uid).set(newAdmin)

    return res.status(201).json({ 
      success: true, 
      message: 'Administrador criado com sucesso.', 
      data: { id: userRecord.uid, name: newAdmin.name, email: newAdmin.email } 
    })
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error.message)
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'EMAIL_EM_USO', message: 'Este e-mail já está em uso por outra conta.' })
    }
    return res.status(500).json({ error: 'ERRO_INTERNO', message: 'Erro ao criar administrador.' })
  }
})



/**
 * PATCH /api/admin/products/:id
 * Altera status do produto (Ativo/Inativo)
 */
router.patch('/products/:id', async (req, res) => {
  try {
    const { active } = req.body
    await db.collection('products').doc(req.params.id).update({ active: !!active })
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error.message)
    return res.status(500).json({ error: 'ERRO_INTERNO', message: 'Erro ao atualizar produto.' })
  }
})

/**
 * PATCH /api/admin/products/:id/stock
 * Altera a quantidade em estoque de um produto
 */
router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { delta } = req.body
    if (typeof delta !== 'number') return res.status(400).json({ error: 'DADOS_INVALIDOS' })

    const docRef = db.collection('products').doc(req.params.id)
    const docSnap = await docRef.get()
    if (!docSnap.exists) return res.status(404).json({ error: 'NAO_ENCONTRADO' })

    const currentStock = docSnap.data().stock || 0
    const newStock = Math.max(0, currentStock + delta)

    await docRef.update({ stock: newStock })
    return res.status(200).json({ success: true, newStock })
  } catch (error) {
    console.error('❌ Erro ao atualizar estoque:', error.message)
    return res.status(500).json({ error: 'ERRO_INTERNO' })
  }
})

/**
 * GET /api/admin/orders
 * Lista todos os pedidos
 */
router.get('/orders', async (req, res) => {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get()
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return res.status(200).json({ success: true, data: orders })
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error.message)
    return res.status(500).json({ error: 'ERRO_INTERNO', message: 'Erro ao buscar pedidos.' })
  }
})

export default router
