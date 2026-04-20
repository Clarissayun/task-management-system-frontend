import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Eye, EyeOff, Loader2, Shield, Upload, X, Trash2 } from 'lucide-react'
import { getUserById, updatePassword, updateUserProfile, uploadAvatar, removeAvatar } from '../api/auth.api'
import useAuth from '../hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
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
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [avatarMessage, setAvatarMessage] = useState('')
  const [avatarError, setAvatarError] = useState('')

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

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('File size must be less than 5MB')
      return
    }

    setAvatarFile(file)
    setAvatarError('')
    setAvatarMessage('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadAvatar = async (event) => {
    event.preventDefault()
    setAvatarError('')
    setAvatarMessage('')

    if (!userId) {
      setAvatarError('No active user session found.')
      return
    }

    if (!avatarFile) {
      setAvatarError('Please select an image file')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const updatedUser = await uploadAvatar(userId, avatarFile)

      updateUser({
        ...user,
        avatar: updatedUser.avatar,
        userId: updatedUser.id || userId,
        id: updatedUser.id || userId,
      })

      setAvatarFile(null)
      setAvatarMessage('Avatar uploaded successfully.')

      // Reset file input
      const fileInput = document.getElementById('avatar-input')
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (apiError) {
      setAvatarError(apiError.message || 'Failed to upload avatar.')
      setAvatarPreview(user?.avatar || '')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCancelAvatarEdit = () => {
    setAvatarFile(null)
    setAvatarPreview(user?.avatar || '')
    setAvatarError('')
    setAvatarMessage('')
    const fileInput = document.getElementById('avatar-input')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!userId) {
      setAvatarError('No active user session found.')
      return
    }

    setIsRemovingAvatar(true)
    setAvatarError('')
    setAvatarMessage('')

    try {
      const updatedUser = await removeAvatar(userId)

      updateUser({
        ...user,
        avatar: updatedUser.avatar,
        userId: updatedUser.id || userId,
        id: updatedUser.id || userId,
      })

      setAvatarPreview('')
      setAvatarMessage('Profile picture removed successfully.')
      setShowRemoveConfirm(false)
    } catch (apiError) {
      setAvatarError(apiError.message || 'Failed to remove profile picture.')
    } finally {
      setIsRemovingAvatar(false)
    }
  }

  const handleOpenRemoveConfirm = () => {
    setShowRemoveConfirm(true)
    setAvatarError('')
    setAvatarMessage('')
  }

  const handleCancelRemoveConfirm = () => {
    setShowRemoveConfirm(false)
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
        <div className="space-y-6">
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Click on your avatar to upload a new profile picture.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadAvatar} className="space-y-3">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      className="group relative"
                      aria-label="Upload avatar"
                    >
                      <Avatar className="h-16 w-16 transition-opacity group-hover:opacity-75">
                        <AvatarImage src={avatarPreview} alt={user?.username} />
                        <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                    </button>
                    <Input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      aria-label="Upload avatar"
                    />
                  </div>

                  {avatarFile && (
                    <p className="text-center text-xs text-muted-foreground">
                      Selected: <span className="font-medium">{avatarFile.name}</span>
                    </p>
                  )}

                  {avatarError ? <p className="text-xs text-destructive text-center">{avatarError}</p> : null}
                  {avatarMessage ? (
                    <div className="rounded-md bg-emerald-500/10 p-2 text-xs text-emerald-600 w-full text-center">{avatarMessage}</div>
                  ) : null}

                  {avatarFile && (
                    <div className="flex gap-2 w-full">
                      <Button type="submit" size="sm" className="flex-1 text-xs" disabled={isUploadingAvatar}>
                        {isUploadingAvatar ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Upload'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={handleCancelAvatarEdit}
                        disabled={isUploadingAvatar}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  )}

                  {!avatarFile && user?.avatar && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleOpenRemoveConfirm}
                      disabled={isRemovingAvatar}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remove Picture
                    </Button>
                  )}
                </div>

                {showRemoveConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-sm border-border/50 bg-background/95 backdrop-blur-sm shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-destructive">Remove Profile Picture?</CardTitle>
                        <CardDescription>
                          Are you sure you want to remove your profile picture? You'll revert to your default avatar.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex gap-3">
                        <Button
                          type="button"
                          variant="destructive"
                          className="flex-1"
                          onClick={handleRemoveAvatar}
                          disabled={isRemovingAvatar}
                        >
                          {isRemovingAvatar ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            <>Remove</>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={handleCancelRemoveConfirm}
                          disabled={isRemovingAvatar}
                        >
                          Cancel
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

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
        </div>

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