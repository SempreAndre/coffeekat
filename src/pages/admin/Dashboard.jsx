import { useAuth } from '../../contexts/AuthContext.jsx'

const statsCards = [
  { label: 'Vendas Hoje', value: 'R$ 1.247,90', icon: <img src="/images/icons/VendasHoje.png" alt="VendasHoje" width="24" height="24" />, change: '+12%' },
  { label: 'Pedidos Hoje', value: '34', icon: <img src="/images/icons/PedidosHoje.png" alt="PedidosHoje" width="24" height="24" />, change: '+8%' },
  { label: 'Clientes Ativos', value: '156', icon: <img src="/images/icons/ClientesAtivos.png" alt="CllientesAtivos" width="24" height="24" />, change: '+5%' },
  { label: 'Produtos em Estoque', value: '89', icon: <img src="/images/icons/ProdutosEstoque.png" alt="ProdutosEstoque" width="24" height="24" />, change: '-2%' },
]

const recentOrders = [
  { id: 'CK-A1B2C3', customer: 'Maria Silva', total: 'R$ 45,70', status: 'Entregue' },
  { id: 'CK-D4E5F6', customer: 'João Santos', total: 'R$ 23,80', status: 'Preparando' },
  { id: 'CK-G7H8I9', customer: 'Ana Costa', total: 'R$ 67,40', status: 'Pendente' },
  { id: 'CK-J0K1L2', customer: 'Carlos Oliveira', total: 'R$ 31,90', status: 'Entregue' },
]

const statusColors = {
  'Entregue': 'bg-success/20 text-success',
  'Preparando': 'bg-warning/20 text-warning',
  'Pendente': 'bg-cream-300 text-coffee-600',
}

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-[var(--font-display)] text-cream-100 mb-1">
          Dashboard
        </h1>
        <p className="text-cream-400">Bem-vindo de volta, {user?.nickname || user?.name || 'Admin'}!</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statsCards.map((card, i) => (
          <div
            key={i}
            className="glass rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.change.startsWith('+') ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                }`}>
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-cream-50">{card.value}</p>
            <p className="text-sm text-cream-100 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pedidos Recentes */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold text-cream-100 mb-4">Pedidos Recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-cream-400 text-sm border-b border-white/10">
                <th className="pb-3 font-medium text-coffee-900 mb-4">Pedido</th>
                <th className="pb-3 font-medium text-coffee-900 mb-4">Cliente</th>
                <th className="pb-3 font-medium text-cream-100 mb-4">Total</th>
                <th className="pb-3 font-medium text-cream-100 mb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 text-cream-100 font-mono text-sm">{order.id}</td>
                  <td className="py-3 text-cream-100">{order.customer}</td>
                  <td className="py-3 text-cream-100 font-medium">{order.total}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
