/**
 * GlassContainer - Wrapper reutilizável para o efeito de Glassmorphism
 * Usado na tela de Login e nos menus do Admin.
 */
export default function GlassContainer({ children, className = '', dark = false }) {
  const baseClass = dark ? 'glass-dark' : 'glass'

  return (
    <div className={`${baseClass} rounded-2xl p-6 md:p-8 ${className}`}>
      {children}
    </div>
  )
}
