import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User, Loader2, KeyRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { requestRegisterOtp, verifyRegisterOtp } from '../api/auth.api'
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
  const PASSWORD_RULE_MESSAGE =
    'Password must be 12+ characters and include uppercase, lowercase, number, and special character.'
  const PASSWORD_CONTAINS_PERSONAL_INFO_MESSAGE =
    'Password cannot contain your name or email.'

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  })
  const [otpStep, setOtpStep] = useState('request')
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const validatePasswordPolicy = (password, username, email) => {
    if (password.length < 12) {
      return PASSWORD_RULE_MESSAGE
    }

    if (!/[A-Z]/.test(password)) {
      return PASSWORD_RULE_MESSAGE
    }

    if (!/[a-z]/.test(password)) {
      return PASSWORD_RULE_MESSAGE
    }

    if (!/\d/.test(password)) {
      return PASSWORD_RULE_MESSAGE
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return PASSWORD_RULE_MESSAGE
    }

    const loweredPassword = password.toLowerCase()
    const loweredUsername = username.trim().toLowerCase()
    const loweredEmail = email.trim().toLowerCase()
    const emailLocalPart = loweredEmail.includes('@')
      ? loweredEmail.split('@')[0]
      : loweredEmail

    if (loweredUsername && loweredPassword.includes(loweredUsername)) {
      return PASSWORD_CONTAINS_PERSONAL_INFO_MESSAGE
    }

    if (loweredEmail && (loweredPassword.includes(loweredEmail) || loweredPassword.includes(emailLocalPart))) {
      return PASSWORD_CONTAINS_PERSONAL_INFO_MESSAGE
    }

    const commonPasswords = new Set([
      'password',
      'password123',
      '123456',
      '12345678',
      'qwerty',
      'qwerty123',
      'admin',
      'letmein',
      'welcome',
      'abc123',
    ])

    if (commonPasswords.has(loweredPassword)) {
      return 'Password is too common. Choose a stronger password.'
    }

    return ''
  }

  const validateRegisterForm = () => {
    const nextFieldErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    }

    if (!form.username.trim()) {
      nextFieldErrors.username = 'The name field is required.'
    }

    if (!form.email.trim()) {
      nextFieldErrors.email = 'The email field is required.'
    } else if (!isValidEmail(form.email.trim())) {
      nextFieldErrors.email = 'Please enter a valid email address.'
    }

    if (!form.password.trim()) {
      nextFieldErrors.password = 'The password field is required.'
    } else {
      nextFieldErrors.password = validatePasswordPolicy(
        form.password,
        form.username,
        form.email
      )
    }

    if (!form.confirmPassword.trim()) {
      nextFieldErrors.confirmPassword = 'The confirm password field is required.'
    } else if (form.password !== form.confirmPassword) {
      nextFieldErrors.confirmPassword = 'Password and confirm password do not match.'
    }

    setFieldErrors(nextFieldErrors)

    return Object.values(nextFieldErrors).every((message) => !message)
  }

  const validateOtpForm = () => {
    const nextFieldErrors = {
      otp: '',
      email: '',
    }

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

  const submitRegisterOtpRequest = async () => {
    setError('')
    setInfoMessage('')

    if (!validateRegisterForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const message = await requestRegisterOtp({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })

      setOtpStep('verify')
      setInfoMessage(typeof message === 'string' ? message : 'OTP sent. Check your email inbox.')
    } catch (apiError) {
      const backendFields = apiError.data?.fields

      if (backendFields) {
        const backendPasswordMessage = (apiError.message || '').toLowerCase()
        const backendContainsPersonalInfo =
          backendPasswordMessage.includes('contain the username') ||
          backendPasswordMessage.includes('contain the email')

        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          username: backendFields.username || currentErrors.username,
          email: backendFields.email || currentErrors.email,
          password: backendFields.password
            ? backendContainsPersonalInfo
              ? PASSWORD_CONTAINS_PERSONAL_INFO_MESSAGE
              : PASSWORD_RULE_MESSAGE
            : currentErrors.password,
        }))
      }

      setError(apiError.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitRegisterOtpVerify = async () => {
    setError('')

    if (!validateOtpForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await verifyRegisterOtp({
        email: form.email.trim().toLowerCase(),
        otp: form.otp.trim(),
      })

      navigate(ROUTES.login, {
        replace: true,
        state: {
          message: 'Registration successful. Please log in with your new account.',
        },
      })
    } catch (apiError) {
      const backendFields = apiError.data?.fields
      const normalizedMessage = (apiError.message || '').toLowerCase()
      const isSessionExpired =
        normalizedMessage.includes('registration session expired') ||
        normalizedMessage.includes('invalid or expired') ||
        normalizedMessage.includes('request a new otp')

      if (backendFields) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          email: backendFields.email || currentErrors.email,
          otp: backendFields.otp || currentErrors.otp,
        }))
      }

      if (isSessionExpired) {
        setOtpStep('request')
        setForm((currentForm) => ({
          ...currentForm,
          otp: '',
        }))
        setInfoMessage('Your registration session expired. Please request a new OTP.')
      }

      setError(apiError.message || 'OTP verification failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrimaryAction = async () => {
    if (otpStep === 'request') {
      await submitRegisterOtpRequest()
      return
    }

    await submitRegisterOtpVerify()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await handlePrimaryAction()
  }

  const isVerifyStep = otpStep === 'verify'

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

          {infoMessage ? (
            <p className="mb-3 rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-300">
              {infoMessage}
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
                  disabled={isSubmitting || isVerifyStep}
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
                  disabled={isSubmitting || isVerifyStep}
                  className={`h-10 rounded-lg border-border/70 bg-background/50 pl-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25 ${
                    fieldErrors.email
                      ? 'border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/25'
                      : ''
                  }`}
                />
              </div>
              {fieldErrors.email ? (
                <p className="text-xs text-red-400">{fieldErrors.email}</p>
              ) : null}
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
                  disabled={isSubmitting || isVerifyStep}
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
                  disabled={isSubmitting || isVerifyStep}
                  className={`h-10 rounded-lg border-border/70 bg-background/50 pl-10 pr-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25 ${
                    fieldErrors.confirmPassword
                      ? 'border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/25'
                      : ''
                  }`}
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
              {fieldErrors.confirmPassword ? (
                <p className="text-xs text-red-400">{fieldErrors.confirmPassword}</p>
              ) : null}
            </div>

            {isVerifyStep ? (
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
                    disabled={isSubmitting}
                    className={`h-10 rounded-lg border-border/70 bg-background/50 pl-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25 ${
                      fieldErrors.otp
                        ? 'border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/25 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/25'
                        : ''
                    }`}
                  />
                </div>
                {fieldErrors.otp ? (
                  <p className="text-xs text-red-400">{fieldErrors.otp}</p>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 justify-start px-0 text-xs text-muted-foreground hover:text-foreground"
                  disabled={isSubmitting}
                  onClick={submitRegisterOtpRequest}
                >
                  Resend OTP
                </Button>
              </div>
            ) : null}
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
                {isVerifyStep ? 'Verifying OTP...' : 'Sending OTP...'}
              </span>
            ) : (
              isVerifyStep ? 'Verify Registration OTP' : 'Send Registration OTP'
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
