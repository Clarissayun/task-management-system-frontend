import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Eye, EyeOff, Loader2, Shield, X } from 'lucide-react'
import { getUserById, updatePassword, updateUserProfile } from '../api/auth.api'
import useAuth from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

function getUserId(user) {
  return user?.userId || user?.id || null
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleString()
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  const userId = useMemo(() => getUserId(user), [user])
  const [accountCreatedAt, setAccountCreatedAt] = useState(
    user?.createdAt || user?.created_at || user?.createdDate || ''
  )
  const [accountUpdatedAt, setAccountUpdatedAt] = useState(
    user?.updatedAt || user?.updated_at || user?.lastUpdated || user?.modifiedAt || user?.modified_at || ''
  )

  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [deleteMessage, setDeleteMessage] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isProfileEditing, setIsProfileEditing] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    setAccountCreatedAt(user?.createdAt || user?.created_at || user?.createdDate || '')
    setAccountUpdatedAt(
      user?.updatedAt || user?.updated_at || user?.lastUpdated || user?.modifiedAt || user?.modified_at || ''
    )
  }, [user])

  useEffect(() => {
    if (!userId) {
      return
    }

    let isActive = true

    const loadUserProfileDates = async () => {
      try {
        const profile = await getUserById(userId)

        if (!isActive) {
          return
        }

        const fetchedCreatedAt = profile?.createdAt || profile?.created_at || profile?.createdDate || ''
        const fetchedUpdatedAt =
          profile?.updatedAt || profile?.updated_at || profile?.lastUpdated || profile?.modifiedAt || profile?.modified_at || ''

        if (fetchedCreatedAt) {
          setAccountCreatedAt((current) => current || fetchedCreatedAt)
          setAccountUpdatedAt((current) => current || fetchedCreatedAt)
        }

        if (fetchedUpdatedAt) {
          setAccountUpdatedAt(fetchedUpdatedAt)
        }
      } catch {
        // Keep current values when profile fetch fails.
      }
    }

    loadUserProfileDates()

    return () => {
      isActive = false
    }
  }, [userId])

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfileForm((current) => ({ ...current, [name]: value }))
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileError('')
    setProfileMessage('')
    setDeleteMessage('')

    if (!userId) {
      setProfileError('No active user session found.')
      return
    }

    if (!profileForm.username.trim() && !profileForm.email.trim()) {
      setProfileError('Please provide at least one field to update.')
      return
    }

    setIsSavingProfile(true)

    try {
      const updatedUser = await updateUserProfile(userId, {
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
      })

      updateUser({
        ...user,
        username: updatedUser.username || profileForm.username.trim(),
        email: updatedUser.email || profileForm.email.trim(),
        userId: updatedUser.id || userId,
        id: updatedUser.id || userId,
        createdAt: updatedUser.createdAt || updatedUser.created_at || accountCreatedAt || user?.createdAt,
        updatedAt:
          updatedUser.updatedAt ||
          updatedUser.updated_at ||
          updatedUser.lastUpdated ||
          updatedUser.modifiedAt ||
          accountUpdatedAt ||
          updatedUser.createdAt ||
          updatedUser.created_at ||
          accountCreatedAt ||
          user?.updatedAt ||
          user?.createdAt,
      })

      setAccountCreatedAt((current) => current || updatedUser.createdAt || updatedUser.created_at || '')
      setAccountUpdatedAt(
        updatedUser.updatedAt ||
          updatedUser.updated_at ||
          updatedUser.lastUpdated ||
          updatedUser.modifiedAt ||
          updatedUser.createdAt ||
          updatedUser.created_at ||
          accountUpdatedAt
      )

      setProfileMessage('Profile updated successfully.')
    } catch (apiError) {
      setProfileError(apiError.message || 'Failed to update profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    setDeleteMessage('')

    if (!userId) {
      setPasswordError('No active user session found.')
      return
    }

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordError('Old password and new password are required.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New password and confirm password do not match.')
      return
    }

    setIsSavingPassword(true)

    try {
      await updatePassword(userId, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
      setPasswordMessage('Password updated successfully.')
    } catch (apiError) {
      setPasswordError(apiError.message || 'Failed to update password.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleDeleteAccountClick = () => {
    setDeleteMessage('Account deletion is not available yet. Please contact support.')
  }

  const handleCancelProfileEdit = () => {
    setProfileForm({
      username: user?.username || '',
      email: user?.email || '',
    })
    setProfileError('')
    setProfileMessage('')
    setIsProfileEditing(false)
  }

  return (
    <section className="space-y-5 pb-4 text-left sm:space-y-6 sm:pb-6">
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-full border border-primary/30 bg-primary/10 p-2 text-primary">
          <Shield className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">{user?.username || 'Profile'}</h2>
          <p className="mt-1 text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and manage your personal details.</CardDescription>
            </div>
            {!isProfileEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsProfileEditing(true)}
              >
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!isProfileEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-username-view">Username</Label>
                  <Input
                    id="profile-username-view"
                    value={user?.username || '-'}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email-view">Email</Label>
                  <Input
                    id="profile-email-view"
                    value={user?.email || '-'}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-created-view">Account Created</Label>
                  <Input
                    id="profile-created-view"
                    value={formatDateTime(accountCreatedAt)}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-updated-view">Last Updated</Label>
                  <Input
                    id="profile-updated-view"
                    value={formatDateTime(accountUpdatedAt || accountCreatedAt)}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-username">Username</Label>
                  <Input
                    id="profile-username"
                    name="username"
                    type="text"
                    value={profileForm.username}
                    onChange={handleProfileChange}
                    autoComplete="username"
                    className="rounded-lg border-border/70 bg-background/50 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    autoComplete="email"
                    className="rounded-lg border-border/70 bg-background/50 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-created">Account Created</Label>
                  <Input id="profile-created" value={formatDateTime(accountCreatedAt)} readOnly disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-updated">Last Updated</Label>
                  <Input id="profile-updated" value={formatDateTime(accountUpdatedAt || accountCreatedAt)} readOnly disabled className="bg-muted" />
                </div>

                {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
                {profileMessage ? (
                  <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-600">{profileMessage}</div>
                ) : null}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isSavingProfile}>
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCancelProfileEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password for better security.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Old Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      name="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      className="rounded-lg border-border/70 bg-background/50 pr-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      className="rounded-lg border-border/70 bg-background/50 pr-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      name="confirmNewPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmNewPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      className="rounded-lg border-border/70 bg-background/50 pr-10 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
                {passwordMessage ? (
                  <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-600">{passwordMessage}</div>
                ) : null}

                <Button type="submit" className="w-full" disabled={isSavingPassword}>
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-destructive/70 bg-background/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Permanently delete your account and all associated data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button type="button" variant="destructive" className="w-full" onClick={handleDeleteAccountClick}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
              {deleteMessage ? <p className="text-sm text-muted-foreground">{deleteMessage}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}