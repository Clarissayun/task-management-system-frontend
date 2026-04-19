import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Lock, User, Loader2, Mail, KeyRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser, requestOtp, verifyOtp } from '../api/auth.api'
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
import useAuth from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [authMode, setAuthMode] = useState('password')
  const [otpStep, setOtpStep] = useState('request')
  const [form, setForm] = useState({ username: '', password: '', email: '', otp: '' })
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: '',
    email: '',
    otp: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const fromPath = location.state?.from?.pathname || ROUTES.dashboard
  const successMessage = location.state?.message || ''

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))

    if (error) {
      setError('')
    }

    if (infoMessage) {
      setInfoMessage('')
    }
  }

  const switchMode = (nextMode) => {
    setAuthMode(nextMode)
    setOtpStep('request')
    setError('')
    setInfoMessage('')
    setFieldErrors({ username: '', password: '', email: '', otp: '' })
  }

  const validateLoginForm = () => {
    const nextFieldErrors = {
      username: '',
      password: '',
    }

    if (!form.username.trim()) {
      nextFieldErrors.username = 'The name field is required.'
    }

    if (!form.password.trim()) {
      nextFieldErrors.password = 'The password field is required.'
    }

    setFieldErrors(nextFieldErrors)

    return !nextFieldErrors.username && !nextFieldErrors.password
  }

  const validateOtpRequestForm = () => {
    const nextFieldErrors = { email: '' }

    if (!form.email.trim()) {
      nextFieldErrors.email = 'The email field is required.'
    }

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      email: nextFieldErrors.email,
      otp: '',
    }))

    return !nextFieldErrors.email
  }

  const validateOtpVerifyForm = () => {
    const nextFieldErrors = { email: '', otp: '' }

    if (!form.email.trim()) {
      nextFieldErrors.email = 'The email field is required.'
    }

    if (!form.otp.trim()) {
      nextFieldErrors.otp = 'The OTP field is required.'
    } else if (!/^\d{6}$/.test(form.otp.trim())) {
      nextFieldErrors.otp = 'OTP must be a 6-digit code.'
    }

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      email: nextFieldErrors.email,
      otp: nextFieldErrors.otp,
    }))

    return !nextFieldErrors.email && !nextFieldErrors.otp
  }

  const submitLogin = async () => {
    setError('')

    if (!validateLoginForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await loginUser({
        username: form.username.trim(),
        password: form.password,
      })

      login(response)

      navigate(fromPath, { replace: true })
    } catch (apiError) {
      const backendFields = apiError.data?.fields

      if (backendFields) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          username: backendFields.username || currentErrors.username,
          password: backendFields.password || currentErrors.password,
        }))
      }

      setError(apiError.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitOtpRequest = async () => {
    setError('')
    setInfoMessage('')

    if (!validateOtpRequestForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const message = await requestOtp({
        email: form.email.trim(),
      })

      setOtpStep('verify')
      setInfoMessage(typeof message === 'string' ? message : 'OTP sent. Please check your inbox.')
    } catch (apiError) {
      const backendFields = apiError.data?.fields

      if (backendFields) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          email: backendFields.email || currentErrors.email,
        }))
      }

      setError(apiError.message || 'Unable to send OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitOtpVerify = async () => {
    setError('')

    if (!validateOtpVerifyForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await verifyOtp({
        email: form.email.trim(),
        otp: form.otp.trim(),
      })

      login(response)
      navigate(fromPath, { replace: true })
    } catch (apiError) {
      const backendFields = apiError.data?.fields

      if (backendFields) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          email: backendFields.email || currentErrors.email,
          otp: backendFields.otp || currentErrors.otp,
        }))
      }

      setError(apiError.message || 'OTP verification failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrimaryAction = async () => {
    if (authMode === 'password') {
      await submitLogin()
      return
    }

    if (otpStep === 'request') {
      await submitOtpRequest()
      return
    }

    await submitOtpVerify()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await handlePrimaryAction()
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
          <CardTitle className="text-left !text-3xl font-semibold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="max-w-sm text-left text-sm">
            Enter your credentials to continue your productive journey.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 px-5 py-5">
        {successMessage ? (
          <p className="mb-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {successMessage}
          </p>
        ) : null}

        {error ? (
          <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        {infoMessage ? (
          <p className="mb-3 rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-300">
            {infoMessage}
          </p>
        ) : null}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-background/40 p-1">
              <Button
                type="button"
                variant={authMode === 'password' ? 'default' : 'ghost'}
                className="h-9"
                onClick={() => switchMode('password')}
              >
                Password
              </Button>
              <Button
                type="button"
                variant={authMode === 'otp' ? 'default' : 'ghost'}
                className="h-9"
                onClick={() => switchMode('otp')}
              >
                Email OTP
              </Button>
            </div>

            {authMode === 'password' ? (
              <>
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
                      placeholder="Your username"
                      autoComplete="username"
                      className={`h-10 rounded-lg border-border/70 bg-background/50 pl-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25 ${
                        fieldErrors.username
                          ? 'border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/25'
                          : ''
                      }`}
                    />
                  </div>
                  {fieldErrors.username ? (
                    <p className="text-xs text-red-400">{fieldErrors.username}</p>
                  ) : null}
                </div>

                <div className="grid gap-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Password
                    </Label>
                  </div>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`h-10 rounded-lg border-border/70 bg-background/50 pl-10 pr-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25 ${
                        fieldErrors.password
                          ? 'border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/25'
                          : ''
                      }`}
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
                  {fieldErrors.password ? (
                    <p className="text-xs text-red-400">{fieldErrors.password}</p>
                  ) : null}
                </div>
              </>
            ) : (
              <>
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
                      placeholder="your@email.com"
                      autoComplete="email"
                      className={`h-10 rounded-lg border-border/70 bg-background/50 pl-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25 ${
                        fieldErrors.email
                          ? 'border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/25'
                          : ''
                      }`}
                    />
                  </div>
                  {fieldErrors.email ? <p className="text-xs text-red-400">{fieldErrors.email}</p> : null}
                </div>

                {otpStep === 'verify' ? (
                  <div className="grid gap-1.5 text-left">
                    <Label htmlFor="otp" className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      OTP Code
                    </Label>
                    <div className="group relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400" />
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        value={form.otp}
                        onChange={handleChange}
                        placeholder="6-digit code"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className={`h-10 rounded-lg border-border/70 bg-background/50 pl-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25 ${
                          fieldErrors.otp
                            ? 'border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/25'
                            : ''
                        }`}
                      />
                    </div>
                    {fieldErrors.otp ? <p className="text-xs text-red-400">{fieldErrors.otp}</p> : null}
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 justify-start px-0 text-xs text-muted-foreground hover:text-foreground"
                      disabled={isSubmitting}
                      onClick={submitOtpRequest}
                    >
                      Resend OTP
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </form>
        </CardContent>

        <CardFooter className="grid gap-3 border-t border-border/60 px-5 py-4">
          <Button
            type="button"
            size="lg"
            className="h-10 w-full rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-200 transform-gpu hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35 hover:brightness-110 active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-lg disabled:hover:shadow-indigo-500/20 disabled:hover:brightness-100"
            disabled={isSubmitting}
            onClick={handlePrimaryAction}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                {authMode === 'password'
                  ? 'Signing in...'
                  : otpStep === 'request'
                    ? 'Sending OTP...'
                    : 'Verifying OTP...'}
              </span>
            ) : (
              authMode === 'password' ? 'Sign In' : otpStep === 'request' ? 'Send OTP' : 'Verify OTP'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link to={ROUTES.register} className="font-semibold text-foreground hover:underline">
              Create one now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
