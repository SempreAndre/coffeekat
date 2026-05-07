import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { firebaseStorage } from '../../config/firebase.js'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function CreateProduct() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      let imageUrl = ''

      if (imageFile) {
        // Faz o upload da imagem para o Firebase Storage
        const storageRef = ref(firebaseStorage, `products/${Date.now()}_${imageFile.name}`)
        const snapshot = await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(snapshot.ref)
      }

      // Prepara e envia os dados para a API
      const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock || 0),
          image: imageUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao criar produto')
      }

      navigate('/admin/products')
    } catch (err) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-[var(--font-display)] text-cream-100">Novo Produto</h1>
        <button onClick={() => navigate('/admin/products')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-cream-100 rounded-lg transition-all cursor-pointer">
          Voltar
        </button>
      </div>

      <div className="glass rounded-xl p-6 max-w-2xl">
        {error && (
          <div className="mb-4 p-3 bg-danger/20 border border-danger/30 rounded-lg text-danger text-sm animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-cream-200">Nome do Produto</label>
            <input type="text" value={form.name} onChange={updateField('name')} required className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-cream-100 focus:border-caramel-500 outline-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-cream-200">Categoria</label>
            <input type="text" value={form.category} onChange={updateField('category')} required placeholder="Ex: Cafés, Doces" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-cream-100 focus:border-caramel-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-cream-200">Preço (R$)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={updateField('price')} required className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-cream-100 focus:border-caramel-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-cream-200">Estoque Inicial</label>
              <input type="number" min="0" value={form.stock} onChange={updateField('stock')} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-cream-100 focus:border-caramel-500 outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-cream-200">Descrição</label>
            <textarea value={form.description} onChange={updateField('description')} rows="3" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-cream-100 focus:border-caramel-500 outline-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-cream-200">Imagem</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-cream-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-caramel-500 file:text-white hover:file:bg-caramel-600 cursor-pointer" />
          </div>

          <button type="submit" disabled={isSubmitting} className={`mt-4 w-full py-3 text-white rounded-xl font-semibold transition-all duration-300 ${isSubmitting ? 'bg-coffee-600/50 cursor-not-allowed' : 'bg-caramel-500 hover:bg-caramel-600 cursor-pointer'}`}>
            {isSubmitting ? 'Salvando...' : 'Cadastrar Produto'}
          </button>
        </form>
      </div>
    </div>
  )
}
