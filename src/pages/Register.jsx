import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import GlassContainer from '../components/GlassContainer.jsx'
import InputSecure from '../components/InputSecure.jsx'
import { validators, sanitizeInput } from '../utils/security.js'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',  // CPF ou Passaporte
    address: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const updateField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  /** Máscara de Telefone */
  const phoneMask = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11)
    if (cleaned.length <= 2) return `(${cleaned}`
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }

  /** Máscara de CPF */
  const cpfMask = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11)
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }

  const validate = () => {
    const newErrors = {}
    newErrors.name = validators.name(form.name)
    newErrors.email = validators.email(form.email)
    newErrors.phone = validators.phone(form.phone)
    newErrors.document = validators.cpf(form.document)
    newErrors.address = validators.address(form.address)
    newErrors.nickname = validators.nickname(form.nickname)
    newErrors.password = validators.password(form.password)

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    // Remove erros null
    const filtered = {}
    for (const [key, val] of Object.entries(newErrors)) {
      if (val) filtered[key] = val
    }

    setErrors(filtered)
    return Object.keys(filtered).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    if (!validate()) {
      setIsSubmitting(false)
      return
    }

    // Sanitiza todos os campos antes de enviar
    const sanitized = {
      name: sanitizeInput(form.name),
      email: form.email.trim(), // Email não precisa de sanitização HTML
      phone: sanitizeInput(form.phone),
      document: sanitizeInput(form.document),
      address: sanitizeInput(form.address),
      nickname: sanitizeInput(form.nickname),
    }

    // Registro real via Firebase Auth + Backend
    const result = await register(form.email, form.password, {
      name: sanitized.name,
      phone: sanitized.phone,
      document: sanitized.document,
      address: sanitized.address,
      nickname: sanitized.nickname,
      role: 'user',
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => navigate('/store'), 2000)
    } else {
      setSubmitError(result.message)
    }

    setIsSubmitting(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-900 via-coffee-800 to-coffee-700 px-4">
        <GlassContainer className="w-full max-w-md text-center animate-fade-in">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-[var(--font-display)] text-cream-50 mb-2">Conta Criada com Sucesso!</h2>
          <p className="text-cream-300/80">Redirecionando para a loja...</p>
        </GlassContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/backgrounds/coffeeteria.png')] bg-cover bg-center px-4 py-8 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-caramel-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-cream-500/10 rounded-full blur-3xl" />
      </div>

      <GlassContainer className="w-full max-w-lg relative animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-[var(--font-display)] text-cream-50 mb-2">
            Criar Conta
          </h1>
          <p className="text-cream-300/80">Preencha seus dados para se cadastrar</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4">
            <InputSecure
              id="register-name"
              label="Nome Completo"
              value={form.name}
              onChange={updateField('name')}
              validator={validators.name}
              placeholder="Seu nome completo"
              required
              autoComplete="name"
              labelClassName="text-cream-100"
            />

            <InputSecure
              id="register-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={updateField('email')}
              validator={validators.email}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              labelClassName="text-cream-100"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputSecure
                id="register-phone"
                label="Telefone"
                type="tel"
                value={form.phone}
                onChange={updateField('phone')}
                validator={validators.phone}
                placeholder="(00) 00000-0000"
                required
                mask={phoneMask}
                autoComplete="tel"
                labelClassName="text-cream-100"
              />

              <InputSecure
                id="register-document"
                label="CPF ou Passaporte"
                value={form.document}
                onChange={updateField('document')}
                validator={validators.cpf}
                placeholder="000.000.000-00"
                required
                mask={cpfMask}
                labelClassName="text-cream-100"
              />
            </div>

            <InputSecure
              id="register-address"
              label="Endereço"
              value={form.address}
              onChange={updateField('address')}
              validator={validators.address}
              placeholder="Pode ser preenchido na hora da compra"
              autoComplete="street-address"
              labelClassName="text-cream-100"
            />

            <InputSecure
              id="register-nickname"
              label="Como quer ser chamado?"
              value={form.nickname}
              onChange={updateField('nickname')}
              validator={validators.nickname}
              placeholder="Seu apelido"
              maxLength={30}
              labelClassName="text-cream-100"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <InputSecure
                  id="register-password"
                  label="Senha"
                  type="password"
                  value={form.password}
                  onChange={updateField('password')}
                  validator={validators.password}
                  placeholder="Min. 8 caracteres"
                  required
                  autoComplete="new-password"
                  labelClassName="text-cream-100"
                />

                {/* Aviso de Senha Forte */}
                <div className="bg-caramel-500/10 border border-caramel-500/20 rounded-xl p-4 text-sm text-cream-100 text-left">
                  <p className="font-semibold mb-2">Requisitos da senha:</p>
                  <ul className="list-disc pl-5 space-y-1 text-cream-300">
                    <li>Pelo menos 8 caracteres</li>
                    <li>Letra maiúscula e minúscula</li>
                    <li>Pelo menos um número (0-9)</li>
                    <li>Caractere especial (@, #, $, etc)</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <InputSecure
                  id="register-confirm-password"
                  label="Confirmar Senha"
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  placeholder="Repita a senha"
                  required
                  autoComplete="new-password"
                  labelClassName="text-cream-100"
                />
                {errors.confirmPassword && (
                  <span className="text-xs text-danger">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          {/* Erro de submit */}
          {submitError && (
            <div className="mt-4 p-3 bg-danger/20 border border-danger/30 rounded-lg animate-fade-in" role="alert">
              <p className="text-cream-100 text-sm text-center">{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white text-lg transition-all duration-300 cursor-pointer
              ${isSubmitting
                ? 'bg-coffee-600/50 cursor-not-allowed'
                : 'bg-caramel-500 hover:bg-caramel-600 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
              }`}
            id="register-submit"
          >
            {isSubmitting ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-cream-300/70 text-sm">
            Já tem conta?{' '}
            <Link to="/login" className="text-caramel-400 hover:text-caramel-300 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </GlassContainer>
    </div>
  )
}
