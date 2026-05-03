import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 glass-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <span className="text-xl font-[var(--font-display)] text-cream-100">
              <img src="/images/logos/Logo.png" alt="Logo" width="80" height="80" />
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-cream-200 hover:text-white transition-colors duration-200" id="nav-home">
              Início
            </Link>

            {isAuthenticated && user?.role === 'user' && (
              <Link to="/store" className="text-cream-200 hover:text-white transition-colors duration-200" id="nav-store">
                Loja
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-cream-200 hover:text-white transition-colors duration-200" id="nav-admin">
                Painel Admin
              </Link>
            )}

            {isAuthenticated && (
              <Link to="/order" className="relative text-cream-200 hover:text-white transition-colors duration-200" id="nav-cart">
                🛒 Carrinho
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-4 bg-caramel-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-cream-200 hover:text-white border border-cream-300/30 rounded-lg hover:border-cream-200 transition-all duration-200"
                  id="nav-login"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-caramel-500 hover:bg-caramel-600 text-white rounded-lg transition-colors duration-200"
                  id="nav-register"
                >
                  Cadastrar
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-cream-300 text-sm">
                  Olá, {user.nickname || user.name}!
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-coffee-700 hover:bg-coffee-800 text-cream-100 rounded-lg transition-colors duration-200 cursor-pointer"
                  id="nav-logout"
                >
                  Sair
                </button>
              </div>
            )}
          </div>

          {/* Botão Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-cream-200 hover:text-white p-2 cursor-pointer"
            id="nav-mobile-toggle"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-cream-200 hover:text-white py-2">Início</Link>

              {isAuthenticated && user?.role === 'user' && (
                <Link to="/store" onClick={() => setMenuOpen(false)} className="text-cream-200 hover:text-white py-2">Loja</Link>
              )}

              {isAuthenticated && user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-cream-200 hover:text-white py-2">Painel Admin</Link>
              )}

              {isAuthenticated && (
                <Link to="/order" onClick={() => setMenuOpen(false)} className="text-cream-200 hover:text-white py-2">
                  🛒 Carrinho {totalItems > 0 && `(${totalItems})`}
                </Link>
              )}

              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-cream-200 hover:text-white py-2">Entrar</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="text-caramel-400 hover:text-white py-2">Cadastrar</Link>
                </>
              ) : (
                <button onClick={handleLogout} className="text-left text-cream-200 hover:text-white py-2 cursor-pointer">Sair</button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
