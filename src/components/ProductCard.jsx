import { useCart } from '../contexts/CartContext.jsx'

/**
 * ProductCard - Card de produto para a vitrine.
 * Design premium com animações de hover e botão de adicionar ao carrinho.
 */
export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const isOutOfStock = product.stock <= 0

  const handleAdd = () => {
    if (!isOutOfStock) {
      addItem(product)
    }
  }

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isOutOfStock ? 'opacity-80' : ''}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
      id={`product-card-${product.id}`}
    >
      {/* Imagem do Produto */}
      <div className="relative overflow-hidden h-48 bg-cream-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isOutOfStock ? 'grayscale-[0.5]' : 'group-hover:scale-110'}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-cream-200 to-cream-300">
            ☕
          </div>
        )}

        {/* Badge de Esgotado Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-coffee-900/40 flex items-center justify-center backdrop-blur-[2px] z-10">
            <span className="bg-danger text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg border-2 border-white/20">
              ESGOTADO
            </span>
          </div>
        )}

        {/* Badge de categoria */}
        {product.category && !isOutOfStock && (
          <span className="absolute top-3 left-3 bg-coffee-700/80 text-cream-100 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm z-20">
            {product.category}
          </span>
        )}
      </div>

      {/* Info do Produto */}
      <div className="p-4">
        <h3 className="font-semibold text-coffee-800 text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-coffee-500 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className={`text-xl font-bold ${isOutOfStock ? 'text-cream-400' : 'text-caramel-600'}`}>
            R$ {product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-200
              ${isOutOfStock 
                ? 'bg-cream-300 text-cream-500 cursor-not-allowed' 
                : 'bg-caramel-500 hover:bg-caramel-600 hover:shadow-lg active:scale-95 cursor-pointer'}`}
            id={`add-cart-${product.id}`}
          >
            {isOutOfStock ? 'Indisponível' : '+ Carrinho'}
          </button>
        </div>
      </div>
    </div>
  )
}
