import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth.api'
import { ROUTES } from '../constants/routes'
import useAuth from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fromPath = location.state?.from?.pathname || ROUTES.dashboard
  const successMessage = location.state?.message || ''

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await loginUser({
        username: form.username.trim(),
        password: form.password,
      })

      login({
        id: response.userId,
        userId: response.userId,
        username: response.username,
        email: response.email,
      })

      navigate(fromPath, { replace: true })
    } catch (apiError) {
      setError(apiError.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Login</h2>

      {successMessage ? (
        <p style={{ color: '#0b7a20', marginBottom: '12px' }}>{successMessage}</p>
      ) : null}

      {error ? (
        <p style={{ color: '#b91c1c', marginBottom: '12px' }}>{error}</p>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
        <label style={{ display: 'grid', gap: '6px' }}>
          Username
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your username"
            autoComplete="username"
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '12px' }}>
        No account yet? <Link to={ROUTES.register}>Create one</Link>
      </p>
    </section>
  )
}
