import { useCallback, useEffect, useMemo, useState } from 'react'
import { getTasksByUserId } from '../api/tasks.api'
import useAuth from '../hooks/useAuth'

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
  const [error, setError] = useState('')

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
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
   