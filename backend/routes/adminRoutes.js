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
import { db } from '../config/firebase.js'

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

export default router
