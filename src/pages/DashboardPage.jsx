import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createTask,
  deleteTask,
  getTasksByPriority,
  getTasksByStatus,
  getTasksByUserId,
  updateTask,
  updateTaskStatus,
} from '../api/tasks.api'
import useAuth from '../hooks/useAuth'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']
const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']

function getUserId(user) {
  return user?.userId || user?.id || null
}

function formatDate(dateValue) {
  if (!dateValue) {
    return '-'
  }

  const parsedDate = new Date(dateValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue
  }

  return parsedDate.toLocaleString()
}

export default function DashboardPage() {
  const { user } = useAuth()

  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState(null)
  const [updatingStatusTaskId, setUpdatingStatusTaskId] = useState(null)
  const [savingEditTaskId, setSavingEditTaskId] = useState(null)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'LOW',
  })
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    status: 'ALL',
    priority: 'ALL',
  })
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'LOW',
  })

  const userId = useMemo(() => getUserId(user), [user])

  const loadTasks = useCallback(async () => {
    if (!userId) {
      setTasks([])
      setError('No active user session found.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let response

      if (filters.status !== 'ALL' && filters.priority === 'ALL') {
        response = await getTasksByStatus(userId, filters.status)
      } else if (filters.status === 'ALL' && filters.priority !== 'ALL') {
        response = await getTasksByPriority(userId, filters.priority)
      } else {
        response = await getTasksByUserId(userId)
      }

      let nextTasks = Array.isArray(response) ? response : []

      if (filters.status !== 'ALL' && filters.priority !== 'ALL') {
        nextTasks = nextTasks.filter(
          (task) => task.status === filters.status && task.priority === filters.priority
        )
      }

      setTasks(nextTasks)
    } catch (apiError) {
      setError(apiError.message || 'Failed to load tasks.')
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }, [filters.priority, filters.status, userId])

  const handleFormChange = (event) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleCreateTask = async (event) => {
    event.preventDefault()

    if (!userId) {
      setError('No active user session found.')
      return
    }

    if (!form.title.trim()) {
      setError('Task title is required.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await createTask(userId, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      })

      setForm({
        title: '',
        description: '',
        priority: 'LOW',
      })

      await loadTasks()
    } catch (apiError) {
      setError(apiError.message || 'Failed to create task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  const resetFilters = () => {
    setFilters({ status: 'ALL', priority: 'ALL' })
  }

  const handleTaskStatusChange = async (taskId, nextStatus) => {
    if (!taskId || !nextStatus) {
      return
    }

    setUpdatingStatusTaskId(taskId)
    setError('')

    try {
      await updateTaskStatus(taskId, nextStatus)
      await loadTasks()
    } catch (apiError) {
      setError(apiError.message || 'Failed to update task status.')
    } finally {
      setUpdatingStatusTaskId(null)
    }
  }

  const startEditTask = (task) => {
    setEditingTaskId(task.id)
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'LOW',
    })
  }

  const cancelEditTask = () => {
    setEditingTaskId(null)
    setEditForm({
      title: '',
      description: '',
      priority: 'LOW',
    })
  }

  const handleEditFormChange = (event) => {
    const { name, value } = event.target

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSaveEditTask = async (taskId) => {
    if (!taskId) {
      return
    }

    if (!editForm.title.trim()) {
      setError('Task title is required.')
      return
    }

    setSavingEditTaskId(taskId)
    setError('')

    try {
      await updateTask(taskId, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority,
      })

      cancelEditTask()
      await loadTasks()
    } catch (apiError) {
      setError(apiError.message || 'Failed to update task.')
    } finally {
      setSavingEditTaskId(null)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!taskId) {
      return
    }

    setDeletingTaskId(taskId)
    setError('')

    try {
      await deleteTask(taskId)
      await loadTasks()
    } catch (apiError) {
      setError(apiError.message || 'Failed to delete task.')
    } finally {
      setDeletingTaskId(null)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return (
    <section>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <button type="button" onClick={loadTasks} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <form
        onSubmit={handleCreateTask}
        style={{
          display: 'grid',
          gap: '12px',
          marginBottom: '20px',
          padding: '16px',
          border: '1px solid #ddd',
          borderRadius: '12px',
          textAlign: 'left',
        }}
      >
        <h3 style={{ margin: 0 }}>Create Task</h3>

        <label style={{ display: 'grid', gap: '6px' }}>
          Title
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleFormChange}
            placeholder="Enter task title"
            autoComplete="off"
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Enter task description"
            rows={4}
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          Priority
          <select name="priority" value={form.priority} onChange={handleFormChange}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </form>

      <div
        style={{
          display: 'grid',
          gap: '12px',
          marginBottom: '20px',
          padding: '16px',
          border: '1px solid #ddd',
          borderRadius: '12px',
          textAlign: 'left',
        }}
      >
        <h3 style={{ margin: 0 }}>Filters</h3>

        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr auto' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            Status
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="ALL">ALL</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            Priority
            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
              <option value="ALL">ALL</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <button type="button" onClick={resetFilters} style={{ alignSelf: 'end' }}>
            Reset
          </button>
        </div>
      </div>

      {isLoading ? <p>Loading tasks...</p> : null}

      {!isLoading && error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

      {!isLoading && !error && tasks.length === 0 ? (
        <p>
          {filters.status !== 'ALL' || filters.priority !== 'ALL'
            ? 'No tasks found for the selected filters.'
            : 'No tasks found. Create your first task in the next step.'}
        </p>
      ) : null}

      {!isLoading && !error && tasks.length > 0 ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {tasks.map((task) => (
            <article
              key={task.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'left',
              }}
            >
              {editingTaskId === task.id ? (
                <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: 0 }}>Edit Task</h3>

                  <label style={{ display: 'grid', gap: '6px' }}>
                    Title
                    <input
                      name="title"
                      type="text"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      autoComplete="off"
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '6px' }}>
                    Description
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFormChange}
                      rows={4}
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '6px' }}>
                    Priority
                    <select
                      name="priority"
                      value={editForm.priority}
                      onChange={handleEditFormChange}
                    >
                      {PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : (
                <>
                  <h3 style={{ marginTop: 0, marginBottom: '8px' }}>
                    {task.title || 'Untitled task'}
                  </h3>

                  <p style={{ marginBottom: '12px' }}>
                    {task.description || 'No description provided.'}
                  </p>

                  <p style={{ margin: '4px 0' }}>
                    <strong>Status:</strong> {task.status || '-'}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Priority:</strong> {task.priority || '-'}
                  </p>
                </>
              )}

              <p style={{ margin: '4px 0' }}>
                <strong>Created:</strong> {formatDate(task.createdAt)}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Updated:</strong> {formatDate(task.updatedAt)}
              </p>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'grid', gap: '6px', marginBottom: '10px' }}>
                  Change Status
                  <select
                    value={task.status || 'TODO'}
                    onChange={(event) => handleTaskStatusChange(task.id, event.target.value)}
                    disabled={updatingStatusTaskId === task.id}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                {editingTaskId === task.id ? (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleSaveEditTask(task.id)}
                      disabled={savingEditTaskId === task.id}
                    >
                      {savingEditTaskId === task.id ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditTask}
                      disabled={savingEditTaskId === task.id}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditTask(task)}
                    disabled={deletingTaskId === task.id || updatingStatusTaskId === task.id}
                    style={{ marginBottom: '10px' }}
                  >
                    Edit Task
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={
                    deletingTaskId === task.id ||
                    updatingStatusTaskId === task.id ||
                    savingEditTaskId === task.id
                  }
                >
                  {deletingTaskId === task.id ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
   