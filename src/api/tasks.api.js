import api from './axios'

function buildTaskQuery({ userId, projectId, status, priority, search, dueDateFrom, dueDateTo }) {
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

  if (search) {
    params.set('search', search)
  }

  if (dueDateFrom) {
    params.set('dueDateFrom', dueDateFrom)
  }

  if (dueDateTo) {
    params.set('dueDateTo', dueDateTo)
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

/**
 * Pagination helper: builds query string with page, size, and sort params
 */
function buildPaginationQuery({ page = 0, size = 10, sort = 'createdAt,desc' }) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('size', size)
  params.set('sort', sort)
  return params.toString()
}

/**
 * Get paginated tasks with optional filters.
 * Returns Page<TaskResponse> with pagination metadata.
 */
export const getTasksPaginated = async ({
  userId,
  projectId = null,
  status = null,
  priority = null,
  search = null,
  dueDateFrom = null,
  dueDateTo = null,
  page = 0,
  size = 10,
  sort = 'createdAt,desc',
} = {}) => {
  const taskQuery = buildTaskQuery({ userId, projectId, status, priority, search, dueDateFrom, dueDateTo })
  const paginationQuery = buildPaginationQuery({ page, size, sort })
  const separator = taskQuery ? '&' : '?'
  const { data } = await api.get(`/tasks/paginated${taskQuery}${taskQuery ? separator : '?'}${paginationQuery}`)
  return data
}

export const getTasksByUserIdPaginated = async (userId, projectId = null, page = 0, size = 10, sort = 'createdAt,desc') =>
  getTasksPaginated({ userId, projectId, page, size, sort })

export const getTasksByStatusPaginated = async (userId, status, projectId = null, page = 0, size = 10, sort = 'createdAt,desc') =>
  getTasksPaginated({ userId, projectId, status, page, size, sort })

export const getTasksByPriorityPaginated = async (userId, priority, projectId = null, page = 0, size = 10, sort = 'createdAt,desc') =>
  getTasksPaginated({ userId, projectId, priority, page, size, sort })
