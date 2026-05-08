import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar.jsx'
import ProductCard from '../../components/ProductCard.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''
const CATEGORIES = ['Todos', 'Cafés', 'Doces', 'Bebidas']

export default function Store() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/public/products`)
      const data = await res.json()
      if (res.ok) {
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar catálogo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === 'Todos' || p.category === activeCategory
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.description || '').toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-[var(--font-display)] text-coffee-800 mb-3">
            Nossa Vitrine
          </h1>
          <p className="text-coffee-500 text-lg">Escolha seus favoritos e monte seu pedido</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Categorias */}
          <div className="flex gap-2 flex-wrap justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                  ${activeCategory === cat
                    ? 'bg-caramel-500 text-white shadow-md'
                    : 'bg-white text-coffee-600 hover:bg-cream-200 border border-cream-300'
                  }`}
                id={`filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-cream-300 rounded-lg text-coffee-800 placeholder-coffee-400/60 focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20 outline-none transition-all"
              id="store-search"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400">🔍</span>
          </div>
        </div>

        {/* Grid de Produtos */}
        {isLoading ? (
          <div className="text-center py-16 text-coffee-500 animate-pulse">
            <p className="text-5xl mb-4">☕</p>
            <p className="text-lg">Tirando o café do fogo... aguarde.</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-coffee-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">Nenhum produto encontrado na loja.</p>
          </div>
        )}
      </div>
    </div>
  )
}
