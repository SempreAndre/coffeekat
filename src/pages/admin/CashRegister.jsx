import { useState } from 'react'

export default function CashRegister() {
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'entrada', description: 'Venda - Pedido CK-A1B2C3', amount: 45.70, time: '08:32' },
    { id: 2, type: 'entrada', description: 'Venda - Pedido CK-D4E5F6', amount: 23.80, time: '09:15' },
    { id: 3, type: 'saida', description: 'Compra de insumos', amount: -120.00, time: '10:00' },
    { id: 4, type: 'entrada', description: 'Venda - Pedido CK-G7H8I9', amount: 67.40, time: '11:45' },
  ])

  const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', type: 'entrada' })

  const totalEntradas = transactions.filter((t) => t.type === 'entrada').reduce((s, t) => s + t.amount, 0)
  const totalSaidas = transactions.filter((t) => t.type === 'saida').reduce((s, t) => s + Math.abs(t.amount), 0)
  const saldo = totalEntradas - totalSaidas

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTransaction.description || !newTransaction.amount) return

    const amount = parseFloat(newTransaction.amount)
    if (isNaN(amount) || amount <= 0) return

    setTransactions((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: newTransaction.type,
        description: newTransaction.description,
        amount: newTransaction.type === 'saida' ? -amount : amount,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setNewTransaction({ description: '', amount: '', type: 'entrada' })
  }

  return (
    <div>
      <h1 className="text-3xl font-[var(--font-display)] text-cream-100 mb-6">Controle de Caixa</h1>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-5">
          <p className="text-cream-400 text-sm">Entradas</p>
          <p className="text-2xl font-bold text-success">R$ {totalEntradas.toFixed(2)}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-cream-400 text-sm">Saídas</p>
          <p className="text-2xl font-bold text-danger">R$ {totalSaidas.toFixed(2)}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-cream-400 text-sm">Saldo</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-success' : 'text-danger'}`}>
            R$ {saldo.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Formulário de Nova Transação */}
      <form onSubmit={handleAdd} className="glass rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-cream-100 mb-4">Nova Transação</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction((p) => ({ ...p, description: e.target.value }))}
            placeholder="Descrição"
            className="flex-1 px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-cream-100 placeholder-cream-400/60 outline-none focus:border-caramel-500 transition-all"
            id="cash-description"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction((p) => ({ ...p, amount: e.target.value }))}
            placeholder="Valor (R$)"
            className="w-full sm:w-32 px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-cream-100 placeholder-cream-400/60 outline-none focus:border-caramel-500 transition-all"
            id="cash-amount"
          />
          <select
            value={newTransaction.type}
            onChange={(e) => setNewTransaction((p) => ({ ...p, type: e.target.value }))}
            className="px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-cream-100 outline-none focus:border-caramel-500 cursor-pointer"
            id="cash-type"
          >
            <option value="entrada" className="bg-coffee-800">Entrada</option>
            <option value="saida" className="bg-coffee-800">Saída</option>
          </select>
          <button type="submit" className="px-6 py-2.5 bg-caramel-500 hover:bg-caramel-600 text-white rounded-lg font-medium transition-all cursor-pointer" id="cash-add">
            Adicionar
          </button>
        </div>
      </form>

      {/* Lista de Transações */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-cream-400 text-sm border-b border-white/10">
              <th className="p-4 font-medium">Hora</th>
              <th className="p-4 font-medium">Descrição</th>
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-cream-400 font-mono text-sm">{t.time}</td>
                <td className="p-4 text-cream-200">{t.description}</td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    t.type === 'entrada' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                  }`}>
                    {t.type === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                  </span>
                </td>
                <td className={`p-4 font-bold text-right ${t.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                  R$ {Math.abs(t.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
