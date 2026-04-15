import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth.api'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { ROUTES } from '../constants/routes'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Username, email, and password are required.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      navigate(ROUTES.login, {
        replace: true,
        state: {
          message: 'Registration successful. Please log in with your new account.',
        },
      })
    } catch (apiError) {
      setError(apiError.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4 text-left">
      <Link
        to={ROUTES.root}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Home
      </Link>

      <Card className="w-full overflow-hidden rounded-xl border border-border/60 bg-background/80 py-0 shadow-2xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/60 px-5 py-5">
          <CardTitle className="text-left !text-3xl font-semibold tracking-tight">Create account</CardTitle>
          <CardDescription className="max-w-sm text-left text-sm">
            Start your productive journey in just a few seconds.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 px-5 py-5">
          {error ? (
            <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5 text-left">
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Username
              </Label>
              <div className="group relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  autoComplete="username"
                  className="h-10 rounded-lg border-border/70 bg-background/50 pl-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                />
              </div>
            </div>

            <div className="grid gap-1.5 text-left">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Email
              </Label>
              <div className="group relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="h-10 rounded-lg border-border/70 bg-background/50 pl-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                />
              </div>
            </div>

            <div className="grid gap-1.5 text-left">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Password
              </Label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="h-10 rounded-lg border-border/70 bg-background/50 pl-10 pr-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-1.5 text-left">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Confirm Password
              </Label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="h-10 rounded-lg border-border/70 bg-background/50 pl-10 pr-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="grid gap-3 border-t border-border/60 px-5 py-4">
          <Button
            type="button"
            size="lg"
            className="h-10 w-full rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-200 transform-gpu hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35 hover:brightness-110 active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-lg disabled:hover:shadow-indigo-500/20 disabled:hover:brightness-100"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link to={ROUTES.login} className="font-semibold text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
