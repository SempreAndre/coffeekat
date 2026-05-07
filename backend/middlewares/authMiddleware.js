/**
 * Coffee Kat Backend - Middleware de Verificação de Sessão
 * 
 * Verifica se a requisição possui um Session Cookie válido do Firebase.
 * Se válido, anexa os dados do usuário (uid, email, role) ao objeto `req`.
 * Se inválido ou ausente, retorna 401 Unauthorized.
 */

import { auth, db } from '../config/firebase.js'

/**
 * Middleware que protege rotas verificando o cookie de sessão.
 * Uso: router.get('/rota-protegida', verifySession, controller)
 */
export async function verifySession(req, res, next) {
  const sessionCookie = req.cookies?.session

  if (!sessionCookie) {
    return res.status(401).json({
      error: 'NÃO_AUTENTICADO',
      message: 'Sessão não encontrada. Faça login novamente.',
    })
  }

  try {
    // Verifica o cookie de sessão com o Firebase Admin
    // checkRevoked: true garante que se o token foi revogado (ex: senha alterada), a sessão expira
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

    let userRole = decodedClaims.role

    // Se o cookie não tiver a role (comum se custom claims não foram setadas), busca no Firestore
    if (!userRole) {
      try {
        const userDoc = await db.collection('users').doc(decodedClaims.uid).get()
        if (userDoc.exists) {
          userRole = userDoc.data().role
        }
      } catch (err) {
        console.warn('⚠️ Não foi possível buscar a role no Firestore:', err.message)
      }
    }

    // Anexa os dados do usuário à requisição
    req.user = {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role: userRole || 'user',
      name: decodedClaims.name || '',
    }

    next()
  } catch (error) {
    console.error('❌ Sessão inválida:', error.code || error.message)

    // Limpa o cookie inválido
    res.clearCookie('session', { path: '/' })

    return res.status(401).json({
      error: 'SESSÃO_INVÁLIDA',
      message: 'Sua sessão expirou ou é inválida. Faça login novamente.',
    })
  }
}

/**
 * Middleware que verifica se o usuário é admin.
 * Deve ser usado APÓS verifySession.
 * Uso: router.get('/admin-only', verifySession, requireAdmin, controller)
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'ACESSO_NEGADO',
      message: 'Você não tem permissão para acessar este recurso.',
    })
  }
  next()
}
