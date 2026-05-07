import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'

/* --- Páginas Gerais --- */
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

/* --- Páginas do Usuário --- */
import Store from './pages/user/Store.jsx'
import Order from './pages/user/Order.jsx'
import Confirm from './pages/user/Confirm.jsx'
import Thanks from './pages/user/Thanks.jsx'

/* --- Páginas do Administrador --- */
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import CreateAdmin from './pages/admin/CreateAdmin.jsx'
import Settings from './pages/admin/Settings.jsx'
import Inventory from './pages/admin/Inventory.jsx'
import CashRegister from './pages/admin/CashRegister.jsx'
import Products from './pages/admin/Products.jsx'
import CreateProduct from './pages/admin/CreateProduct.jsx'
import Customers from './pages/admin/Customers.jsx'
import Orders from './pages/admin/Orders.jsx'
import Reports from './pages/admin/Reports.jsx'

/**
 * Componente de Rota Protegida
 * Redireciona para /login se o usuário não estiver autenticado
 */
function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas do Usuário (Autenticado) */}
      <Route path="/store" element={
        <ProtectedRoute>
          <Store />
        </ProtectedRoute>
      } />
      <Route path="/order" element={
        <ProtectedRoute>
          <Order />
        </ProtectedRoute>
      } />
      <Route path="/confirm" element={
        <ProtectedRoute>
          <Confirm />
        </ProtectedRoute>
      } />
      <Route path="/thanks" element={
        <ProtectedRoute>
          <Thanks />
        </ProtectedRoute>
      } />

      {/* Rotas do Admin (Requer role=admin) */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="create-admin" element={<CreateAdmin />} />
        <Route path="settings" element={<Settings />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="cash-register" element={<CashRegister />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<CreateProduct />} />
        <Route path="customers" element={<Customers />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
