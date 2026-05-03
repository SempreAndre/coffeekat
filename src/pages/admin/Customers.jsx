import { useState } from 'react'

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 99999-1111', orders: 12, totalSpent: 548.30 },
  { id: 2, name: 'João Santos', email: 'joao@email.com', phone: '(11) 99999-2222', orders: 8, totalSpent: 312.70 },
  { id: 3, name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 99999-3333', orders: 23, totalSpent: 1087.40 },
  { id: 4, name: 'Carlos Oliveira', email: 'carlos@email.com', phone: '(11) 99999-4444', orders: 5, totalSpent: 189.50 },
]

export default function Customers() {
  const [search, setSearch] = useState('')
  const filtered = MOCK_CUSTOMERS.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-[var(--font-display)] text-cream-100">Controle de Clientes</h1>
        <div className="relative w-full sm:w-64">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/15 rounded-lg text-cream-100 placeholder-cream-400/60 focus:border-caramel-500 outline-none transition-all" id="customers-search" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-400">🔍</span>
        </div>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-cream-400 text-sm border-b border-white/10">
              <th className="p-4 font-medium">Cliente</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Telefone</th>
              <th className="p-4 font-medium">Pedidos</th>
              <th className="p-4 font-medium">Total Gasto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-caramel-500/30 flex items-center justify-center text-cream-100 font-bold text-sm">{c.name.charAt(0)}</div>
                    <span className="text-cream-200 font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="p-4 text-cream-400 text-sm">{c.email}</td>
                <td className="p-4 text-cream-400 text-sm">{c.phone}</td>
                <td className="p-4 text-cream-200 font-medium">{c.orders}</td>
                <td className="p-4 text-caramel-400 font-bold">R$ {c.totalSpent.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
