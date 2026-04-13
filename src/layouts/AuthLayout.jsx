import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function AuthLayout() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <section style={{ width: '100%', maxWidth: '460px', border: '1px solid #ddd', borderRadius: '12px', padding: '24px' }}>
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>Task Management System</h1>
          <p style={{ marginTop: '8px' }}>Please sign in or create an account.</p>
        </header>

        <Outlet />

        <nav style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <Link to={ROUTES.login}>Login</Link>
          <Link to={ROUTES.register}>Register</Link>
        </nav>
      </section>
    </main>
  )
}
