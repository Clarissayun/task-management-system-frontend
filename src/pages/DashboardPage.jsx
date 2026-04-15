import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import {
  createTask,
  deleteTask,
  getTasksByPriority,
  getTasksByStatus,
  getTasksByUserId,
  updateTask,
  updateTaskStatus,
} from '../api/tasks.api'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import PriorityBadge from '../components/dashboard/PriorityBadge'
import StatusBadge from '../components/dashboard/StatusBadge'
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
  const [isCreateOpen, setIsCreateOpen] = useState(false)
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

      setIsCreateOpen(false)

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

  const openCreateTask = () => {
    setForm({
      title: '',
      description: '',
      priority: 'LOW',
    })
    setIsCreateOpen(true)
  }

  const closeCreateTask = () => {
    setIsCreateOpen(false)
    setForm({
      title: '',
      description: '',
      priority: 'LOW',
    })
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

  const taskStats = useMemo(() => {
    const todoCount = tasks.filter((t) => t.status === 'TODO').length
    const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length
    const doneCount = tasks.filter((t) => t.status === 'DONE').length
    const totalCount = tasks.length

    return { todoCount, inProgressCount, doneCount, totalCount }
  }, [tasks])

  return (
    <div className="space-y-5 pb-4 sm:space-y-6 sm:pb-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground">
          Manage and track all your tasks in one place
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {taskStats.totalCount}
              </div>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                {taskStats.todoCount}
              </div>
              <p className="text-xs text-muted-foreground">To Do</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {taskStats.inProgressCount}
              </div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {taskStats.doneCount}
              </div>
              <p className="text-xs text-muted-foreground">Done</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25 sm:w-auto"
            >
              <option value="ALL">All Status</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                </option>
              ))}
            </select>

            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25 sm:w-auto"
            >
              <option value="ALL">All Priority</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          {(filters.status !== 'ALL' || filters.priority !== 'ALL') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </Button>
          )}
        </div>

        <Button
          type="button"
          onClick={openCreateTask}
          className="w-full gap-2 shadow-lg shadow-indigo-500/20 transition-all duration-200 transform-gpu hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35 hover:brightness-110 active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-lg disabled:hover:shadow-indigo-500/20 disabled:hover:brightness-100 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Task List or Empty State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {filters.status !== 'ALL' || filters.priority !== 'ALL'
                ? 'No tasks found for the selected filters.'
                : 'No tasks yet. Create one to get started!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {tasks.map((task) => (
              <Card key={task.id} className="border-border/50 bg-background/50 backdrop-blur-sm">
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{task.title || 'Untitled'}</p>
                        {task.description ? (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingTaskId === task.id || updatingStatusTaskId === task.id || savingEditTaskId === task.id}
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                      >
                        {deletingTaskId === task.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Updated</p>
                      <p className="text-sm text-foreground/80">{formatDate(task.updatedAt)}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                      <select
                        value={task.status || 'TODO'}
                        onChange={(event) => handleTaskStatusChange(task.id, event.target.value)}
                        disabled={updatingStatusTaskId === task.id}
                        className="w-full rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => startEditTask(task)}
                      disabled={deletingTaskId === task.id || updatingStatusTaskId === task.id}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Task</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Priority</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Updated</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-border/20 transition-colors hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{task.title || 'Untitled'}</p>
                          {task.description ? (
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <select
                            value={task.status || 'TODO'}
                            onChange={(event) => handleTaskStatusChange(task.id, event.target.value)}
                            disabled={updatingStatusTaskId === task.id}
                            className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                              </option>
                            ))}
                          </select>
                          <StatusBadge status={task.status} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(task.updatedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditTask(task)}
                            disabled={deletingTaskId === task.id || updatingStatusTaskId === task.id}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={
                              deletingTaskId === task.id ||
                              updatingStatusTaskId === task.id ||
                              savingEditTaskId === task.id
                            }
                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                          >
                            {deletingTaskId === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Edit Modal / Create Form Overlay */}
      {editingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border/60 bg-background/95 shadow-2xl">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Edit Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  placeholder="Task title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  placeholder="Task description"
                  rows={4}
                  className="rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm w-full transition-all resize-none focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <select
                  id="edit-priority"
                  name="priority"
                  value={editForm.priority}
                  onChange={handleEditFormChange}
                  className="rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm w-full transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/60 flex gap-2">
              <Button
                type="button"
                onClick={() => handleSaveEditTask(editingTaskId)}
                disabled={savingEditTaskId === editingTaskId}
                className="flex-1"
              >
                {savingEditTaskId === editingTaskId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditTask}
                disabled={savingEditTaskId === editingTaskId}
                className="flex-1"
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border/60 bg-background/95 shadow-2xl">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Create New Task</CardTitle>
                <Button type="button" variant="ghost" size="icon" onClick={closeCreateTask}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Title</Label>
                  <Input
                    id="create-title"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="What needs to be done?"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <textarea
                    id="create-description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Add more details..."
                    rows={4}
                    className="rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm w-full transition-all resize-none focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-priority">Priority</Label>
                  <select
                    id="create-priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                    className="rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm w-full transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/60 flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.title.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeCreateTask}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
   