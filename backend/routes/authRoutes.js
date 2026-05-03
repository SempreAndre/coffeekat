/**
 * Coffee Kat Backend - Rotas de Autenticação
 * 
 * Gerencia a criação e destruição de sessões seguras
 * utilizando Firebase Auth Session Cookies.
 * 
 * Fluxo:
 * 1. Frontend faz login com Firebase Auth (Client SDK) → recebe idToken
 * 2. Frontend envia idToken para POST /api/auth/session
 * 3. Backend verifica o idToken e cria um Session Cookie HttpOnly
 * 4. Todas as próximas requisições usam o cookie automaticamente
 */

import { Router } from 'express'
import { auth, db } from '../config/firebase.js'

const router = Router()

/**
 * POST /api/auth/session
 * Cria uma sessão segura a partir do ID Token do Firebase.
 * 
 * Body: { idToken: string }
 * Response: { success: true, user: { uid, email, role, name } }
 */
router.post('/session', async (req, res) => {
  const { idToken } = req.body

  if (!idToken || typeof idToken !== 'string') {
    return res.status(400).json({
      error: 'TOKEN_AUSENTE',
      message: 'O token de autenticação é obrigatório.',
    })
  }

  try {
    // Verifica o idToken com o Firebase Admin
    const decodedToken = await auth.verifyIdToken(idToken)

    // Duração do cookie de sessão: 5 dias (máximo recomendado pelo Firebase)
    const expiresIn = 5 * 24 * 60 * 60 * 1000 // 5 dias em ms

    // Cria o Session Cookie
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

    // Busca dados extras do usuário no Firestore (role, name, etc.)
    let userData = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || '',
      role: 'user', // padrão
    }

    try {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get()
      if (userDoc.exists) {
        const data = userDoc.data()
        userData.role = data.role || 'user'
        userData.name = data.name || userData.name
        userData.nickname = data.nickname || ''
      }
    } catch (firestoreError) {
      // Se o Firestore não tiver dados do usuário, usa os padrões
      console.warn('⚠️ Dados do usuário não encontrados no Firestore:', firestoreError.message)
    }

    // Define o cookie seguro no navegador
    const cookieOptions = {
      maxAge: expiresIn,
      httpOnly: true,       // JavaScript do navegador NÃO consegue acessar
      secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
      sameSite: 'strict',   // Protege contra CSRF
      path: '/',
    }

    res.cookie('session', sessionCookie, cookieOptions)

    return res.status(200).json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error('❌ Erro ao criar sessão:', error.code || error.message)

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRADO',
        message: 'O token de autenticação expirou. Faça login novamente.',
      })
    }

    return res.status(401).json({
      error: 'TOKEN_INVÁLIDO',
      message: 'Não foi possível verificar suas credenciais.',
    })
  }
})

/**
 * POST /api/auth/logout
 * Encerra a sessão do usuário, limpando o cookie e revogando os tokens.
 */
router.post('/logout', async (req, res) => {
  const sessionCookie = req.cookies?.session

  // Limpa o cookie mesmo que esteja inválido
  res.clearCookie('session', { path: '/' })

  if (sessionCookie) {
    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie)
      // Revoga todos os tokens de atualização do usuário (força logout em todos os dispositivos)
      await auth.revokeRefreshTokens(decodedClaims.uid)
    } catch (error) {
      // Cookie já inválido/expirado, apenas loga
      console.warn('⚠️ Cookie de sessão já inválido no logout:', error.message)
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso.',
  })
})

/**
 * GET /api/auth/me
 * Retorna os dados do usuário autenticado a partir do cookie de sessão.
 * Útil para o frontend verificar se a sessão ainda é válida ao recarregar a página.
 */
router.get('/me', async (req, res) => {
  const sessionCookie = req.cookies?.session

  if (!sessionCookie) {
    return res.status(401).json({ error: 'NÃO_AUTENTICADO' })
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

    let userData = {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      name: decodedClaims.name || '',
      role: 'user',
    }

    try {
      const userDoc = await db.collection('users').doc(decodedClaims.uid).get()
      if (userDoc.exists) {
        const data = userDoc.data()
        userData.role = data.role || 'user'
        userData.name = data.name || userData.name
        userData.nickname = data.nickname || ''
      }
    } catch {
      // Usa dados padrão se Firestore não tiver o documento
    }

    return res.status(200).json({ success: true, user: userData })
  } catch {
    res.clearCookie('session', { path: '/' })
    return res.status(401).json({ error: 'SESSÃO_INVÁLIDA' })
  }
})
/**
 * POST /api/auth/register-data
 * Salva dados extras do usuário recém-cadastrado no Firestore.
 * Deve ser chamada após a criação da sessão.
 * 
 * Body: { uid, name, phone, document, address, nickname, role }
 */
router.post('/register-data', async (req, res) => {
  const sessionCookie = req.cookies?.session

  if (!sessionCookie) {
    return res.status(401).json({ error: 'NÃO_AUTENTICADO' })
  }

  try {
    // Verifica se o usuário está autenticado
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

    const { name, phone, document, address, nickname, role } = req.body

    // Salva os dados do usuário no Firestore
    const userData = {
      name: String(name || '').trim(),
      phone: String(phone || '').trim(),
      document: String(document || '').trim(),
      address: String(address || '').trim(),
      nickname: String(nickname || '').trim(),
      email: decodedClaims.email,
      role: role || 'user',
      createdAt: new Date().toISOString(),
    }

    await db.collection('users').doc(decodedClaims.uid).set(userData, { merge: true })

    return res.status(201).json({
      success: true,
      message: 'Dados do usuário salvos com sucesso.',
    })
  } catch (error) {
    console.error('❌ Erro ao salvar dados do usuário:', error.message)
    return res.status(500).json({
      error: 'ERRO_INTERNO',
      message: 'Erro ao salvar dados do cadastro.',
    })
  }
})

export default router
