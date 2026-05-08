import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

const statusColors = {
  'Entregue': 'bg-success/20 text-success',
  'Preparando': 'bg-warning/20 text-warning',
  'Pendente': 'bg-cream-300/20 text-cream-100',
  'Cancelado': 'bg-danger/20 text-danger',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setOrders(data.data || [])
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatItems = (items) => {
    if (!items || !items.length) return 'Nenhum item'
    return items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-[var(--font-display)] text-cream-100">Controle de Pedidos</h1>
        <p className="mt-1" style={{ color: '#ffffff' }}>Acompanhe todos os pedidos da loja em tempo real.</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-cream-300">Carregando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-cream-300">Nenhum pedido encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-cream-400 text-sm border-b border-white/10">
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Itens Comprados</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-cream-400 text-sm">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="p-4 text-cream-200 font-medium">{o.customerName || 'Cliente'}</td>
                    <td className="p-4 text-cream-300 text-sm truncate max-w-xs" title={formatItems(o.items)}>
                      {formatItems(o.items)}
                    </td>
                    <td className="p-4 text-caramel-400 font-bold">
                      R$ {(o.total || 0).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[o.status || 'Pendente'] || statusColors['Pendente']}`}>
                        {o.status || 'Pendente'}
                      </span>
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
