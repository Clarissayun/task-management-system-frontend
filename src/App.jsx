import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import ProjectsPage from './pages/ProjectsPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.root} element={<LandingPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.register} element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={ROUTES.projects} element={<ProjectsPage />} />
            <Route path={ROUTES.profile} element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
