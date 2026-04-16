const AUTH_STORAGE_KEY = 'task-management-system-auth'

let currentSession = null
const sessionListeners = new Set()

function isBrowser() {
  return typeof window !== 'undefined'
}

function parseStoredSession(rawSession) {
  if (!rawSession) {
    return null
  }

  try {
    const parsed = JSON.parse(rawSession)

    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    // Ignore legacy sessions that do not contain JWT tokens.
    if (!parsed.accessToken || !parsed.refreshToken) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function readAuthSession() {
  if (!isBrowser()) {
    return null
  }

  const parsed = parseStoredSession(window.localStorage.getItem(AUTH_STORAGE_KEY))

  if (!parsed) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return parsed
}

export function writeAuthSession(session) {
  if (!isBrowser()) {
    return
  }

  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getAuthSession() {
  if (currentSession === null && isBrowser()) {
    currentSession = readAuthSession()
  }

  return currentSession
}

export function setAuthSession(session) {
  currentSession = session
  writeAuthSession(session)

  sessionListeners.forEach((listener) => {
    listener(currentSession)
  })
}

export function clearAuthSession() {
  setAuthSession(null)
}

export function getAccessToken() {
  return getAuthSession()?.accessToken || null
}

export function getRefreshToken() {
  return getAuthSession()?.refreshToken || null
}

export function buildSessionFromAuthResponse(authResponse, fallbackUser = null) {
  if (!authResponse?.accessToken || !authResponse?.refreshToken) {
    return null
  }

  const user = authResponse.userId
    ? {
        id: authResponse.userId,
        userId: authResponse.userId,
        username: authResponse.username,
        email: authResponse.email,
      }
    : fallbackUser

  return {
    user,
    tokenType: authResponse.tokenType || 'Bearer',
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken,
    accessTokenExpiresIn: authResponse.accessTokenExpiresIn || null,
    refreshTokenExpiresIn: authResponse.refreshTokenExpiresIn || null,
    updatedAt: Date.now(),
  }
}

export function subscribeAuthSessionChange(listener) {
  sessionListeners.add(listener)

  return () => {
    sessionListeners.delete(listener)
  }
}
