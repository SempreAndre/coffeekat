import { useState } from 'react'
import InputSecure from '../../components/InputSecure.jsx'
import { validators, sanitizeInput } from '../../utils/security.js'

export default function CreateAdmin() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const nameErr = validators.name(form.name)
    if (nameErr) { setError(nameErr); return }
    const emailErr = validators.email(form.email)
    if (emailErr) { setError(emailErr); return }
    const passErr = validators.password(form.password)
    if (passErr) { setError(passErr); return }
    if (form.password !== form.confirmPassword) { setError('As senhas não coincidem'); return }

    console.log('[MOCK] Novo admin criado:', { name: sanitizeInput(form.name), email: sanitizeInput(form.email) })
    setSuccess(true)
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div>
      <h1 className="text-3xl font-[var(--font-display)] text-cream-100 mb-6">Criar Administrador</h1>

      <div className="glass rounded-xl p-6 max-w-lg">
        {success && (
          <div className="mb-4 p-3 bg-success/20 border border-success/30 rounded-lg text-success text-sm text-center animate-fade-in">
            ✅ Administrador criado com sucesso!
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-danger/20 border border-danger/30 rounded-lg text-danger text-sm text-center animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputSecure id="admin-name" label="Nome Completo" value={form.name} onChange={updateField('name')} validator={validators.name} placeholder="Nome do administrador" required />
          <InputSecure id="admin-email" label="Email" type="email" value={form.email} onChange={updateField('email')} validator={validators.email} placeholder="admin@coffeekat.com" required />
          <InputSecure id="admin-password" label="Senha" type="password" value={form.password} onChange={updateField('password')} validator={validators.password} placeholder="Min. 8 caracteres" required />
          <InputSecure id="admin-confirm" label="Confirmar Senha" type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} placeholder="Repita a senha" required />

          <button type="submit" className="w-full py-3 bg-caramel-500 hover:bg-caramel-600 text-white rounded-xl font-semibold transition-all duration-300 cursor-pointer" id="create-admin-submit">
            Criar Administrador
          </button>
        </form>
      </div>
    </div>
  )
}
