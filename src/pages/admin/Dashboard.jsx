import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    salesToday: 'R$ 0,00',
    ordersToday: 0,
    activeCustomers: 0,
    productsInStock: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const resStats = await fetch(`${API_URL}/api/admin/stats`, { credentials: 'include' })
      const dataStats = await resStats.json()
      if (resStats.ok && dataStats.data) {
        setStats(dataStats.data)
      }

      const resOrders = await fetch(`${API_URL}/api/admin/orders`, { credentials: 'include' })
      const dataOrders = await resOrders.json()
      if (resOrders.ok && dataOrders.data) {
        // Pega só os 4 mais recentes
        setRecentOrders(dataOrders.data.slice(0, 4))
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const statsCards = [
    { label: 'Vendas Hoje', value: stats.salesToday, icon: <img src="/images/icons/VendasHoje.png" alt="Vendas Hoje" width="24" height="24" />, change: '' },
    { label: 'Pedidos Hoje', value: stats.ordersToday, icon: <img src="/images/icons/PedidosHoje.png" alt="Pedidos Hoje" width="24" height="24" />, change: '' },
    { label: 'Clientes Ativos', value: stats.activeCustomers, icon: <img src="/images/icons/ClientesAtivos.png" alt="Clientes Ativos" width="24" height="24" />, change: '' },
    { label: 'Produtos em Estoque', value: stats.productsInStock, icon: <img src="/images/icons/ProdutosEstoque.png" alt="Produtos Estoque" width="24" height="24" />, change: '' },
  ]

  const statusColors = {
    'Entregue': 'bg-success/20 text-success',
    'Preparando': 'bg-warning/20 text-warning',
    'Pendente': 'bg-cream-300/20 text-cream-100',
    'Cancelado': 'bg-danger/20 text-danger',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-[var(--font-display)] text-white mb-1">
          Dashboard
        </h1>
        <p className="text-white">Bem-vindo de volta, {user?.nickname || user?.name || 'Admin'}!</p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-cream-300 animate-pulse">Carregando painel...</div>
      ) : (
        <>
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {statsCards.map((card, i) => (
              <div
                key={i}
                className="glass rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 0.1}s`, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <p className="text-2xl font-bold text-cream-50">{card.value}</p>
                <p className="text-sm text-cream-100 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Pedidos Recentes */}
          <div className="glass rounded-xl p-6" style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            <h2 className="text-xl font-bold text-cream-100 mb-4">Pedidos Recentes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-cream-400 text-sm border-b border-white/10">
                    <th className="pb-3 font-medium text-cream-100 mb-4">Pedido</th>
                    <th className="pb-3 font-medium text-cream-100 mb-4">Cliente</th>
                    <th className="pb-3 font-medium text-cream-100 mb-4">Total</th>
                    <th className="pb-3 font-medium text-cream-100 mb-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-cream-400 text-sm">Nenhum pedido recente.</td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 text-cream-100 font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-3 text-cream-100">{order.customerName || 'Cliente'}</td>
                        <td className="py-3 text-cream-100 font-medium">R$ {(order.total || 0).toFixed(2).replace('.', ',')}</td>
                        <td className="py-3">
                          <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status || 'Pendente'] || statusColors['Pendente']}`}>
                            {order.status || 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
