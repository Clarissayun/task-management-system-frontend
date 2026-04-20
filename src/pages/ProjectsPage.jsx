import React, { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Info,
  FolderPlus,
  Search,
  Filter,
  List,
  LayoutGrid,
  Loader2,
  X,
  FileText,
  BarChart3,
  Calendar,
  Trash2,
  Edit,
  TriangleAlert,
} from 'lucide-react'
import { createProject, deleteProject, updateProject } from '../api/projects.api'
import { getProjectsPaginated } from '../api/projects.api'
import { getTasks } from '../api/tasks.api'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PaginationControls } from '../components/ui/pagination-controls'

const PROJECT_STATUSES = ['ACTIVE', 'ARCHIVED', 'COMPLETED']

function getUserId(user) {
  return user?.userId || user?.id || null
}

// --- Sub-component: Project Card ---
const ProjectCard = ({ project, onDelete, onEdit, onOpen, taskCount = 0, completionRate = 0 }) => {
  return (
    <Card className="flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-md shadow-md transition-all hover:border-primary/50 group h-full">
      <CardHeader className="p-3 pb-2 text-left">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
            <h3 className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {project.name}
            </h3>
            <p className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
              {project.description || "No description"}
            </p>
          </div>
          
          {/* Status Badge*/}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge
              variant="secondary"
              className="bg-foreground/10 text-[10px] font-bold uppercase tracking-widest text-foreground py-0.5"
            >
              {project.status || 'ACTIVE'}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(project._id || project.projectId || project.id)}
              aria-label="Edit project"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-3 pt-2.5 space-y-2.5">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-y-2 text-xs">
          <div>
            <span className="text-xs text-muted-foreground block mb-0.5">Total Tasks:</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
               <FileText className="h-3 w-3 text-primary/70" />
              {taskCount}
            </div>
          </div>
          
          <div className="text-right sm:text-left">
            <span className="text-xs text-muted-foreground block mb-0.5">Completion:</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground sm:justify-start justify-end">
              <BarChart3 className="h-3 w-3 text-green-500/70" />
               {completionRate}%
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block mb-0.5">Created At:</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
               <Calendar className="h-3 w-3 text-blue-500/70" />
               {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="text-right sm:text-left">
            <span className="text-xs text-muted-foreground block mb-0.5">Start Date:</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground sm:justify-start justify-end">
              <Calendar className="h-3 w-3 text-cyan-500/70" />
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block mb-0.5">Due Date:</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Calendar className="h-3 w-3 text-orange-500/70" />
              {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}
            </div>
          </div>
        </div>

        {/* Action Buttons - Primary Row */}
        <div className="flex gap-2 pt-1.5">
          <Button
            size="sm"
            className="h-8 flex-1 border border-border/40 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-zinc-50 shadow-lg shadow-indigo-500/20 transition-all duration-200 transform-gpu hover:-translate-y-0.5 hover:border-primary/50 hover:from-zinc-800 hover:via-zinc-700 hover:to-zinc-800 hover:shadow-xl hover:shadow-indigo-500/35 hover:brightness-110 active:translate-y-0 dark:from-zinc-50 dark:via-zinc-100 dark:to-zinc-50 dark:text-zinc-900 dark:hover:from-zinc-100 dark:hover:via-zinc-200 dark:hover:to-zinc-100 dark:shadow-indigo-500/10"
            onClick={() => onOpen(project._id || project.projectId || project.id)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Open Project
          </Button>
        </div>

        {/* Destructive Action */}
        <Button 
          size="sm" 
          variant="destructive" 
          className="w-full bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-900/50 h-8" 
          onClick={() => onDelete(project._id || project.projectId || project.id, project.name)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete Project
        </Button>
      </CardContent>
    </Card>
  )
}

// --- Main Page Component ---
export default function ProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('grid') // To match the view toggle in your image
  const [projects, setProjects] = useState([])
  const [taskCountsByProjectId, setTaskCountsByProjectId] = useState({})
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingTaskCounts, setIsLoadingTaskCounts] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [startDateFromFilter, setStartDateFromFilter] = useState('')
  const [startDateToFilter, setStartDateToFilter] = useState('')
  const [dueDateFromFilter, setDueDateFromFilter] = useState('')
  const [dueDateToFilter, setDueDateToFilter] = useState('')
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(8)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [projectModalMode, setProjectModalMode] = useState('create')
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState(null)
  const [deletingProjectName, setDeletingProjectName] = useState('')
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const [formError, setFormError] = useState('')
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    dueDate: '',
  })

  const openCreateProject = () => {
    setFormError('')
    setProjectModalMode('create')
    setEditingProjectId(null)
    setProjectForm({
      name: '',
      description: '',
      status: 'ACTIVE',
      startDate: '',
      dueDate: '',
    })
    setIsCreateProjectOpen(true)
  }

  const userId = useMemo(() => getUserId(user), [user])

  const getSortParam = () => {
    if (sortBy === 'alpha') {
      return 'name,asc'
    }

    if (sortBy === 'startDateAsc') {
      return 'startDate,asc'
    }

    if (sortBy === 'dueDateAsc') {
      return 'dueDate,asc'
    }

    return 'createdAt,desc'
  }

  const loadProjects = async (pageToLoad = currentPage) => {
    if (!userId) {
      setProjects([])
      setTotalPages(1)
      setTotalElements(0)
      setIsLoadingProjects(false)
      return
    }

    setIsLoadingProjects(true)
    setProjectsError('')

    try {
      const response = await getProjectsPaginated({
        status: statusFilter !== 'ALL' ? statusFilter : null,
        search: searchQuery.trim() || null,
        startDateFrom: startDateFromFilter || null,
        startDateTo: startDateToFilter || null,
        dueDateFrom: dueDateFromFilter || null,
        dueDateTo: dueDateToFilter || null,
        page: pageToLoad,
        size: pageSize,
        sort: getSortParam(),
      })

      setProjects(Array.isArray(response?.content) ? response.content : [])
      setTotalPages(response?.totalPages || 1)
      setTotalElements(response?.totalElements || 0)
      setCurrentPage(response?.number ?? pageToLoad)
    } catch (apiError) {
      setProjects([])
      setTotalPages(1)
      setTotalElements(0)
      setProjectsError(apiError.message || 'Failed to load projects.')
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const closeCreateProject = () => {
    if (isSubmittingProject) {
      return
    }

    setIsCreateProjectOpen(false)
    setFormError('')
  }

  const handleProjectFormChange = (event) => {
    const { name, value } = event.target

    setProjectForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleCreateProject = async (event) => {
    event.preventDefault()

    if (!projectForm.name.trim()) {
      setFormError('Project name is required.')
      return
    }

    if (!user) {
      setFormError('No active user session found.')
      return
    }

    setIsSubmittingProject(true)
    setFormError('')

    const payload = {
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      status: projectForm.status,
      startDate: projectForm.startDate,
      dueDate: projectForm.dueDate,
    }

    try {
      if (projectModalMode === 'edit' && editingProjectId) {
        const updatedProject = await updateProject(editingProjectId, payload)
      } else {
        await createProject(payload)
      }

      await loadProjects(projectModalMode === 'edit' ? currentPage : 0)
      closeCreateProject()
    } catch (apiError) {
      setFormError(apiError.message || 'Failed to save project.')
    } finally {
      setIsSubmittingProject(false)
    }
  }

  useEffect(() => {
    loadProjects(0)
  }, [
    userId,
    searchQuery,
    sortBy,
    statusFilter,
    startDateFromFilter,
    startDateToFilter,
    dueDateFromFilter,
    dueDateToFilter,
  ])

  useEffect(() => {
    setCurrentPage(0)
  }, [
    searchQuery,
    sortBy,
    statusFilter,
    startDateFromFilter,
    startDateToFilter,
    dueDateFromFilter,
    dueDateToFilter,
  ])

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
    setStartDateFromFilter('')
    setStartDateToFilter('')
    setDueDateFromFilter('')
    setDueDateToFilter('')
    setSortBy('date')
    setIsFilterPopoverOpen(false)
  }

  useEffect(() => {
    const loadTaskCounts = async () => {
      if (!userId) {
        setTaskCountsByProjectId({})
        setIsLoadingTaskCounts(false)
        return
      }

      setIsLoadingTaskCounts(true)

      try {
        const nextCounts = {}

        const results = await Promise.allSettled(
          projects.map((project) => {
            const projectKey = String(project?.id || project?._id || project?.projectId)
            return getTasks({ userId, projectId: projectKey }).then((tasks) => {
              const totalTasks = Array.isArray(tasks) ? tasks.length : 0
              const completedTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'DONE').length : 0
              const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
              return {
                projectKey,
                count: totalTasks,
                completionRate: completionRate,
              }
            })
          })
        )

        results.forEach((result) => {
          if (result.status !== 'fulfilled') {
            return
          }

          nextCounts[result.value.projectKey] = {
            count: result.value.count,
            completionRate: result.value.completionRate,
          }
        })

        setTaskCountsByProjectId(nextCounts)
      } catch {
        setTaskCountsByProjectId({})
      } finally {
        setIsLoadingTaskCounts(false)
      }
    }

    loadTaskCounts()
  }, [projects, userId])

  const visibleProjects = useMemo(() => {
    return projects
  }, [projects])

  const handleDeleteProject = (projectId, projectName) => {
    setProjectsError('')
    setDeletingProjectId(projectId)
    setDeletingProjectName(projectName || 'this project')
    setIsDeleteConfirmOpen(true)
  }

  const handleEditProject = (projectId) => {
    const target = projects.find((project) => {
      const currentId = project?.id || project?._id || project?.projectId
      return String(currentId) === String(projectId)
    })

    if (!target) {
      setProjectsError('Unable to open project for editing.')
      return
    }

    setProjectModalMode('edit')
    setEditingProjectId(projectId)
    setFormError('')
    setProjectForm({
      name: target?.name || '',
      description: target?.description || '',
      status: target?.status || 'ACTIVE',
      startDate: target?.startDate || '',
      dueDate: target?.dueDate || '',
    })
    setIsCreateProjectOpen(true)
  }

  const handleOpenProject = (projectId) => {
    navigate(`/projects/${projectId}`)
  }

  const closeDeleteConfirm = () => {
    if (isDeletingProject) {
      return
    }

    setIsDeleteConfirmOpen(false)
    setDeletingProjectId(null)
    setDeletingProjectName('')
  }

  const confirmDeleteProject = async () => {
    if (!deletingProjectId) {
      return
    }

    setIsDeletingProject(true)
    setProjectsError('')

    try {
      await deleteProject(String(deletingProjectId))
      await loadProjects(currentPage)
      setIsCreateProjectOpen(false)
      setProjectModalMode('create')
      setEditingProjectId(null)
      setFormError('')

      closeDeleteConfirm()
    } catch (apiError) {
      setProjectsError(apiError.message || 'Failed to delete project.')
    } finally {
      setIsDeletingProject(false)
    }
  }

  return (
    <div className="space-y-5 pb-4 text-left sm:space-y-6 sm:pb-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight !text-foreground">My Projects</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your task management projects
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Create New Project Button */}
          <Button 
            onClick={openCreateProject}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:flex font-semibold shadow-sm"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
          
          <Button 
            onClick={openCreateProject}
            className="sm:hidden h-10 w-10 p-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 2. Project Management Info Alert*/}
      <Alert className="bg-card/50 backdrop-blur-md border-border/50 py-4 pl-5 shadow-md transition-colors">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div className="ml-2">
          <AlertTitle className="text-[15px] font-bold text-foreground mb-1">
            Project Management:
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
            Create projects to group related tasks together. Use the 
            <span className="bg-secondary text-secondary-foreground mx-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-tighter shadow-sm">
              Priority
            </span> 
            and 
            <span className="bg-secondary text-secondary-foreground mx-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-tighter shadow-sm">
              Status
            </span> 
            tags to track your progress. 
            <span className="ml-1">
              Deleting a project will also remove all tasks associated with it.
            </span>
          </AlertDescription>
        </div>
      </Alert>
     
      {/* 3. Search and Sort Filter Bar*/}
      <div className="space-y-3 rounded-xl border border-border/50 p-2">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search projects by name or desc..." 
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9 bg-background/50 border-muted/20 focus-visible:ring-primary/50"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-medium text-muted-foreground hidden lg:inline">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] bg-transparent border-muted/20">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date Added</SelectItem>
              <SelectItem value="alpha">Name (A to Z)</SelectItem>
              <SelectItem value="startDateAsc">Start Date (Earliest)</SelectItem>
              <SelectItem value="dueDateAsc">Due Date (Earliest)</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="h-9 border-muted/20 bg-transparent"
              onClick={() => setIsFilterPopoverOpen((open) => !open)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>

            {isFilterPopoverOpen ? (
              <Card className="absolute right-0 top-11 z-20 w-[330px] border-border/60 bg-background/95 shadow-2xl">
                <CardContent className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-transparent border-muted/20">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        {PROJECT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Category A: Project Timeline (Start Date)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={startDateFromFilter}
                        onChange={(event) => setStartDateFromFilter(event.target.value)}
                        className="bg-background/50 border-muted/20"
                        aria-label="Project start date from"
                      />
                      <Input
                        type="date"
                        value={startDateToFilter}
                        onChange={(event) => setStartDateToFilter(event.target.value)}
                        className="bg-background/50 border-muted/20"
                        aria-label="Project start date to"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Category B: Deadlines (Due Date)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={dueDateFromFilter}
                        onChange={(event) => setDueDateFromFilter(event.target.value)}
                        className="bg-background/50 border-muted/20"
                        aria-label="Project due date from"
                      />
                      <Input
                        type="date"
                        value={dueDateToFilter}
                        onChange={(event) => setDueDateToFilter(event.target.value)}
                        className="bg-background/50 border-muted/20"
                        aria-label="Project due date to"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={clearFilters}>
                      Clear
                    </Button>
                    <Button type="button" className="flex-1" onClick={() => setIsFilterPopoverOpen(false)}>
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <span className="text-xs font-medium text-muted-foreground">View:</span>

          {/* View Toggle */}
          <div className="flex items-center border border-muted/20 rounded-lg overflow-hidden bg-transparent">
             <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-9 w-9 rounded-none"
                onClick={() => setViewMode('grid')}
              >
               <LayoutGrid className="h-4 w-4" />
             </Button>
             <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-9 w-9 rounded-none border-l border-muted/20"
                onClick={() => setViewMode('list')}
              >
               <List className="h-4 w-4" />
             </Button>
          </div>

        </div>
        </div>
      </div>

      {/* 4. Project View */}
      {viewMode === 'list' ? (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-foreground/5">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Total Tasks</th>
                  <th className="px-4 py-3 font-semibold">Completion</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Start Date</th>
                  <th className="px-4 py-3 font-semibold">Due Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.length === 0 ? (
                  <tr className="border-t border-border/30">
                    <td colSpan={6} className="px-4 py-8">
                      <button
                        type="button"
                        onClick={openCreateProject}
                        className="mx-auto flex w-full max-w-sm flex-col items-center justify-center rounded-xl border-2 border-dashed border-foreground/30 bg-card/30 px-4 py-6 text-center transition-colors hover:border-primary/60"
                      >
                        <Plus className="mb-2 h-6 w-6 text-foreground/70" />
                        <span className="text-sm font-semibold text-foreground">Create New Project</span>
                        <span className="mt-1 text-xs text-muted-foreground">Start a new task grouping</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  visibleProjects.map((project) => {
                    const projectId = project?.id || project?._id || project?.projectId
                    const projectTaskData = taskCountsByProjectId[String(projectId)] ?? { count: 0, completionRate: 0 }
                    const totalTasks = projectTaskData.count ?? 0
                    const completionRate = projectTaskData.completionRate ?? 0

                    return (
                      <tr
                        key={projectId}
                        className="border-t border-border/30 transition-colors hover:bg-foreground/5"
                      >
                        <td className="px-4 py-3 align-middle">
                          <div className="max-w-[260px]">
                            <p className="truncate font-semibold text-foreground">{project.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {project.description || 'No description'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <Badge
                            variant="secondary"
                            className="bg-foreground/10 text-[10px] font-bold uppercase tracking-widest text-foreground py-0.5"
                          >
                            {project.status || 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-middle font-medium text-foreground">{totalTasks}</td>
                        <td className="px-4 py-3 align-middle font-medium text-foreground">
                          {completionRate}%
                        </td>
                        <td className="px-4 py-3 align-middle text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 align-middle text-muted-foreground">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 align-middle text-muted-foreground">
                          {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleOpenProject(projectId)}
                            >
                              Open
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8"
                              onClick={() => handleEditProject(projectId)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteProject(projectId, project.name)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.length === 0 ? (
            <div
              role="button"
              tabIndex={0}
              onClick={openCreateProject}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openCreateProject()
                }
              }}
              className="h-48 rounded-2xl border-2 border-dashed border-foreground/35 bg-card/30 flex flex-col items-center justify-center text-foreground/90 hover:border-primary/60 transition-colors cursor-pointer group"
            >
              <Plus className="h-6 w-6 mb-2 text-foreground/70 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold tracking-tight">Create New Project</p>
              <p className="text-xs text-muted-foreground mt-1">Start a new task grouping</p>
            </div>
          ) : null}

          {visibleProjects.map((project) => {
            const projectKey = String(project?.id || project?._id || project?.projectId)
            const projectTaskData = taskCountsByProjectId[projectKey] ?? { count: 0, completionRate: 0 }
            return (
              <ProjectCard
                key={projectKey}
                project={project}
                onDelete={handleDeleteProject}
                onEdit={handleEditProject}
                onOpen={handleOpenProject}
                taskCount={projectTaskData.count ?? 0}
                completionRate={projectTaskData.completionRate ?? 0}
              />
            )
          })}
        </div>
      )}

      {!isLoadingProjects && projects.length > 0 ? (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          isLoading={isLoadingProjects}
          onPageChange={(nextPage) => loadProjects(nextPage)}
        />
      ) : null}

      {isLoadingProjects || isLoadingTaskCounts ? (
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      ) : null}
      {projectsError ? <p className="text-sm text-destructive">{projectsError}</p> : null}
      {!isLoadingProjects && !projectsError && visibleProjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects found yet.</p>
      ) : null}

      {isCreateProjectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border/60 bg-background/95 shadow-2xl">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>
                  {projectModalMode === 'edit' ? 'Edit Project' : 'Create New Project'}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeCreateProject}
                  disabled={isSubmittingProject}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={handleCreateProject} className="space-y-4">
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project-start-date">Start Date</Label>
                    <Input
                      id="project-start-date"
                      name="startDate"
                      type="date"
                      value={projectForm.startDate}
                      onChange={handleProjectFormChange}
                      className="rounded-lg border-border/70 bg-background/50 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-due-date">Due Date</Label>
                    <Input
                      id="project-due-date"
                      name="dueDate"
                      type="date"
                      value={projectForm.dueDate}
                      onChange={handleProjectFormChange}
                      className="rounded-lg border-border/70 bg-background/50 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
                    />
                  </div>
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
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
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
                  ) : (
                    projectModalMode === 'edit' ? 'Save Project' : 'Create Project'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeCreateProject}
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

      {isDeleteConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border/60 bg-background/95 shadow-2xl">
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="text-left text-lg">Warning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-left">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <TriangleAlert className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete <span className="font-semibold text-foreground">{deletingProjectName}</span>?
                </p>
                <p className="text-sm text-destructive">
                  This will permanently delete the project and all tasks inside it.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 border-t border-border/40 pt-4">
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={confirmDeleteProject}
                disabled={isDeletingProject}
              >
                {isDeletingProject ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={closeDeleteConfirm}
                disabled={isDeletingProject}
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
