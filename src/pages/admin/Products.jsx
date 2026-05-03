import { useState } from 'react'

const MOCK_PRODUCTS = [
  { id: 1, name: 'Cappuccino Clássico', price: 14.90, category: 'Cafés', active: true },
  { id: 2, name: 'Latte Caramelo', price: 16.90, category: 'Cafés', active: true },
  { id: 3, name: 'Brownie do Gatinho', price: 12.90, category: 'Doces', active: true },
  { id: 4, name: 'Cookie Cat', price: 8.90, category: 'Doces', active: false },
]

export default function Products() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [editing, setEditing] = useState(null)

  const toggleActive = (id) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-[var(--font-display)] text-cream-100">Controle de Produtos</h1>
        <button className="px-4 py-2 bg-caramel-500 hover:bg-caramel-600 text-white rounded-lg font-medium transition-all cursor-pointer" id="products-add-new">
          + Novo Produto
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-cream-400 text-sm border-b border-white/10">
              <th className="p-4 font-medium">Produto</th>
              <th className="p-4 font-medium">Categoria</th>
              <th className="p-4 font-medium">Preço</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-cream-200 font-medium">{p.name}</td>
                <td className="p-4 text-cream-400">{p.category}</td>
                <td className="p-4 text-cream-100 font-bold">R$ {p.price.toFixed(2)}</td>
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
                      onClick={() => toggleActive(p.id)}
                      className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-cream-200 rounded-lg transition-all cursor-pointer"
                      id={`product-toggle-${p.id}`}
                    >
                      {p.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-cream-200 rounded-lg transition-all cursor-pointer" id={`product-edit-${p.id}`}>
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
