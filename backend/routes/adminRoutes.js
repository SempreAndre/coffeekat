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
    // TODO: Implementar consultas reais ao Firestore
    // Por enquanto, retorna dados de exemplo para validar a integração
    const stats = {
      salesToday: 'R$ 0,00',
      ordersToday: 0,
      activeCustomers: 0,
      productsInStock: 0,
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
    const { name, price, category, description, stock } = req.body

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'DADOS_INCOMPLETOS', message: 'Nome e preço são obrigatórios.' })
    }

    const newProduct = {
      name: String(name).trim(),
      price: Number(price),
      category: String(category || '').trim(),
      description: String(description || '').trim(),
      stock: Number(stock || 0),
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
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'SENHA_INVALIDA', message: 'A senha deve ter pelo menos 8 caracteres.' })
    }

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

export default router
