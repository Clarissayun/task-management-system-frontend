import { createContext, useEffect, useMemo, useState } from 'react'
import {
  buildSessionFromAuthResponse,
  clearAuthSession,
  readAuthSession,
  setAuthSession,
  subscribeAuthSessionChange,
} from '../lib/authSession'

const AuthContext = createContext(undefined)

/**
 * AuthProvider component to wrap the app and provide authentication state.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readAuthSession())
  const user = session?.user ?? null
  const isHydrated = true

  useEffect(() => {
    const unsubscribe = subscribeAuthSessionChange((nextSession) => {
      setSession(nextSession)
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      accessToken: session?.accessToken ?? null,
      refreshToken: session?.refreshToken ?? null,
      tokenType: session?.tokenType ?? 'Bearer',
      isAuthenticated: Boolean(session?.accessToken && user),
      isHydrated,
      login: (authResponse) => {
        const nextSession = buildSessionFromAuthResponse(authResponse)
        setAuthSession(nextSession)
      },
      logout: () => {
        clearAuthSession()
      },
      updateUser: (updates) => {
        setAuthSession(
          session?.user
            ? {
                ...session,
                user: {
                  ...session.user,
                  ...updates,
                },
              }
            : session
        )
      },
    }),
    [session, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext