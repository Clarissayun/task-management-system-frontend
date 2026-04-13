import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ROUTES } from '../constants/routes'

export default function PublicOnlyRoute() {
  const { isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) {
    return <p>Loading session...</p>
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <Outlet />
}
