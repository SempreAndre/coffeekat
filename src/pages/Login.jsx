import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import GlassContainer from '../components/GlassContainer.jsx'
import InputSecure from '../components/InputSecure.jsx'
import { validators } from '../utils/security.js'

export default function Login() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redireciona se já estiver logado
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/store', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Validações no front-end
    const emailErr = validators.email(email)
    if (emailErr) {
      setError(emailErr)
      setIsSubmitting(false)
      return
    }

    if (!password) {
      setError('Senha é obrigatória')
      setIsSubmitting(false)
      return
    }

    // Login real via Firebase Auth + Backend
    const result = await login(email, password)

    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin' : '/store', { replace: true })
    } else {
      setError(result.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/backgrounds/coffeeteria.png')] bg-cover bg-center px-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-caramel-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-cream-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 text-9xl opacity-5">🐱</div>
        <div className="absolute bottom-1/4 right-1/4 text-8xl opacity-5">☕</div>
      </div>

      <GlassContainer className="w-full max-w-md relative animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/images/logos/Logo.png" alt="Coffee Kat Logo" className="w-24 h-24 mb-3 opacity-90" />
          <h1 className="text-3xl font-[var(--font-display)] text-cream-50 mb-2">
            Coffee Kat
          </h1>
          <p className="text-cream-300/80">Entre na sua conta</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4">
            <InputSecure
              id="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              validator={validators.email}
              placeholder="seu@email.com"
              required
              disabled={isSubmitting}
              autoComplete="email"
              labelClassName="text-cream-100"
            />

            <InputSecure
              id="login-password"
              label="Senha"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
              autoComplete="current-password"
              labelClassName="text-cream-100"
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mt-4 p-3 bg-danger/20 border border-danger/30 rounded-lg animate-fade-in" id="login-error" role="alert">
              <p className="text-cream-100 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white text-lg transition-all duration-300 cursor-pointer
              ${isSubmitting
                ? 'bg-coffee-600/50 cursor-not-allowed'
                : 'bg-caramel-500 hover:bg-caramel-600 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
              }`}
            id="login-submit"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link para Cadastro */}
        <div className="mt-6 text-center">
          <p className="text-cream-300/70 text-sm">
            Não tem conta?{' '}
            <Link to="/register" className="text-caramel-400 hover:text-caramel-300 font-medium transition-colors" id="login-register-link">
              Cadastre-se
            </Link>
          </p>
        </div>
      </GlassContainer>
    </div>
  )
}
