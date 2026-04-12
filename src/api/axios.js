import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
