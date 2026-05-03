import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: <img src="/images/icons/Dashboard.png" alt="Dashboard" width="24" height="24" />, end: true },
  { path: '/admin/products', label: 'Produtos', icon: <img src="/images/icons/Produtos.png" alt="Produtos" width="24" height="24" /> },
  { path: '/admin/inventory', label: 'Estoque', icon: <img src="/images/icons/Estoque.png" alt="Estoque" width="24" height="24" /> },
  { path: '/admin/cash-register', label: 'Caixa', icon: <img src="/images/icons/Caixa.png" alt="Caixa" width="24" height="24" /> },
  { path: '/admin/customers', label: 'Clientes', icon: <img src="/images/icons/Clientes.png" alt="Clientes" width="24" height="24" /> },
  { path: '/admin/create-admin', label: 'Criar Admin', icon: <img src="/images/icons/Criar_admin.png" alt="Criar Admin" width="24" height="24" /> },
  { path: '/admin/settings', label: 'Configurações', icon: <img src="/images/icons/Configurancoes.png" alt="Configuracoes" width="24" height="24" /> },
  { path: '/admin/reports', label: 'Relatórios', icon: <img src="/images/icons/Relatorios.png" alt="Relatorios" width="24" height="24" /> },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[url('/images/backgrounds/coffeeteria.png')] bg-cover bg-center bg-fixed flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar com Glassmorphism */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 z-50 glass-dark flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        id="admin-sidebar"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-[var(--font-display)] text-cream-100">
            <img src="images/logos/Logo.png" alt="Logo" width="200" height="200" /> Coffee Kat
          </h1>
          <p className="text-xs text-cream-400 mt-1">Painel Administrativo</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-caramel-500/30 text-cream-50 border border-caramel-500/30'
                      : 'text-cream-300 hover:bg-white/5 hover:text-cream-100'
                    }`
                  }
                  id={`admin-menu-${item.path.split('/').pop() || 'dashboard'}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Usuário e Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-caramel-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-cream-100 text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-cream-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 text-sm text-cream-300 hover:text-cream-100 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            id="admin-logout"
          >
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="md:hidden sticky top-0 z-30 glass-dark px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-cream-200 hover:text-white cursor-pointer"
            id="admin-mobile-menu"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-cream-100 font-[var(--font-display)]">☕ Admin</span>
          <div className="w-6" />
        </header>

        {/* Área de Conteúdo */}
        <main className="flex-1 p-4 md:p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
