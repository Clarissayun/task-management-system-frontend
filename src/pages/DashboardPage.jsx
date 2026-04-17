import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import {
  deleteAllTasksByUserId,
  deleteTask,
  getTaskById,
  getTasks,
  saveTask,
  updateTask,
  updateTaskStatus,
} from '../api/tasks.api'
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  getProjectsByStatus,
  updateProject,
} from '../api/projects.api'
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
const PROJECT_STATUSES = ['ACTIVE', 'ARCHIVED', 'COMPLETED']
const PERSONAL_SCOPE_ID = '__PERSONAL_SCOPE__'
const PROJECT_FILTER_ALL = 'ALL'

function getUserId(user) {
  return user?.userId || user?.id || null
}

function formatStatus(value) {
  if (value === 'TODO') return 'To Do'
  if (value === 'IN_PROGRESS') return 'In Progress'
  if (value === 'DONE') return 'Done'
  return value || '-'
}

function formatProjectStatus(value) {
  if (value === 'ACTIVE') return 'Active'
  if (value === 'ARCHIVED') return 'Archived'
  if (value === 'COMPLETED') return 'Completed'
  return value || '-'
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
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState(null)
  const [isClearingPersonalTasks, setIsClearingPersonalTasks] = useState(false)
  const [loadingEditTaskId, setLoadingEditTaskId] = useState(null)
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
  const [projectStatusFilter, setProjectStatusFilter] = useState(PROJECT_FILTER_ALL)
  const [selectedProjectId, setSelectedProjectId] = useState(PERSONAL_SCOPE_ID)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [projectModalMode, setProjectModalMode] = useState('create')
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'LOW',
  })
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
  })

  const userId = useMemo(() => getUserId(user), [user])
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  )
  const isProjectScope = selectedProjectId !== PERSONAL_SCOPE_ID
  const scopeProjectId = isProjectScope ? selectedProjectId : null

  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true)

    try {
      const response =
        projectStatusFilter === PROJECT_FILTER_ALL
          ? await getProjects()
          : await getProjectsByStatus(projectStatusFilter)

      const nextProjects = Array.isArray(response) ? response : []
      setProjects(nextProjects)

      if (
        selectedProjectId !== PERSONAL_SCOPE_ID &&
        !nextProjects.some((project) => project.id === selectedProjectId)
      ) {
        setSelectedProjectId(PERSONAL_SCOPE_ID)
      }
    } catch (apiError) {
      setProjects([])
      setError(apiError.message || 'Failed to load projects.')
    } finally {
      setIsLoadingProjects(false)
    }
  }, [projectStatusFilter, selectedProjectId])

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
      const response = await getTasks({
        userId,
        projectId: scopeProjectId,
        status: filters.status !== 'ALL' ? filters.status : null,
        priority: filters.priority !== 'ALL' ? filters.priority : null,
      })

      let nextTasks = Array.isArray(response) ? response : []

      setTasks(nextTasks)
    } catch (apiError) {
      setError(apiError.message || 'Failed to load tasks.')
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }, [filters.priority, filters.status, scopeProjectId, userId])

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
      await saveTask({
        userId,
        projectId: scopeProjectId,
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

  const openCreateProject = () => {
    setProjectModalMode('create')
    setProjectForm({
      name: '',
      description: '',
      status: 'ACTIVE',
    })
    setIsProjectModalOpen(true)
  }

  const openEditProject = async () => {
    if (!isProjectScope || !selectedProjectId) {
      return
    }

    setError('')

    try {
      const project = await getProjectById(selectedProjectId)

      setProjectModalMode('edit')
      setProjectForm({
        name: project?.name || '',
        description: project?.description || '',
        status: project?.status || 'ACTIVE',
      })
      setIsProjectModalOpen(true)
    } catch (apiError) {
      setError(apiError.message || 'Failed to load project details.')
    }
  }

  const closeProjectModal = () => {
    setIsProjectModalOpen(false)
    setProjectForm({
      name: '',
      description: '',
      status: 'ACTIVE',
    })
  }

  const handleProjectFormChange = (event) => {
    const { name, value } = event.target

    setProjectForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSaveProject = async (event) => {
    event.preventDefault()

    if (!projectForm.name.trim()) {
      setError('Project name is required.')
      return
    }

    setIsSubmittingProject(true)
    setError('')

    try {
      const payload = {
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
        status: projectForm.status,
      }

      if (projectModalMode === 'edit' && selectedProjectId) {
        await updateProject(selectedProjectId, payload)
      } else {
        const createdProject = await createProject(payload)
        if (createdProject?.id) {
          setSelectedProjectId(createdProject.id)
        }
      }

      closeProjectModal()
      await loadProjects()
    } catch (apiError) {
      setError(apiError.message || 'Failed to save project.')
    } finally {
      setIsSubmittingProject(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!isProjectScope || !selectedProjectId) {
      return
    }

    const confirmed = window.confirm(
      'Delete this project and all tasks inside it? This action cannot be undone.'
    )

    if (!confirmed) {
      return
    }

    setDeletingProjectId(selectedProjectId)
    setError('')

    try {
      await deleteProject(selectedProjectId)
      setSelectedProjectId(PERSONAL_SCOPE_ID)
      await loadProjects()
      await loadTasks()
    } catch (apiError) {
      setError(apiError.message || 'Failed to delete project.')
    } finally {
      setDeletingProjectId(null)
    }
  }

  const handleClearCurrentScopeTasks = async () => {
    if (!userId) {
      return
    }

    const scopeLabel = isProjectScope
      ? `project "${selectedProject?.name || 'selected project'}"`
      : 'personal tasks'

    const confirmed = window.confirm(
      `Delete all tasks in the current ${scopeLabel}? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setIsClearingPersonalTasks(true)
    setError('')

    try {
      await deleteAllTasksByUserId(userId, isProjectScope ? selectedProjectId : null)
      await loadTasks()
    } catch (apiError) {
      setError(apiError.message || 'Failed to clear tasks for the current scope.')
    } finally {
      setIsClearingPersonalTasks(false)
    }
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

  const startEditTask = async (task) => {
    if (!task?.id) {
      return
    }

    setLoadingEditTaskId(task.id)
    setError('')

    try {
      const freshTask = await getTaskById(task.id)

      setEditingTaskId(freshTask.id)
      setEditForm({
        title: freshTask.title || '',
        description: freshTask.description || '',
        priority: freshTask.priority || 'LOW',
      })
    } catch (apiError) {
      setError(apiError.message || 'Failed to load task details.')
    } finally {
      setLoadingEditTaskId(null)
    }
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
    loadProjects()
  }, [loadProjects])

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
        <h1 className="text-3xl font-bold tracking-tight">Task Workspace</h1>
        <p className="text-muted-foreground">
          {isProjectScope
            ? `Managing tasks in ${selectedProject?.name || 'selected project'}`
            : 'Managing standalone personal tasks'}
        </p>
      </div>

      {/* Project Scope Controls */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Project Scope</CardTitle>
          <CardDescription>
            Choose where tasks should be created and managed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <select
              value={projectStatusFilter}
              onChange={(event) => setProjectStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
            >
              <option value={PROJECT_FILTER_ALL}>All Project Status</option>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatProjectStatus(status)}
                </option>
              ))}
            </select>

            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="w-full rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
            >
              <option value={PERSONAL_SCOPE_ID}>Personal Tasks (Standalone)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({formatProjectStatus(project.status)})
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={openCreateProject}>
                New Project
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={openEditProject}
                disabled={!isProjectScope || isLoadingProjects}
              >
                Edit Project
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteProject}
                disabled={!isProjectScope || deletingProjectId === selectedProjectId}
              >
                {deletingProjectId === selectedProjectId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Project'
                )}
              </Button>
            </div>
          </div>

          {isLoadingProjects ? (
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          ) : isProjectScope ? (
            <div className="rounded-lg border border-border/50 bg-background/30 px-4 py-3">
              <p className="text-sm font-medium">{selectedProject?.name || '-'}</p>
              <p className="text-xs text-muted-foreground">
                {selectedProject?.description || 'No project description'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 bg-background/30 px-4 py-3">
              <p className="text-sm font-medium">Personal Standalone Scope</p>
              <p className="text-xs text-muted-foreground">
                Tasks created here are not linked to a project.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                  {formatStatus(status)}
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
          {isProjectScope ? 'Add Task to Project' : 'Add Personal Task'}
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={handleClearCurrentScopeTasks}
          disabled={isClearingPersonalTasks}
          className="w-full sm:w-auto"
        >
          {isClearingPersonalTasks ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Clearing...
            </>
          ) : isProjectScope ? (
            'Clear Project Tasks'
          ) : (
            'Clear Personal Tasks'
          )}
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
                : isProjectScope
                  ? 'No tasks in this project yet. Create one to get started!'
                  : 'No personal tasks yet. Create one to get started!'}
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
                            {formatStatus(status)}
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
                      {loadingEditTaskId === task.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Edit'
                      )}
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
                                {formatStatus(status)}
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
                            disabled={
                              deletingTaskId === task.id ||
                              updatingStatusTaskId === task.id ||
                              loadingEditTaskId === task.id
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {loadingEditTaskId === task.id ? 'Loading...' : 'Edit'}
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

      {/* Create / Edit Project Modal */}
      {isProjectModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border/60 bg-background/95 shadow-2xl">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>
                  {projectModalMode === 'edit' ? 'Edit Project' : 'Create New Project'}
                </CardTitle>
                <Button type="button" variant="ghost" size="icon" onClick={closeProjectModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <form onSubmit={handleSaveProject} className="space-y-4">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    name="name"
                    value={projectForm.name}
                    onChange={handleProjectFormChange}
                    placeholder="Website Redesign"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <textarea
                    id="project-description"
                    name="description"
                    value={projectForm.description}
                    onChange={handleProjectFormChange}
                    placeholder="Project goals and notes..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-status">Status</Label>
                  <select
                    id="project-status"
                    name="status"
                    value={projectForm.status}
                    onChange={handleProjectFormChange}
                    className="w-full rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                  >
                    {PROJECT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatProjectStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 border-t border-border/60">
                <Button
                  type="submit"
                  disabled={isSubmittingProject || !projectForm.name.trim()}
                  className="flex-1"
                >
                  {isSubmittingProject ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : projectModalMode === 'edit' ? (
                    'Save Project'
                  ) : (
                    'Create Project'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeProjectModal}
                  disabled={isSubmittingProject}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      ) : null}

      {/* Create Task Modal */}
      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border/60 bg-background/95 shadow-2xl">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>
                  {isProjectScope ? 'Create Task in Project' : 'Create Personal Task'}
                </CardTitle>
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
   