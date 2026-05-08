import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { firebaseLogin, firebaseRegister, firebaseLogout } from '../config/firebase.js'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  /**
   * Ao montar o app, verifica se existe uma sessão ativa no backend
   * através do cookie HttpOnly (GET /api/auth/me).
   */
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        // Backend indisponível ou sessão inválida
        console.warn('Sessão não encontrada:', error.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  /**
   * Login real via Firebase Auth + Session Cookie no backend.
   * 
   * Fluxo:
   * 1. Firebase Auth verifica email/senha → retorna idToken
   * 2. idToken é enviado ao backend → backend cria Session Cookie HttpOnly
   * 3. Cookie fica no navegador automaticamente (seguro, invisível ao JS)
   */
  const login = useCallback(async (email, password) => {
    try {
      // 1. Autenticar no Firebase Auth (client)
      const idToken = await firebaseLogin(email, password)

      // 2. Enviar idToken ao backend para criar sessão segura
      const res = await fetch(`${API_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Importante: permite receber o cookie
        body: JSON.stringify({ idToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'ERRO_SESSAO',
          message: data.message || 'Erro ao criar sessão.',
        }
      }

      // 3. Armazena dados do usuário no state
      setUser(data.user)
      return { success: true, user: data.user }

    } catch (error) {
      console.error('Erro no login:', error.code || error.message)

      // Traduz os erros do Firebase Auth para mensagens amigáveis
      const firebaseErrors = {
        'auth/user-not-found': 'Email não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/invalid-email': 'Email inválido.',
        'auth/user-disabled': 'Esta conta foi desativada.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
        'auth/invalid-credential': 'Email ou senha incorretos.',
      }

      return {
        success: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: firebaseErrors[error.code] || 'Erro ao fazer login. Tente novamente.',
      }
    }
  }, [])

  /**
   * Registro de novo usuário via nosso Backend Seguro.
   * O backend valida a senha forte e cria a conta.
   */
  const register = useCallback(async (email, password, extraData = {}) => {
    try {
      const payload = {
        email: email.trim(),
        password,
        ...extraData
      }

      const res = await fetch(`${API_URL}/api/public/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'ERRO_REGISTRO',
          message: data.message || 'Erro ao criar conta.',
        }
      }

      // 2. Se a conta foi criada, fazemos o login real!
      return await login(email, password)

    } catch (error) {
      console.error('Erro no registro:', error.message)
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: 'Erro ao criar conta. Tente novamente.',
      }
    }
  }, [login])

  /**
   * Logout: limpa sessão no backend (revoga tokens) + logout do Firebase Auth client.
   */
  const logout = useCallback(async () => {
    try {
      // 1. Limpa sessão no backend (revoga tokens no Firebase Admin)
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      // 2. Logout do Firebase Auth no client
      await firebaseLogout()
    } catch (error) {
      console.warn('Erro no logout:', error.message)
    } finally {
      // Sempre limpa o estado local
      setUser(null)
    }
  }, [])

  // Mostra loading enquanto verifica sessão
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-900">
        <div className="text-center animate-pulse-soft">
          <p className="text-4xl mb-4">☕</p>
          <p className="text-cream-300 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
