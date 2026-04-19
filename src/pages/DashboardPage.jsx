import { useEffect, useMemo, useState } from 'react'
import { 
  Loader2, 
  FolderOpen, 
  ListTodo, 
  RefreshCw, 
  CheckCircle2, 
  BarChart3, 
  Plus, 
  Settings, 
  LayoutDashboard,
  ArrowUpRight
} from 'lucide-react'
import { getTasks } from '../api/tasks.api'
import { getProjects } from '../api/projects.api'
import useAuth from '../hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'

function getUserId(user) {
  return user?.userId || user?.id || null
}

export default function DashboardPage() {
  const { user } = useAuth()
  const userId = useMemo(() => getUserId(user), [user])

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) {
        setTasks([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        // Fetch both to get the 'Total Projects' count
        const [tasksResponse, projectsResponse] = await Promise.all([
          getTasks({ userId }),
          getProjects() 
        ])
        
        setTasks(Array.isArray(tasksResponse) ? tasksResponse : [])
        setProjects(Array.isArray(projectsResponse) ? projectsResponse : [])
      } catch (apiError) {
        setTasks([])
        setError(apiError.message || 'Failed to load dashboard stats.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [userId])

  const stats = useMemo(() => {
    const todoCount = tasks.filter((task) => task.status === 'TODO').length
    const inProgressCount = tasks.filter((task) => task.status === 'IN_PROGRESS').length
    const doneCount = tasks.filter((task) => task.status === 'DONE').length
    const totalTasks = tasks.length
    const totalProjects = projects.length
    const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0

    return { todoCount, inProgressCount, doneCount, totalTasks, totalProjects, completionRate }
  }, [tasks, projects])

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
      .slice(0, 4)
  }, [projects])

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((left, right) => new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0))
      .slice(0, 4)
  }, [tasks])

  const projectNameById = useMemo(() => {
    return projects.reduce((lookup, project) => {
      if (project?.id) {
        lookup[project.id] = project.name || 'Untitled project'
      }

      return lookup
    }, {})
  }, [projects])

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return '-'

    const parsedDate = new Date(dateValue)
    if (Number.isNaN(parsedDate.getTime())) {
      return '-'
    }

    return parsedDate.toLocaleDateString()
  }

  const formatProjectStatusLabel = (status) => {
    if (status === 'ACTIVE') return 'Active'
    if (status === 'ARCHIVED') return 'Archived'
    if (status === 'COMPLETED') return 'Completed'
    return status || 'Unknown'
  }

  const getProjectStatusBadgeClass = (status) => {
    if (status === 'ACTIVE') {
      return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300 dark:text-emerald-400'
    }

    if (status === 'COMPLETED') {
      return 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300 dark:text-indigo-400'
    }

    if (status === 'ARCHIVED') {
      return 'border-amber-500/30 bg-amber-500/15 text-amber-300 dark:text-amber-400'
    }

    return 'border-border/50 bg-background/60 text-muted-foreground'
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-4 text-left sm:space-y-6 sm:pb-6">
      {/* 1. Header Section */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight !text-foreground">Workspace Overview</h2>
          <p className="text-muted-foreground text-sm mt-1">A high-level summary of your projects, task progress, and recent activity.</p>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {/* 2. Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold text-primary">{stats.totalProjects}</div>
            <p className="text-muted-foreground mt-1 text-[10px] font-medium uppercase tracking-wide">Active Workspaces</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold text-indigo-500">{stats.totalTasks}</div>
            <p className="text-muted-foreground mt-1 text-[10px] font-medium uppercase tracking-wide">{stats.completionRate}% Avg. Completion</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <ListTodo className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold text-slate-500">{stats.todoCount}</div>
            <p className="text-muted-foreground mt-1 text-[10px] font-medium uppercase tracking-wide">Awaiting Start</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <RefreshCw className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold text-blue-500">{stats.inProgressCount}</div>
            <p className="text-muted-foreground mt-1 text-[10px] font-medium uppercase tracking-wide">Currently Active</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
            <CardTitle className="text-sm font-medium">Done</CardTitle>
            <CheckCircle2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold text-emerald-500">{stats.doneCount}</div>
            <p className="text-muted-foreground mt-1 text-[10px] font-medium uppercase tracking-wide">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Quick Actions Section */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="w-full justify-start border-border/50" asChild>
            <Link to="/projects">
              <Plus className="mr-2 h-4 w-4 text-primary" />
              New Project
            </Link>
          </Button>

          <Button variant="outline" className="w-full justify-start border-border/50" asChild>
            <Link to="/tasks">
              <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-400" />
              Open Task Board
            </Link>
          </Button>

          <Button variant="outline" className="w-full justify-start border-border/50" asChild>
            <Link to="/profile">
              <Settings className="mr-2 h-4 w-4 text-slate-400" />
              Profile Settings
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start border-border/50 opacity-50 cursor-not-allowed">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      {/* 4. Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Projects</CardTitle>
            <CardDescription>Your latest uploaded projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentProjects.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No recent projects yet.</p>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/30 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/60 text-muted-foreground">
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{project.name || 'Untitled project'}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.description || formatDateLabel(project.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 rounded-full px-2 py-0 text-[10px] font-semibold ${getProjectStatusBadgeClass(project.status)}`}
                  >
                    {formatProjectStatusLabel(project.status)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Tasks</CardTitle>
            <CardDescription>Latest segmentation and reconstruction tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTasks.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No recent tasks yet.</p>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{task.title || 'Untitled task'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {task.projectId
                        ? `Project: ${projectNameById[task.projectId] || 'Unknown project'}`
                        : 'Standalone task'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-semibold">
                      {task.status === 'TODO' ? 'To Do' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDateLabel(task.updatedAt || task.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}