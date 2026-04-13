import { Link, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ROUTES } from '../constants/routes'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #ddd',
          padding: '12px 20px',
        }}
      >
        <Link to={ROUTES.dashboard} style={{ fontWeight: 700 }}>
          Task Management
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{user?.username || user?.email || 'User'}</span>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  )
}
