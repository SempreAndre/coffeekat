import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/customers`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setCustomers(data.data || [])
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = customers.filter(
    (c) => 
      c.name?.toLowerCase().includes(search.toLowerCase()) || 
      c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-[var(--font-display)] text-cream-100">Controle de Clientes</h1>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Buscar cliente..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/15 rounded-lg text-cream-100 placeholder-cream-400/60 focus:border-caramel-500 outline-none transition-all" 
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-400">🔍</span>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-cream-300">Carregando clientes...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-cream-300">Nenhum cliente encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-cream-400 text-sm border-b border-white/10">
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Telefone</th>
                  <th className="p-4 font-medium">Data de Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-caramel-500/30 flex items-center justify-center text-cream-100 font-bold text-sm">
                          {(c.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-cream-200 font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-cream-400 text-sm">{c.email}</td>
                    <td className="p-4 text-cream-400 text-sm">{c.phone || '-'}</td>
                    <td className="p-4 text-cream-400 text-sm">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-cream-400">Nenhum resultado para "{search}".</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
