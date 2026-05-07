import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Inventory() {
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setInventory(data.data || [])
      }
    } catch (err) {
      console.error('Erro ao buscar estoque:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStock = async (id, delta) => {
    try {
      // Atualiza localmente primeiro para sensação de resposta rápida (Optimistic UI)
      setInventory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, stock: Math.max(0, (item.stock || 0) + delta) } : item
        )
      )

      // Salva no banco de dados
      const res = await fetch(`${API_URL}/api/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ delta })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || 'Erro ao atualizar')
      }

      // Sincroniza com a resposta real do backend para evitar desvios
      if (data.newStock !== undefined) {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, stock: data.newStock } : item
          )
        )
      }
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err)
      // Se falhar, recarrega o inventário para restaurar estado real
      fetchInventory()
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-[var(--font-display)] text-cream-100 mb-6">Controle de Estoque</h1>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-cream-300">Carregando estoque...</div>
        ) : inventory.length === 0 ? (
          <div className="p-8 text-center text-cream-300">Nenhum produto em estoque. Vá em "Produtos" para cadastrar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-cream-400 text-sm border-b border-white/10">
                  <th className="p-4 font-medium">Item</th>
                  <th className="p-4 font-medium">Estoque Atual</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const currentStock = item.stock || 0
                  // Estoque baixo arbitrário, podemos adicionar isso como campo no futuro
                  const isLow = currentStock <= 5 
                  
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-cream-200 font-medium">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover bg-white/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs">☕</div>
                          )}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-cream-100 font-bold">
                        {currentStock} un
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          isLow ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'
                        }`}>
                          {isLow ? '⚠️ Baixo' : '✅ OK'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStock(item.id, -1)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-danger/20 text-cream-200 hover:text-danger transition-all cursor-pointer"
                          >
                            −
                          </button>
                          <button
                            onClick={() => updateStock(item.id, 1)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-success/20 text-cream-200 hover:text-success transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
