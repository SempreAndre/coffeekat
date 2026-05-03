import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/backgrounds/coffeeteria.png')] bg-cover bg-center" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-8xl opacity-10 animate-pulse-soft">🐱</div>
          <div className="absolute top-20 right-20 text-6xl opacity-10 animate-pulse-soft" style={{ animationDelay: '1s' }}>☕</div>
          <div className="absolute bottom-20 left-1/3 text-7xl opacity-10 animate-pulse-soft" style={{ animationDelay: '0.5s' }}>🐈</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36 text-center">
          <h1 className="text-5xl md:text-7xl font-[var(--font-display)] text-cream-50 mb-6 animate-fade-in">
            Coffee Kat
          </h1>
          <p className="text-xl md:text-2xl text-cream-200 mb-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Onde o café encontra a companhia perfeita
          </p>
          <p className="text-md text-cream-300/80 mb-10 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Cafés especiais torrados artesanalmente, doces irresistíveis e a presença aconchegante dos nossos gatinhos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/store'}
                className="px-8 py-3 bg-caramel-500 hover:bg-caramel-600 text-white text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                id="hero-cta"
              >
                {user?.role === 'admin' ? 'Ir ao Painel' : 'Ver Produtos'}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-caramel-500 hover:bg-caramel-600 text-white text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                  id="hero-login"
                >
                  Entrar na Loja
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-3 border-2 border-cream-300/40 text-cream-100 hover:bg-cream-100/10 text-lg font-semibold rounded-xl transition-all duration-300"
                  id="hero-register"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-coffee-800 text-center mb-12">
          Por que a Coffee Kat?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              emoji: '☕',
              title: 'Cafés Artesanais',
              desc: 'Grãos selecionados e torrados com carinho para criar a xícara perfeita.',
            },
            {
              emoji: '🐱',
              title: 'Companhia Felina',
              desc: 'Nossos gatinhos — um branco de olhos azuis e um cinza rajado — são a alma da casa.',
            },
            {
              emoji: '🍰',
              title: 'Doces Especiais',
              desc: 'Bolos, cookies e brownies feitos com ingredientes premium e muito amor.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ boxShadow: 'var(--shadow-card)', animationDelay: `${i * 0.15}s` }}
            >
              <div className="text-5xl mb-4">{item.emoji}</div>
              <h3 className="text-xl font-bold text-coffee-700 mb-3">{item.title}</h3>
              <p className="text-coffee-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-coffee-900 text-cream-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-2xl font-[var(--font-display)] text-cream-100 mb-2">☕ Coffee Kat</p>
          <p className="text-sm text-cream-400">© 2026 Coffee Kat. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
