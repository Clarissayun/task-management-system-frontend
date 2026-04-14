import { useCallback, useEffect, useMemo, useState } from 'react'
import { createTask, deleteTask, getTasksByUserId } from '../api/tasks.api'
import useAuth from '../hooks/useAuth'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

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
  const [error, setError] = useState('')
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
      const response = await getTasksByUserId(userId)
      setTasks(Array.isArray(response) ? response : [])
    } catch (apiError) {
      setError(apiError.message || 'Failed to load tasks.')
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

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

      {isLoading ? <p>Loading tasks...</p> : null}

      {!isLoading && error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

      {!isLoading && !error && tasks.length === 0 ? (
        <p>No tasks found. Create your first task in the next step.</p>
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
              <p style={{ margin: '4px 0' }}>
                <strong>Created:</strong> {formatDate(task.createdAt)}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Updated:</strong> {formatDate(task.updatedAt)}
              </p>

              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={deletingTaskId === task.id}
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
   