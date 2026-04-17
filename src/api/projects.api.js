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
