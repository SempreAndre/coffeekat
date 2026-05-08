import { Router } from 'express'
import { db } from '../config/firebase.js'

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

export default router
