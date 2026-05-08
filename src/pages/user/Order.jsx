import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import { useCart } from '../../contexts/CartContext.jsx'

export default function Order() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-[var(--font-display)] text-coffee-800 mb-4">Seu carrinho está vazio</h1>
          <p className="text-coffee-500 mb-8">Que tal explorar nosso cardápio?</p>
          <Link
            to="/store"
            className="px-6 py-3 bg-caramel-500 hover:bg-caramel-600 text-white rounded-xl font-semibold transition-all duration-200"
            id="order-go-store"
          >
            Ir para a Loja
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-[var(--font-display)] text-coffee-800 mb-8 text-center">
          Seu Pedido
        </h1>

        {/* Lista de itens */}
        <div className="flex flex-col gap-4 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 flex items-center gap-4 transition-all duration-200"
              style={{ boxShadow: 'var(--shadow-card)' }}
              id={`order-item-${item.id}`}
            >
              {/* Imagem do Produto */}
              <div className="w-14 h-14 bg-cream-200 rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span>☕</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-coffee-800 truncate">{item.name}</h3>
                <p className="text-sm text-coffee-500">R$ {item.price.toFixed(2)} cada</p>
              </div>

              {/* Quantidade */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-cream-200 hover:bg-cream-300 text-coffee-700 font-bold transition-colors cursor-pointer"
                  id={`order-decrease-${item.id}`}
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-coffee-800">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-cream-200 hover:bg-cream-300 text-coffee-700 font-bold transition-colors cursor-pointer"
                  id={`order-increase-${item.id}`}
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <span className="font-bold text-caramel-600 w-24 text-right">
                R$ {(item.price * item.quantity).toFixed(2)}
              </span>

              {/* Remover */}
              <button
                onClick={() => removeItem(item.id)}
                className="text-danger/60 hover:text-danger transition-colors cursor-pointer"
                id={`order-remove-${item.id}`}
                aria-label={`Remover ${item.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Total e Ações */}
        <div className="bg-white rounded-xl p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xl font-semibold text-coffee-700">Total</span>
            <span className="text-2xl font-bold text-caramel-600">R$ {totalPrice.toFixed(2)}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/store"
              className="flex-1 py-3 text-center border-2 border-cream-300 text-coffee-600 hover:bg-cream-100 rounded-xl font-semibold transition-all duration-200"
              id="order-continue-shopping"
            >
              Continuar Comprando
            </Link>
            <Link
              to="/confirm"
              className="flex-1 py-3 text-center bg-caramel-500 hover:bg-caramel-600 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
              id="order-checkout"
            >
              Finalizar Pedido
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
