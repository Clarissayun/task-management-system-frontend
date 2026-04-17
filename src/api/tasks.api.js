import api from './axios'

function buildTaskQuery({ userId, projectId, status, priority }) {
  const params = new URLSearchParams()

  if (userId) {
    params.set('userId', userId)
  }

  if (projectId) {
    params.set('projectId', projectId)
  }

  if (status) {
    params.set('status', status)
  }

  if (priority) {
    params.set('priority', priority)
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const createTask = async (userId, payload, projectId = payload?.projectId) => {
  const { data } = await api.post(
    `/tasks${buildTaskQuery({ userId, projectId })}`,
    payload
  )
  return data
}

export const getTasksByUserId = async (userId, projectId = null) => {
  const { data } = await api.get(`/tasks${buildTaskQuery({ userId, projectId })}`)
  return data
}

export const getTasksByStatus = async (userId, status, projectId = null) => {
  const { data } = await api.get(
    `/tasks/status${buildTaskQuery({ userId, projectId, status })}`
  )
  return data
}

export const getTasksByPriority = async (userId, priority, projectId = null) => {
  const { data } = await api.get(
    `/tasks/priority${buildTaskQuery({ userId, projectId, priority })}`
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

export const deleteAllTasksByUserId = async (userId, projectId = null) => {
  const { data } = await api.delete(
    `/tasks${buildTaskQuery({ userId, projectId })}`
  )
  return data
}

export const getTasks = async ({ userId, projectId = null, status = null, priority = null } = {}) => {
  if (status && priority) {
    const tasks = await getTasksByUserId(userId, projectId)
    return tasks.filter((task) => task.status === status && task.priority === priority)
  }

  if (status) {
    return getTasksByStatus(userId, status, projectId)
  }

  if (priority) {
    return getTasksByPriority(userId, priority, projectId)
  }

  return getTasksByUserId(userId, projectId)
}

export const saveTask = async ({ userId, projectId = null, ...payload } = {}) =>
  createTask(userId, payload, projectId)
