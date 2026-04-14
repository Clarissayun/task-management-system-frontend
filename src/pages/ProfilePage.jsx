import { useMemo, useState } from 'react'
import { updatePassword, updateUserProfile } from '../api/auth.api'
import useAuth from '../hooks/useAuth'

function getUserId(user) {
  return user?.userId || user?.id || null
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  const userId = useMemo(() => getUserId(user), [user])

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
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

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
        username: updatedUser.username,
        email: updatedUser.email,
        userId: updatedUser.id || userId,
        id: updatedUser.id || userId,
      })

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

  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <h2 style={{ margin: 0 }}>Profile</h2>

      <form
        onSubmit={handleProfileSubmit}
        style={{
          display: 'grid',
          gap: '12px',
          padding: '16px',
          border: '1px solid #ddd',
          borderRadius: '12px',
          textAlign: 'left',
        }}
      >
        <h3 style={{ margin: 0 }}>Update Profile</h3>

        <label style={{ display: 'grid', gap: '6px' }}>
          Username
          <input
            name="username"
            type="text"
            value={profileForm.username}
            onChange={handleProfileChange}
            autoComplete="username"
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          Email
          <input
            name="email"
            type="email"
            value={profileForm.email}
            onChange={handleProfileChange}
            autoComplete="email"
          />
        </label>

        {profileError ? <p style={{ color: '#b91c1c', margin: 0 }}>{profileError}</p> : null}
        {profileMessage ? <p style={{ color: '#0b7a20', margin: 0 }}>{profileMessage}</p> : null}

        <button type="submit" disabled={isSavingProfile}>
          {isSavingProfile ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        style={{
          display: 'grid',
          gap: '12px',
          padding: '16px',
          border: '1px solid #ddd',
          borderRadius: '12px',
          textAlign: 'left',
        }}
      >
        <h3 style={{ margin: 0 }}>Update Password</h3>

        <label style={{ display: 'grid', gap: '6px' }}>
          Current Password
          <input
            name="oldPassword"
            type="password"
            value={passwordForm.oldPassword}
            onChange={handlePasswordChange}
            autoComplete="current-password"
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          New Password
          <input
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            autoComplete="new-password"
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          Confirm New Password
          <input
            name="confirmNewPassword"
            type="password"
            value={passwordForm.confirmNewPassword}
            onChange={handlePasswordChange}
            autoComplete="new-password"
          />
        </label>

        {passwordError ? <p style={{ color: '#b91c1c', margin: 0 }}>{passwordError}</p> : null}
        {passwordMessage ? (
          <p style={{ color: '#0b7a20', margin: 0 }}>{passwordMessage}</p>
        ) : null}

        <button type="submit" disabled={isSavingPassword}>
          {isSavingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </section>
  )
}