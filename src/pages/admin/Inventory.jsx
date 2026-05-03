import { useState } from 'react'

const MOCK_INVENTORY = [
  { id: 1, name: 'Café Arábica (kg)', stock: 25, min: 10, unit: 'kg' },
  { id: 2, name: 'Leite Integral (L)', stock: 40, min: 15, unit: 'L' },
  { id: 3, name: 'Chocolate Belga (kg)', stock: 8, min: 5, unit: 'kg' },
  { id: 4, name: 'Açúcar (kg)', stock: 30, min: 10, unit: 'kg' },
  { id: 5, name: 'Farinha de Trigo (kg)', stock: 12, min: 8, unit: 'kg' },
  { id: 6, name: 'Copos Descartáveis', stock: 200, min: 100, unit: 'un' },
]

export default function Inventory() {
  const [inventory, setInventory] = useState(MOCK_INVENTORY)

  const updateStock = (id, delta) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
      )
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-[var(--font-display)] text-cream-100 mb-6">Controle de Estoque</h1>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-cream-400 text-sm border-b border-white/10">
                <th className="p-4 font-medium">Item</th>
                <th className="p-4 font-medium">Estoque Atual</th>
                <th className="p-4 font-medium">Mínimo</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isLow = item.stock <= item.min
                return (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-cream-200 font-medium">{item.name}</td>
                    <td className="p-4 text-cream-100 font-bold">
                      {item.stock} {item.unit}
                    </td>
                    <td className="p-4 text-cream-400">{item.min} {item.unit}</td>
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
                          id={`inv-decrease-${item.id}`}
                        >
                          −
                        </button>
                        <button
                          onClick={() => updateStock(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-success/20 text-cream-200 hover:text-success transition-all cursor-pointer"
                          id={`inv-increase-${item.id}`}
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
      </div>
    </div>
  )
}
