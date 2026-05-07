import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Products() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setProducts(data.data || [])
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActive = async (id, currentActive) => {
    try {
      const newActive = !currentActive
      // Atualiza no banco
      await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active: newActive })
      })

      // Atualiza localmente
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: newActive } : p))
    } catch (err) {
      console.error('Erro ao alternar status do produto:', err)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-[var(--font-display)] text-cream-100">Controle de Produtos</h1>
        <button 
          onClick={() => navigate('/admin/products/new')} 
          className="px-4 py-2 bg-caramel-500 hover:bg-caramel-600 text-white rounded-lg font-medium transition-all cursor-pointer"
        >
          + Novo Produto
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
           <div className="p-8 text-center text-cream-300">Carregando produtos...</div>
        ) : products.length === 0 ? (
           <div className="p-8 text-center text-cream-300">Nenhum produto cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-cream-400 text-sm border-b border-white/10">
                  <th className="p-4 font-medium">Produto</th>
                  <th className="p-4 font-medium">Categoria</th>
                  <th className="p-4 font-medium">Preço</th>
                  <th className="p-4 font-medium">Estoque</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-cream-200 font-medium">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs">☕</div>
                        )}
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-cream-400">{p.category}</td>
                    <td className="p-4 text-cream-100 font-bold">R$ {(p.price || 0).toFixed(2).replace('.', ',')}</td>
                    <td className="p-4 text-cream-300">{p.stock || 0}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        p.active ? 'bg-success/20 text-success' : 'bg-cream-300/20 text-cream-400'
                      }`}>
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleActive(p.id, p.active)}
                          className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-cream-200 rounded-lg transition-all cursor-pointer"
                        >
                          {p.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
