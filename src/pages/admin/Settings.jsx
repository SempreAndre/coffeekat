import { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    storeName: 'Coffee Kat',
    storeEmail: 'contato@coffeekat.com',
    storePhone: '(11) 99999-9999',
    openTime: '08:00',
    closeTime: '22:00',
    deliveryFee: '5.00',
    minOrder: '20.00',
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (field) => (e) => {
    setSettings((prev) => ({ ...prev, [field]: e.target.value }))
    setSaved(false)
  }

  const handleSave = (e) => {
    e.preventDefault()
    console.log('[MOCK] Configurações salvas:', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 className="text-3xl font-[var(--font-display)] text-cream-100 mb-6">Configurações da Loja</h1>

      <form onSubmit={handleSave} className="glass rounded-xl p-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Nome da Loja', field: 'storeName', type: 'text' },
            { label: 'Email de Contato', field: 'storeEmail', type: 'email' },
            { label: 'Telefone', field: 'storePhone', type: 'tel' },
            { label: 'Taxa de Entrega (R$)', field: 'deliveryFee', type: 'number' },
            { label: 'Pedido Mínimo (R$)', field: 'minOrder', type: 'number' },
            { label: 'Horário de Abertura', field: 'openTime', type: 'time' },
            { label: 'Horário de Fechamento', field: 'closeTime', type: 'time' },
          ].map((item) => (
            <div key={item.field} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-cream-300">{item.label}</label>
              <input
                type={item.type}
                value={settings[item.field]}
                onChange={handleChange(item.field)}
                className="px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-cream-100 placeholder-cream-400/60 focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20 outline-none transition-all"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button type="submit" className="px-6 py-3 bg-caramel-500 hover:bg-caramel-600 text-white rounded-xl font-semibold transition-all duration-300 cursor-pointer" id="settings-save">
            Salvar Configurações
          </button>
          {saved && <span className="text-success text-sm animate-fade-in">✅ Salvo com sucesso!</span>}
        </div>
      </form>
    </div>
  )
}
