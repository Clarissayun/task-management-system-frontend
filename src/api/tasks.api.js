import api from './axios'

export const createTask = async (userId, payload) => {
  const { data } = await api.post(`/tasks?userId=${encodeURIComponent(userId)}`, payload)
  return data
}

export const getTasksByUserId = async (userId) => {
  const { data } = await api.get(`/tasks?userId=${encodeURIComponent(userId)}`)
  return data
}

export const getTasksByStatus = async (userId, status) => {
  const { data } = await api.get(
    `/tasks/status?userId=${encodeURIComponent(userId)}&status=${encodeURIComponent(status)}`
  )
  return data
}

export const getTasksByPriority = async (userId, priority) => {
  const { data } = await api.get(
    `/tasks/priority?userId=${encodeURIComponent(userId)}&priority=${encodeURIComponent(priority)}`
  )
  return data
}

export const getTaskById = async (taskId) => {
  const { data } = await api.get(`/tasks/${taskId}`)
  return data
}

export const updateTask = async (taskId, payload) => {
  const { data } = await api.put(`/tasks/${taskId}`, payload)
  return data
}

export const updateTaskStatus = async (taskId, status) => {
  const { data } = await api.put(
    `/tasks/${taskId}/status?status=${encodeURIComponent(status)}`
  )
  return data
}

export const deleteTask = async (taskId) => {
  const { data } = await api.delete(`/tasks/${taskId}`)
  return data
}

export const deleteAllTasksByUserId = async (userId) => {
  const { data } = await api.delete(`/tasks?userId=${encodeURIComponent(userId)}`)
  return data
}
