import { Link, useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'

export default function Thanks() {
  const location = useLocation()
  const orderNumber = location.state?.orderNumber || 'CK-000000'

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="bg-white rounded-2xl p-10" style={{ boxShadow: 'var(--shadow-card)' }}>
          {/* Sucesso */}
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-3xl font-[var(--font-display)] text-coffee-800 mb-3">
            Pedido Confirmado!
          </h1>
          <p className="text-coffee-500 text-lg mb-6">
            Obrigado por comprar na Coffee Kat!
          </p>

          {/* Número do Pedido */}
          <div className="bg-cream-100 rounded-xl p-4 mb-8">
            <p className="text-sm text-coffee-500 mb-1">Número do Pedido</p>
            <p className="text-2xl font-mono font-bold text-caramel-600" id="order-number">
              {orderNumber}
            </p>
          </div>

          {/* Gatinhos */}
          <div className="flex justify-center gap-4 text-4xl mb-6">
            <span title="Gatinho branco de olhos azuis">🐱</span>
            <span>☕</span>
            <span title="Gatinho cinza rajado">🐈</span>
          </div>

          <p className="text-coffee-400 text-sm mb-8">
            Nossos gatinhos já estão preparando tudo com carinho para você!
          </p>

          <Link
            to="/store"
            className="inline-block px-8 py-3 bg-caramel-500 hover:bg-caramel-600 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
            id="thanks-back-store"
          >
            Voltar à Loja
          </Link>
        </div>
      </div>
    </div>
  )
}
