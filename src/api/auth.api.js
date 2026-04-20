import api from './axios'

export const requestRegisterOtp = async (payload) => {
  const { data } = await api.post('/auth/register/otp/request', payload)
  return data
}

export const verifyRegisterOtp = async (payload) => {
  const { data } = await api.post('/auth/register/otp/verify', payload)
  return data
}

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const requestOtp = async (payload) => {
  const { data } = await api.post('/auth/otp/request', payload)
  return data
}

export const verifyOtp = async (payload) => {
  const { data } = await api.post('/auth/otp/verify', payload)
  return data
}

export const refreshAuthToken = async (payload) => {
  const { data } = await api.post('/auth/refresh', payload)
  return data
}

export const getUserById = async (userId) => {
  const { data } = await api.get(`/auth/user/${userId}`)
  return data
}

export const getUserByUsername = async (username) => {
  const { data } = await api.get(`/auth/user/username/${username}`)
  return data
}

export const updateUserProfile = async (userId, payload) => {
  const { data } = await api.put(`/auth/user/${userId}`, payload)
  return data
}

export const updatePassword = async (userId, payload) => {
  const { data } = await api.post(`/auth/update-password/${userId}`, payload)
  return data
}
