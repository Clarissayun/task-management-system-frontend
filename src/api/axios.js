import axios from 'axios'
import {
  buildSessionFromAuthResponse,
  clearAuthSession,
  getAccessToken,
  getAuthSession,
  getRefreshToken,
  setAuthSession,
} from '../lib/authSession'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

let refreshPromise = null

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

const shouldSkipRefresh = (url = '') =>
  url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await refreshClient.post('/auth/refresh', { refreshToken })
  const nextSession = buildSessionFromAuthResponse(response.data, getAuthSession()?.user)

  if (!nextSession) {
    throw new Error('Invalid refresh response')
  }

  setAuthSession(nextSession)
  return nextSession.accessToken
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const isUnauthorized = error.response?.status === 401
    const canRetry = !originalRequest._retry && !shouldSkipRefresh(originalRequest.url)

    if (isUnauthorized && canRetry && getRefreshToken()) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }

        const newAccessToken = await refreshPromise
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch {
        clearAuthSession()
      }
    }

    const normalizedError = {
      status: error.response?.status || 0,
      message:
        error.response?.data?.message ||
        error.message ||
        'Unexpected error occurred',
      path: error.response?.data?.path || null,
      data: error.response?.data || null,
    }

    return Promise.reject(normalizedError)
  }
)

export default api
