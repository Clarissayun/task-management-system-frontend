import { createContext, useEffect, useMemo, useState } from 'react'

const AUTH_STORAGE_KEY = 'task-management-system-auth'

const AuthContext = createContext(undefined)

/**
 * Retrieves and parses the user session from localStorage.
 * Includes a safety check for non-browser environments and corrupted JSON.
 */
function readStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedSession) {
    return null
  }

  try {
    return JSON.parse(storedSession)
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

/**
 * Persists the session to localStorage or removes it if null.
 */
function writeStoredSession(session) {
  if (typeof window === 'undefined') {
    return
  }

  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

/**
 * AuthProvider component to wrap the app and provide authentication state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const storedSession = readStoredSession()

    if (storedSession?.user) {
      setUser(storedSession.user)
    }

    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    writeStoredSession(user ? { user } : null)
  }, [isHydrated, user])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHydrated,
      setUser,
      login: (sessionUser) => {
        setUser(sessionUser)
      },
      logout: () => {
        setUser(null)
      },
      updateUser: (updates) => {
        setUser((currentUser) =>
          currentUser ? { ...currentUser, ...updates } : currentUser
        )
      },
    }),
    [isHydrated, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext