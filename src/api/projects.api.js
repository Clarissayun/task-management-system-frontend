import api from './axios'

export const createProject = async (payload) => {
  const { data } = await api.post('/projects', payload)
  return data
}

export const getProjects = async () => {
  const { data } = await api.get('/projects')
  return data
}

export const getProjectsByStatus = async (status) => {
  const { data } = await api.get(`/projects/status/${encodeURIComponent(status)}`)
  return data
}

export const getProjectById = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}`)
  return data
}

export const updateProject = async (projectId, payload) => {
  const { data } = await api.put(`/projects/${projectId}`, payload)
  return data
}

export const deleteProject = async (projectId) => {
  const { data } = await api.delete(`/projects/${projectId}`)
  return data
}

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
 * Get paginated projects with optional filters.
 * Returns Page<ProjectResponse> with pagination metadata.
 */
export const getProjectsPaginated = async ({
  status = null,
  search = null,
  startDateFrom = null,
  startDateTo = null,
  dueDateFrom = null,
  dueDateTo = null,
  page = 0,
  size = 10,
  sort = 'createdAt,desc',
} = {}) => {
  const params = new URLSearchParams()

  if (status) {
    params.set('status', status)
  }

  if (search) {
    params.set('search', search)
  }

  if (startDateFrom) {
    params.set('startDateFrom', startDateFrom)
  }

  if (startDateTo) {
    params.set('startDateTo', startDateTo)
  }

  if (dueDateFrom) {
    params.set('dueDateFrom', dueDateFrom)
  }

  if (dueDateTo) {
    params.set('dueDateTo', dueDateTo)
  }

  params.set('page', page)
  params.set('size', size)
  params.set('sort', sort)

  const { data } = await api.get(`/projects/paginated?${params.toString()}`)
  return data
}

export const getProjectsByStatusPaginated = async (status, page = 0, size = 10, sort = 'createdAt,desc') =>
  getProjectsPaginated({ status, page, size, sort })
