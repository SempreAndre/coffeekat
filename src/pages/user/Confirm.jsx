import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import InputSecure from '../../components/InputSecure.jsx'
import { useCart } from '../../contexts/CartContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { validators, secureFetch, sanitizeInput } from '../../utils/security.js'

export default function Confirm() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async (e) => {
    e.preventDefault()
    setError('')

    // Validação do endereço
    if (!address.trim()) {
      setError('Endereço de entrega é obrigatório')
      return
    }

    const addrError = validators.address(address)
    if (addrError) {
      setError(addrError)
      return
    }

    setIsSubmitting(true)

    // Monta o pedido com dados sanitizados
    const orderData = {
      userId: user?.id,
      items: items.map((item) => ({
        productId: item.id,
        name: sanitizeInput(item.name),
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      total: totalPrice,
      address: sanitizeInput(address),
      notes: sanitizeInput(notes),
      timestamp: new Date().toISOString(),
    }

    try {
      // Simula envio seguro ao backend com headers CSRF
      // Na integração real: await secureFetch('/api/orders', { method: 'POST', body: JSON.stringify(orderData) })
      console.log('[MOCK] Pedido enviado com secureFetch:', orderData)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      clearCart()
      navigate('/thanks', { state: { orderNumber: `CK-${Date.now().toString(36).toUpperCase()}` } })
    } catch {
      setError('Erro ao processar o pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    navigate('/store', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-[var(--font-display)] text-coffee-800 mb-8 text-center">
          Confirmar Pedido
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resumo */}
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-lg font-bold text-coffee-700 mb-4">Resumo do Pedido</h2>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-coffee-600">{item.name} x{item.quantity}</span>
                  <span className="text-coffee-800 font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr className="border-cream-200" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-coffee-700">Total</span>
                <span className="text-caramel-600">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Formulário de Entrega */}
          <form onSubmit={handleConfirm} className="bg-white rounded-xl p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-lg font-bold text-coffee-700 mb-4">Dados de Entrega</h2>

            <div className="flex flex-col gap-4">
              <InputSecure
                id="confirm-address"
                label="Endereço de Entrega"
                value={address}
                onChange={setAddress}
                validator={validators.address}
                placeholder="Rua, número, bairro, cidade"
                required
                autoComplete="street-address"
              />

              <div className="flex flex-col gap-1">
                <label htmlFor="confirm-notes" className="text-sm font-medium text-coffee-700">
                  Observações
                </label>
                <textarea
                  id="confirm-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma instrução especial?"
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-cream-300 rounded-lg text-coffee-800 placeholder-coffee-400/60 focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20 outline-none transition-all resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg" role="alert">
                  <p className="text-danger text-sm text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl font-semibold text-white text-lg transition-all duration-300 cursor-pointer
                  ${isSubmitting
                    ? 'bg-coffee-600/50 cursor-not-allowed'
                    : 'bg-caramel-500 hover:bg-caramel-600 hover:shadow-xl active:scale-[0.98]'
                  }`}
                id="confirm-submit"
              >
                {isSubmitting ? 'Processando...' : '✅ Confirmar e Pagar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
