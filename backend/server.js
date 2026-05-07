/**
 * Coffee Kat Backend - Servidor Express
 * 
 * Ponto de entrada do backend.
 * Configura todos os middlewares de segurança e registra as rotas.
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

// Rotas
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()
const PORT = process.env.PORT || 3001

// ============================================
// MIDDLEWARES DE SEGURANÇA
// ============================================

/**
 * Helmet — Define headers HTTP de segurança automaticamente.
 * Inclui Content-Security-Policy, X-Content-Type-Options,
 * X-Frame-Options, entre outros.
 */
app.use(helmet())

/**
 * CORS — Permite requisições APENAS do frontend.
 * credentials: true é necessário para enviar/receber cookies.
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

/**
 * Cookie Parser — Habilita leitura de cookies nas requisições.
 */
app.use(cookieParser())

/**
 * Body Parser — Limita o tamanho do body para prevenir ataques de payload.
 */
app.use(express.json({ limit: '4.5mb' }))

/**
 * Rate Limiter Geral — Limita todas as requisições para prevenir DDoS.
 * Máximo de 100 requisições por IP a cada 15 minutos.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'MUITAS_REQUISIÇÕES',
    message: 'Muitas requisições. Tente novamente em 15 minutos.',
  },
})
app.use(generalLimiter)

/**
 * Rate Limiter Rigoroso para Autenticação — Previne brute-force no login.
 * Máximo de 5 tentativas por IP a cada 30 minutos.
 */
const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'LOGIN_BLOQUEADO',
    message: 'Muitas tentativas de login. Tente novamente em 30 minutos.',
  },
})

// ============================================
// ROTAS
// ============================================

// Aplica rate limiter rigoroso apenas nas rotas de autenticação
// DESATIVADO PARA TESTES a pedido do usuário
app.use('/api/auth', /* authLimiter, */ authRoutes)

// Rotas do painel administrativo
app.use('/api/admin', adminRoutes)

// Rota de saúde (health check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// 404 — Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'ROTA_NÃO_ENCONTRADA',
    message: `A rota ${req.method} ${req.originalUrl} não existe.`,
  })
})

// 500 — Erro interno global
app.use((err, req, res, next) => {
  console.error('❌ Erro interno:', err.stack)
  res.status(500).json({
    error: 'ERRO_INTERNO',
    message: process.env.NODE_ENV === 'production'
      ? 'Ocorreu um erro interno no servidor.'
      : err.message,
  })
})

// ============================================
// INICIALIZAÇÃO
// ============================================

// Vercel Serverless Functions não precisam do app.listen, eles exportam o app diretamente.
// Por isso, só chamamos o listen se não estiver rodando no Vercel.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('')
    console.log('  ☕ Coffee Kat Backend')
    console.log(`  ➜  Servidor:  http://localhost:${PORT}`)
    console.log(`  ➜  Health:    http://localhost:${PORT}/api/health`)
    console.log(`  ➜  Ambiente:  ${process.env.NODE_ENV || 'development'}`)
    console.log('')
  })
}

// Exporta o app para o Vercel Serverless usar
export default app
