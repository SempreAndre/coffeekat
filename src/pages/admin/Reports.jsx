export default function Reports() {
  const reportTypes = [
    { id: 'sales', label: 'Relatório de Vendas', icon: '💰', desc: 'Vendas por período, produto e cliente.' },
    { id: 'inventory', label: 'Relatório de Estoque', icon: '📦', desc: 'Níveis de estoque e itens em baixa.' },
    { id: 'customers', label: 'Relatório de Clientes', icon: '👥', desc: 'Clientes mais frequentes e ticket médio.' },
    { id: 'financial', label: 'Relatório Financeiro', icon: '📊', desc: 'Entradas, saídas e fluxo de caixa.' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-[var(--font-display)] text-cream-100 mb-6">Geração de Relatórios</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reportTypes.map((r) => (
          <div key={r.id} className="glass rounded-xl p-6 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{r.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-cream-100 group-hover:text-caramel-400 transition-colors">{r.label}</h3>
                <p className="text-cream-400 text-sm mt-1">{r.desc}</p>
                <button className="mt-3 px-4 py-1.5 text-xs bg-caramel-500/20 text-caramel-400 hover:bg-caramel-500 hover:text-white rounded-lg font-medium transition-all cursor-pointer" id={`report-generate-${r.id}`}>
                  Gerar Relatório
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
