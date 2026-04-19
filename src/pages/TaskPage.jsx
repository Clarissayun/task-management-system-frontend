import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpRight, Edit, Filter, FolderOpen, LayoutGrid, List, Loader2, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { getProjects } from '../api/projects.api'
import { deleteTask, getTasksPaginated, saveTask, updateTask, updateTaskStatus } from '../api/tasks.api'
import useAuth from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../components/ui/select'
import { PaginationControls } from '../components/ui/pagination-controls'
import PriorityBadge from '../components/dashboard/PriorityBadge'
import StatusBadge from '../components/dashboard/StatusBadge'

const TASK_STATUS_FLOW = ['TODO', 'IN_PROGRESS', 'DONE']
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

function getUserId(user) {
	return user?.userId || user?.id || null
}

function formatDate(dateValue) {
	if (!dateValue) return '-'
	const parsedDate = new Date(dateValue)
	return Number.isNaN(parsedDate.getTime()) ? dateValue : parsedDate.toLocaleDateString()
}

function toDateInputValue(dateValue) {
	if (!dateValue) {
		return ''
	}

	const parsedDate = new Date(dateValue)
	if (Number.isNaN(parsedDate.getTime())) {
		return ''
	}

	const year = parsedDate.getFullYear()
	const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
	const day = String(parsedDate.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function getTodayDateInputValue() {
	return toDateInputValue(new Date())
}

function getNextTaskStatus(status) {
	const currentIndex = TASK_STATUS_FLOW.indexOf(status)
	if (currentIndex === -1) {
		return 'TODO'
	}

	return TASK_STATUS_FLOW[(currentIndex + 1) % TASK_STATUS_FLOW.length]
}

function formatTaskStatusLabel(status) {
	if (status === 'TODO') return 'To Do'
	if (status === 'IN_PROGRESS') return 'In Progress'
	if (status === 'DONE') return 'Done'
	return status || 'To Do'
}

const BOARD_PAGE_SIZE = 6
const LIST_PAGE_SIZE = 8
const BOARD_STATUS_KEYS = ['TODO', 'IN_PROGRESS', 'DONE']

function createEmptyBoardPageState() {
	return BOARD_STATUS_KEYS.reduce(
		(accumulator, status) => ({
			...accumulator,
			[status]: {
				items: [],
				page: 0,
				totalPages: 1,
				totalElements: 0,
				isLoading: false,
			},
		}),
		{}
	)
}

function TaskCard({
	task,
	projectLabel,
	taskStartDate = null,
	onEdit,
	onAdvanceStatus,
	onDelete,
	isEditing = false,
	isUpdating = false,
	isDeleting = false,
	draggable = false,
	onDragStart,
}) {
	const nextStatus = getNextTaskStatus(task?.status)
	const taskId = task?.id || task?._id

	return (
		<Card
			className="group/card flex h-full flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-md shadow-md transition-all hover:border-primary/50"
			draggable={draggable}
			onDragStart={onDragStart}
			data-task-id={taskId}
		>
			<CardHeader className="space-y-1.5 p-4 pb-2 text-left">
				<div className="flex items-center justify-between gap-2 overflow-hidden">
					<Badge
						variant="secondary"
						className="h-5 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-none hover:bg-primary/20"
					>
						{projectLabel}
					</Badge>
					{task?.projectId ? (
						<Link
							to={`/projects/${task.projectId}`}
							className="opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100"
							title="Open project"
							aria-label={`Open project ${projectLabel}`}
						>
							<Button
								type="button"
								size="sm"
								variant="ghost"
								className="h-7 shrink-0 gap-1 border border-border/40 bg-background/40 px-2 text-[11px] font-medium 0"
							>
								<FolderOpen className="h-3.5 w-3.5" />
								Open Project
							</Button>
						</Link>
					) : null}
				</div>
				<div className="flex items-start justify-between gap-1.5 overflow-hidden">
					<div className="min-w-0 flex-1 overflow-hidden">
						<h3 className="truncate text-base font-semibold leading-tight text-foreground" title={task?.title || 'Untitled task'}>
							{task?.title || 'Untitled task'}
						</h3>
						<p className="mt-0.5 truncate text-xs leading-snug text-muted-foreground" title={task?.description || 'No description'}>
							{task?.description || 'No description'}
						</p>
					</div>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="h-7 w-7 shrink-0"
						onClick={() => onEdit(task)}
						disabled={isEditing}
						aria-label="Edit task"
					>
						{isEditing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit className="h-3.5 w-3.5" />}
					</Button>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<StatusBadge status={task?.status} />
					<PriorityBadge priority={task?.priority} />
				</div>
			</CardHeader>

			<CardContent className="space-y-2 p-4 pt-2 text-xs">
				<div className="grid grid-cols-2 gap-3">
					<div>
						<p className="text-muted-foreground">Start</p>
						<p className="font-medium text-foreground">{formatDate(taskStartDate)}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Due</p>
						<p className="font-medium text-foreground">{formatDate(task?.dueDate)}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Created</p>
						<p className="font-medium text-foreground">{formatDate(task?.createdAt)}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Updated</p>
						<p className="font-medium text-foreground">{formatDate(task?.updatedAt)}</p>
					</div>
				</div>
			</CardContent>

			<CardFooter className="mt-auto grid grid-cols-2 gap-2 border-t border-border/60 bg-transparent p-4">
				<Button
					type="button"
					size="sm"
					variant="outline"
					className="h-8"
					onClick={() => onAdvanceStatus(task)}
					disabled={isUpdating}
				>
					{isUpdating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
					{`Set ${formatTaskStatusLabel(nextStatus)}`}
				</Button>

				<Button
					type="button"
					size="sm"
					variant="destructive"
					className="h-8"
					onClick={() => onDelete(task)}
					disabled={isDeleting}
				>
					{isDeleting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
					Delete
				</Button>
			</CardFooter>
		</Card>
	)
}

export default function TaskPage() {
	const { user } = useAuth()
	const userId = useMemo(() => getUserId(user), [user])

	const [tasks, setTasks] = useState([])
	const [listTasks, setListTasks] = useState([])
	const [projects, setProjects] = useState([])
	const [viewMode, setViewMode] = useState('board')
	const [searchQuery, setSearchQuery] = useState('')
	const [listStatusFilter, setListStatusFilter] = useState('ALL')
	const [priorityFilter, setPriorityFilter] = useState('ALL')
	const [dueDateFromFilter, setDueDateFromFilter] = useState('')
	const [dueDateToFilter, setDueDateToFilter] = useState('')
	const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false)
	const [sortBy, setSortBy] = useState('updated')
	const [isLoading, setIsLoading] = useState(true)
	const [isLoadingList, setIsLoadingList] = useState(false)
	const [error, setError] = useState('')
	const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
	const [isSubmittingTask, setIsSubmittingTask] = useState(false)
	const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
	const [isSavingTask, setIsSavingTask] = useState(false)
	const [editingTaskId, setEditingTaskId] = useState(null)
	const [createTargetStatus, setCreateTargetStatus] = useState('TODO')
	const [pendingDeleteTask, setPendingDeleteTask] = useState(null)
	const [updatingTaskId, setUpdatingTaskId] = useState(null)
	const [deletingTaskId, setDeletingTaskId] = useState(null)
	const [boardPages, setBoardPages] = useState(() => createEmptyBoardPageState())
	const [listPage, setListPage] = useState(0)
	const [listTotalPages, setListTotalPages] = useState(1)
	const [listTotalElements, setListTotalElements] = useState(0)
	const [taskForm, setTaskForm] = useState({
		title: '',
		description: '',
		priority: 'LOW',
		dueDate: '',
	})
	const [editTaskForm, setEditTaskForm] = useState({
		title: '',
		description: '',
		priority: 'LOW',
		dueDate: '',
	})

	const getSortParam = () => {
		if (sortBy === 'created') {
			return 'createdAt,desc'
		}

		if (sortBy === 'dueDate') {
			return 'dueDate,asc'
		}

		return 'updatedAt,desc'
	}

	const buildTaskFilters = () => ({
		search: searchQuery.trim() || null,
		priority: priorityFilter !== 'ALL' ? priorityFilter : null,
		dueDateFrom: dueDateFromFilter || null,
		dueDateTo: dueDateToFilter || null,
		sort: getSortParam(),
	})

	const loadProjectsAndFirstBoardPages = async () => {
		if (!userId) {
			setIsLoading(false)
			setProjects([])
			setTasks([])
			setBoardPages(createEmptyBoardPageState())
			return
		}

		setIsLoading(true)
		setError('')

		try {
			const projectsResponse = await getProjects()
			const nextProjects = Array.isArray(projectsResponse) ? projectsResponse : []
			setProjects(nextProjects)

			const boardResults = await Promise.all(
				BOARD_STATUS_KEYS.map(async (status) => {
					const response = await getTasksPaginated({
						userId,
						status,
						page: 0,
						size: BOARD_PAGE_SIZE,
						...buildTaskFilters(),
					})
					return [status, {
						items: Array.isArray(response?.content) ? response.content : [],
						page: response?.number ?? 0,
						totalPages: response?.totalPages || 1,
						totalElements: response?.totalElements || 0,
						isLoading: false,
					}]
				})
			)

			const nextBoardPages = createEmptyBoardPageState()
			boardResults.forEach(([status, pageData]) => {
				nextBoardPages[status] = pageData
			})

			setBoardPages(nextBoardPages)
			setTasks(
				BOARD_STATUS_KEYS.flatMap((status) => nextBoardPages[status].items)
			)
		} catch (apiError) {
			setProjects([])
			setTasks([])
			setBoardPages(createEmptyBoardPageState())
			setError(apiError.message || 'Failed to load tasks.')
		} finally {
			setIsLoading(false)
		}
	}

	const loadListPage = async (pageToLoad = listPage) => {
		if (!userId) {
			setListTasks([])
			setListPage(0)
			setListTotalPages(1)
			setListTotalElements(0)
			return
		}

		setIsLoadingList(true)

		try {
			const response = await getTasksPaginated({
				userId,
				status: listStatusFilter !== 'ALL' ? listStatusFilter : null,
				page: pageToLoad,
				size: LIST_PAGE_SIZE,
				...buildTaskFilters(),
			})
			setListTasks(Array.isArray(response?.content) ? response.content : [])
			setListPage(response?.number ?? pageToLoad)
			setListTotalPages(response?.totalPages || 1)
			setListTotalElements(response?.totalElements || 0)
		} catch (apiError) {
			setListTasks([])
			setListPage(0)
			setListTotalPages(1)
			setListTotalElements(0)
			setError(apiError.message || 'Failed to load tasks.')
		} finally {
			setIsLoadingList(false)
		}
	}

	const reloadTaskViews = async ({ listPageToLoad = listPage } = {}) => {
		await Promise.all([loadProjectsAndFirstBoardPages(), loadListPage(listPageToLoad)])
	}

	useEffect(() => {
		reloadTaskViews({ listPageToLoad: 0 })
	}, [userId, searchQuery, listStatusFilter, priorityFilter, dueDateFromFilter, dueDateToFilter, sortBy])

		const projectNameById = useMemo(() => {
			return projects.reduce((lookup, project) => {
				const projectId = project?.id || project?._id || project?.projectId
				if (projectId) {
					lookup[String(projectId)] = project?.name || 'Untitled project'
				}
				return lookup
			}, {})
		}, [projects])

		const projectStartDateById = useMemo(() => {
			return projects.reduce((lookup, project) => {
				const projectId = project?.id || project?._id || project?.projectId
				if (projectId) {
					lookup[String(projectId)] = project?.startDate || null
				}
				return lookup
			}, {})
		}, [projects])

		const projectDueDateById = useMemo(() => {
			return projects.reduce((lookup, project) => {
				const projectId = project?.id || project?._id || project?.projectId
				if (projectId) {
					lookup[String(projectId)] = project?.dueDate || null
				}
				return lookup
			}, {})
		}, [projects])

		const todayDateInput = useMemo(() => getTodayDateInputValue(), [])

		const getTaskProjectLabel = (task) => {
			const projectId = task?.projectId
			if (!projectId) {
				return 'Personal'
			}

			return projectNameById[String(projectId)] || 'Project'
		}

		const getTaskStartDate = (task) => {
			if (task?.startDate) {
				return task.startDate
			}

			if (!task?.projectId) {
				return null
			}

			return projectStartDateById[String(task.projectId)] || null
		}

		const getTaskCreationDateInput = (task) => toDateInputValue(task?.createdAt)

		const getTaskEditMinDueDate = (task) => {
			const creationDate = getTaskCreationDateInput(task)
			const projectStartDate = task?.projectId
				? projectStartDateById[String(task.projectId)] || ''
				: ''
			const minimumDate = [creationDate, projectStartDate, todayDateInput]
				.filter(Boolean)
				.reduce((latest, current) => (current > latest ? current : latest), '')

			return minimumDate || todayDateInput
		}

		const getTaskEditMaxDueDate = (task) => {
			if (!task?.projectId) {
				return ''
			}

			return projectDueDateById[String(task.projectId)] || ''
		}

		const validateTaskDueDate = ({ dueDate, projectId = null, minimumDueDate = todayDateInput }) => {
			if (!dueDate) {
				return 'Task due date is required.'
			}

			if (minimumDueDate && dueDate < minimumDueDate) {
				return 'Task due date cannot be before task creation date.'
			}

			if (projectId) {
				const projectDueDate = projectDueDateById[String(projectId)]
				if (projectDueDate && dueDate > projectDueDate) {
					return 'Task due date cannot be after project due date.'
				}
			}

			return ''
		}

		const editingTask = useMemo(
			() => tasks.find((task) => String(task?.id || task?._id) === String(editingTaskId)) || null,
			[tasks, editingTaskId]
		)

		const editTaskMinDueDate = useMemo(
			() => (editingTask ? getTaskEditMinDueDate(editingTask) : todayDateInput),
			[editingTask, todayDateInput]
		)

		const editTaskMaxDueDate = useMemo(
			() => (editingTask ? getTaskEditMaxDueDate(editingTask) : ''),
			[editingTask, projectDueDateById]
		)

	const taskCounts = useMemo(() => {
		const total = tasks.length
		const completed = tasks.filter((task) => task.status === 'DONE').length
		const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length
		const todo = tasks.filter((task) => task.status === 'TODO').length

		return { total, completed, inProgress, todo }
	}, [tasks])

	const boardTasks = useMemo(
		() => ({
			TODO: boardPages.TODO.items,
			IN_PROGRESS: boardPages.IN_PROGRESS.items,
			DONE: boardPages.DONE.items,
		}),
		[boardPages]
	)

	const appendBoardPage = async (status) => {
		setBoardPages((current) => ({
			...current,
			[status]: {
				...current[status],
				isLoading: true,
			},
		}))

		try {
			const nextPage = boardPages[status].page + 1
			const response = await getTasksPaginated({
				userId,
				status,
				page: nextPage,
				size: BOARD_PAGE_SIZE,
				...buildTaskFilters(),
			})

			setBoardPages((current) => ({
				...current,
				[status]: {
					items: [...current[status].items, ...(Array.isArray(response?.content) ? response.content : [])],
					page: response?.number ?? nextPage,
					totalPages: response?.totalPages || current[status].totalPages,
					totalElements: response?.totalElements || current[status].totalElements,
					isLoading: false,
				},
			}))
			setTasks((current) => {
				const merged = new Map(current.map((task) => [String(task?.id || task?._id), task]))
				;(Array.isArray(response?.content) ? response.content : []).forEach((task) => {
					const taskId = task?.id || task?._id
					if (taskId) {
						merged.set(String(taskId), task)
					}
				})
				return Array.from(merged.values())
			})
		} catch (apiError) {
			setError(apiError.message || 'Failed to load more tasks.')
			setBoardPages((current) => ({
				...current,
				[status]: {
					...current[status],
					isLoading: false,
				},
			}))
		}
	}

	const openCreateTask = (targetStatus = 'TODO') => {
		const safeTargetStatus = typeof targetStatus === 'string' && BOARD_STATUS_KEYS.includes(targetStatus)
			? targetStatus
			: 'TODO'

		setTaskForm({
			title: '',
			description: '',
			priority: 'LOW',
			dueDate: '',
		})
		setCreateTargetStatus(safeTargetStatus)
		setIsCreateTaskOpen(true)
	}

	const closeCreateTask = () => {
		if (isSubmittingTask) {
			return
		}

		setIsCreateTaskOpen(false)
		setCreateTargetStatus('TODO')
	}

	const handleTaskFormChange = (event) => {
		const { name, value } = event.target

		setTaskForm((currentForm) => ({
			...currentForm,
			[name]: value,
		}))
	}

	const handleCreateTask = async (event) => {
		event.preventDefault()

		if (!userId) {
			setError('Unable to identify the current user.')
			return
		}

		if (!taskForm.title.trim()) {
			setError('Task title is required.')
			return
		}

		if (!taskForm.dueDate) {
			setError('Task due date is required.')
			return
		}

		const createDueDateError = validateTaskDueDate({
			dueDate: taskForm.dueDate,
			minimumDueDate: todayDateInput,
		})
		if (createDueDateError) {
			setError(createDueDateError)
			return
		}

		setIsSubmittingTask(true)
		setError('')

		try {
			const createdTask = await saveTask({
				userId,
				title: taskForm.title.trim(),
				description: taskForm.description.trim(),
				priority: taskForm.priority,
				dueDate: taskForm.dueDate,
			})

			const createdTaskId = createdTask?.id || createdTask?._id
			let finalTask = createdTask

			if (createdTaskId && createTargetStatus !== 'TODO') {
				await updateTaskStatus(createdTaskId, createTargetStatus)
				finalTask = {
					...createdTask,
					status: createTargetStatus,
					updatedAt: new Date().toISOString(),
				}
			}

			if (finalTask) {
				await reloadTaskViews({ listPageToLoad: 0 })
			}

			setIsCreateTaskOpen(false)
			setCreateTargetStatus('TODO')
			setTaskForm({
				title: '',
				description: '',
				priority: 'LOW',
				dueDate: '',
			})
		} catch (apiError) {
			setError(apiError.message || 'Failed to create task.')
		} finally {
			setIsSubmittingTask(false)
		}
	}

	const openEditTask = (task) => {
		const taskId = task?.id || task?._id
		if (!taskId) {
			return
		}

		setEditingTaskId(taskId)
		setEditTaskForm({
			title: task?.title || '',
			description: task?.description || '',
			priority: task?.priority || 'LOW',
			dueDate: task?.dueDate || '',
		})
		setIsEditTaskOpen(true)
	}

	const closeEditTask = () => {
		if (isSavingTask) {
			return
		}

		setIsEditTaskOpen(false)
		setEditingTaskId(null)
	}

	const handleEditTaskFormChange = (event) => {
		const { name, value } = event.target

		setEditTaskForm((currentForm) => ({
			...currentForm,
			[name]: value,
		}))
	}

	const handleSaveTask = async (event) => {
		event.preventDefault()

		if (!editingTaskId || !editTaskForm.title.trim()) {
			return
		}

		if (!editTaskForm.dueDate) {
			setError('Task due date is required.')
			return
		}

		const existingTask = editingTask
		const editDueDateError = validateTaskDueDate({
			dueDate: editTaskForm.dueDate,
			projectId: existingTask?.projectId || null,
			minimumDueDate: existingTask ? getTaskEditMinDueDate(existingTask) : todayDateInput,
		})
		if (editDueDateError) {
			setError(editDueDateError)
			return
		}

		setIsSavingTask(true)
		setError('')

		try {
			const payload = {
				title: editTaskForm.title.trim(),
				description: editTaskForm.description.trim(),
				priority: editTaskForm.priority,
				dueDate: editTaskForm.dueDate,
			}

			if (existingTask?.projectId) {
				payload.projectId = existingTask.projectId
			}

			await updateTask(editingTaskId, payload)

			setIsEditTaskOpen(false)
			setEditingTaskId(null)
			await reloadTaskViews()
		} catch (apiError) {
			setError(apiError.message || 'Failed to update task.')
		} finally {
			setIsSavingTask(false)
		}
	}

	const handleAdvanceTaskStatus = async (task) => {
		const taskId = task?.id || task?._id
		if (!taskId) {
			return
		}

		const nextStatus = getNextTaskStatus(task?.status)

		setUpdatingTaskId(taskId)
		setError('')

		try {
			await updateTaskStatus(taskId, nextStatus)
			await reloadTaskViews()
		} catch (apiError) {
			setError(apiError.message || 'Failed to update task status.')
		} finally {
			setUpdatingTaskId(null)
		}
	}

	const handleDeleteTask = (task) => {
		const taskId = task?.id || task?._id
		if (!taskId) {
			return
		}

		setPendingDeleteTask(task)
	}

	const closeDeleteTaskModal = () => {
		const pendingTaskId = pendingDeleteTask?.id || pendingDeleteTask?._id
		if (pendingTaskId && String(deletingTaskId) === String(pendingTaskId)) {
			return
		}

		setPendingDeleteTask(null)
	}

	const confirmDeleteTask = async () => {
		const taskId = pendingDeleteTask?.id || pendingDeleteTask?._id
		if (!taskId) {
			return
		}

		setDeletingTaskId(taskId)
		setError('')

		try {
			await deleteTask(taskId)
			await reloadTaskViews()
			setPendingDeleteTask(null)
		} catch (apiError) {
			setError(apiError.message || 'Failed to delete task.')
		} finally {
			setDeletingTaskId(null)
		}
	}

	const handleTaskDragStart = (event, taskId) => {
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('text/plain', String(taskId))
	}

	const handleTaskDropToStatus = async (event, nextStatus) => {
		event.preventDefault()

		const droppedTaskId = event.dataTransfer.getData('text/plain')
		if (!droppedTaskId) {
			return
		}

		const droppedTask = tasks.find(
			(item) => String(item?.id || item?._id) === String(droppedTaskId)
		)

		if (!droppedTask || droppedTask.status === nextStatus) {
			return
		}

		setUpdatingTaskId(droppedTaskId)
		setError('')

		try {
			await updateTaskStatus(droppedTaskId, nextStatus)
			await reloadTaskViews()
		} catch (apiError) {
			setError(apiError.message || 'Failed to move task.')
		} finally {
			setUpdatingTaskId(null)
		}
	}

	const pendingDeleteTaskId = pendingDeleteTask?.id || pendingDeleteTask?._id
	const isConfirmingDelete =
		pendingDeleteTaskId && String(deletingTaskId) === String(pendingDeleteTaskId)

	const clearTaskFilters = () => {
		setSearchQuery('')
		setListStatusFilter('ALL')
		setPriorityFilter('ALL')
		setDueDateFromFilter('')
		setDueDateToFilter('')
		setSortBy('updated')
		setIsFilterPopoverOpen(false)
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
			<div className="space-y-3">
				<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-1">
						<h2 className="text-3xl font-bold tracking-tight !text-foreground">Global Task Board</h2>
						<p className="text-muted-foreground text-sm mt-1">All tasks owned by your account across projects and standalone work.</p>
					</div>
					<Button
						type="button"
						className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 transform-gpu hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35 active:translate-y-0 sm:w-auto"
						size="default"
						style={{ alignSelf: 'flex-start' }}
						onClick={() => openCreateTask('TODO')}
					>
						<Plus className="h-4 w-4" />
						Add New Task
					</Button>
				</div>
			</div>
			
			{error ? <p className="text-sm text-destructive">{error}</p> : null}

			<section className="space-y-3">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-xl font-semibold tracking-tight !text-foreground">Tasks</h2>
				</div>

				<div className="space-y-3 rounded-xl border border-border/50 p-2">
					<div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
						<div className="relative w-full sm:max-w-sm">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search by title or description..."
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								className="pl-9 bg-background/50 border-muted/20"
							/>
						</div>

						<div className="flex items-center gap-3 w-full sm:w-auto">
							<span className="text-xs font-medium text-muted-foreground hidden lg:inline">Sort by:</span>
							<Select value={sortBy} onValueChange={setSortBy}>
								<SelectTrigger className="w-[180px] bg-transparent border-muted/20">
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="updated">Updated (Newest)</SelectItem>
									<SelectItem value="created">Created (Newest)</SelectItem>
									<SelectItem value="dueDate">Due Date (Earliest)</SelectItem>
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
									<Card className="absolute right-0 top-11 z-20 w-[320px] border-border/60 bg-background/95 shadow-2xl">
										<CardContent className="space-y-4 p-4">
											<div className="space-y-2">
												{viewMode === 'list' ? (
													<div className="space-y-2">
														<Label className="text-xs font-semibold text-muted-foreground">Status (List View)</Label>
														<Select value={listStatusFilter} onValueChange={setListStatusFilter}>
															<SelectTrigger className="bg-transparent border-muted/20">
																<SelectValue placeholder="Status" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="ALL">All Statuses</SelectItem>
																{BOARD_STATUS_KEYS.map((status) => (
																	<SelectItem key={status} value={status}>
																		{formatTaskStatusLabel(status)}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												) : null}
											</div>

											<div className="space-y-2">
												<Label className="text-xs font-semibold text-muted-foreground">Priority</Label>
												<Select value={priorityFilter} onValueChange={setPriorityFilter}>
													<SelectTrigger className="bg-transparent border-muted/20">
														<SelectValue placeholder="Priority" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="ALL">All Priorities</SelectItem>
														{TASK_PRIORITIES.map((priority) => (
															<SelectItem key={priority} value={priority}>
																{priority}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<Label className="text-xs font-semibold text-muted-foreground">Due Date Range</Label>
												<div className="grid grid-cols-2 gap-2">
													<Input
														type="date"
														value={dueDateFromFilter}
														onChange={(event) => setDueDateFromFilter(event.target.value)}
														aria-label="Task due date from"
													/>
													<Input
														type="date"
														value={dueDateToFilter}
														onChange={(event) => setDueDateToFilter(event.target.value)}
														aria-label="Task due date to"
													/>
												</div>
											</div>

											<div className="flex gap-2">
												<Button type="button" variant="outline" className="flex-1" onClick={clearTaskFilters}>
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
							<div className="flex items-center overflow-hidden rounded-lg border border-muted/20 bg-transparent">
								<Button
									type="button"
									size="sm"
									variant={viewMode === 'board' ? 'secondary' : 'ghost'}
									className="h-9 w-9 rounded-none"
									onClick={() => setViewMode('board')}
									aria-label="Board view"
								>
									<LayoutGrid className="h-4 w-4" />
								</Button>
								<Button
									type="button"
									size="sm"
									variant={viewMode === 'list' ? 'secondary' : 'ghost'}
									className="h-9 w-9 rounded-none border-l border-muted/20"
									onClick={() => setViewMode('list')}
									aria-label="List view"
								>
									<List className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>

				{(viewMode === 'list' ? listTasks.length === 0 : tasks.length === 0) ? (
					<Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-sm">
						<CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
							<p>No tasks yet.</p>
							<Button type="button" size="sm" onClick={() => openCreateTask('TODO')}>
								<Plus className="mr-1.5 h-3.5 w-3.5" />
								Add New Task
							</Button>
						</CardContent>
					</Card>
				) : viewMode === 'board' ? (
					<div className="overflow-x-auto">
						<div className="grid min-w-[920px] grid-cols-3 gap-4">
							<section
								className="rounded-xl border border-border/60 bg-card/35 p-3"
								onDragOver={(event) => event.preventDefault()}
								onDrop={(event) => handleTaskDropToStatus(event, 'TODO')}
							>
								<div className="mb-3 flex items-center justify-between">
									<h3 className="text-sm font-semibold text-foreground">To Do</h3>
									<Badge variant="secondary" className="h-5 px-2 text-[10px] font-semibold">
										{taskCounts.todo}
									</Badge>
								</div>
								<div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
									{boardTasks.TODO.map((task) => {
										const taskId = task?.id || task?._id

										return (
											<TaskCard
												key={taskId}
												task={task}
												projectLabel={getTaskProjectLabel(task)}
														taskStartDate={getTaskStartDate(task)}
												onEdit={openEditTask}
												onAdvanceStatus={handleAdvanceTaskStatus}
												onDelete={handleDeleteTask}
												isEditing={String(editingTaskId) === String(taskId) && isSavingTask}
												isUpdating={String(updatingTaskId) === String(taskId)}
												isDeleting={String(deletingTaskId) === String(taskId)}
												draggable
												onDragStart={(event) => handleTaskDragStart(event, taskId)}
											/>
										)
									})}
									{boardTasks.TODO.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No tasks in To Do.</p> : null}
								</div>
								<div className="mt-3 space-y-2">
									<button
										type="button"
										className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-background/70"
										onClick={() => openCreateTask('TODO')}
									>
										Add Task
										<Plus className="h-3.5 w-3.5" />
									</button>
									{boardPages.TODO.page < boardPages.TODO.totalPages - 1 ? (
										<button
											type="button"
											className="inline-flex h-9 w-full items-center justify-center rounded-md border border-dashed border-border/70 bg-background/30 px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-background/60"
											onClick={() => appendBoardPage('TODO')}
											disabled={boardPages.TODO.isLoading}
										>
											{boardPages.TODO.isLoading ? 'Loading...' : 'Load More'}
										</button>
									) : null}
								</div>
							</section>

							<section
								className="rounded-xl border border-border/60 bg-card/35 p-3"
								onDragOver={(event) => event.preventDefault()}
								onDrop={(event) => handleTaskDropToStatus(event, 'IN_PROGRESS')}
							>
								<div className="mb-3 flex items-center justify-between">
									<h3 className="text-sm font-semibold text-foreground">In Progress</h3>
									<Badge variant="secondary" className="h-5 px-2 text-[10px] font-semibold">
										{taskCounts.inProgress}
									</Badge>
								</div>
								<div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
									{boardTasks.IN_PROGRESS.map((task) => {
										const taskId = task?.id || task?._id

										return (
											<TaskCard
												key={taskId}
												task={task}
												projectLabel={getTaskProjectLabel(task)}
														taskStartDate={getTaskStartDate(task)}
												onEdit={openEditTask}
												onAdvanceStatus={handleAdvanceTaskStatus}
												onDelete={handleDeleteTask}
												isEditing={String(editingTaskId) === String(taskId) && isSavingTask}
												isUpdating={String(updatingTaskId) === String(taskId)}
												isDeleting={String(deletingTaskId) === String(taskId)}
												draggable
												onDragStart={(event) => handleTaskDragStart(event, taskId)}
											/>
										)
									})}
									{boardTasks.IN_PROGRESS.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No tasks in progress.</p> : null}
								</div>
								<div className="mt-3 space-y-2">
									<button
										type="button"
										className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-background/70"
										onClick={() => openCreateTask('IN_PROGRESS')}
									>
										Add Task
										<Plus className="h-3.5 w-3.5" />
									</button>
									{boardPages.IN_PROGRESS.page < boardPages.IN_PROGRESS.totalPages - 1 ? (
										<button
											type="button"
											className="inline-flex h-9 w-full items-center justify-center rounded-md border border-dashed border-border/70 bg-background/30 px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-background/60"
											onClick={() => appendBoardPage('IN_PROGRESS')}
											disabled={boardPages.IN_PROGRESS.isLoading}
										>
											{boardPages.IN_PROGRESS.isLoading ? 'Loading...' : 'Load More'}
										</button>
									) : null}
								</div>
							</section>

							<section
								className="rounded-xl border border-border/60 bg-card/35 p-3"
								onDragOver={(event) => event.preventDefault()}
								onDrop={(event) => handleTaskDropToStatus(event, 'DONE')}
							>
								<div className="mb-3 flex items-center justify-between">
									<h3 className="text-sm font-semibold text-foreground">Done</h3>
									<Badge variant="secondary" className="h-5 px-2 text-[10px] font-semibold">
										{taskCounts.completed}
									</Badge>
								</div>
								<div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
									{boardTasks.DONE.map((task) => {
										const taskId = task?.id || task?._id

										return (
											<TaskCard
												key={taskId}
												task={task}
												projectLabel={getTaskProjectLabel(task)}
														taskStartDate={getTaskStartDate(task)}
												onEdit={openEditTask}
												onAdvanceStatus={handleAdvanceTaskStatus}
												onDelete={handleDeleteTask}
												isEditing={String(editingTaskId) === String(taskId) && isSavingTask}
												isUpdating={String(updatingTaskId) === String(taskId)}
												isDeleting={String(deletingTaskId) === String(taskId)}
												draggable
												onDragStart={(event) => handleTaskDragStart(event, taskId)}
											/>
										)
									})}
									{boardTasks.DONE.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No completed tasks yet.</p> : null}
								</div>
								<div className="mt-3 space-y-2">
									<button
										type="button"
										className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-background/70"
										onClick={() => openCreateTask('DONE')}
									>
										Add Task
										<Plus className="h-3.5 w-3.5" />
									</button>
									{boardPages.DONE.page < boardPages.DONE.totalPages - 1 ? (
										<button
											type="button"
											className="inline-flex h-9 w-full items-center justify-center rounded-md border border-dashed border-border/70 bg-background/30 px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-background/60"
											onClick={() => appendBoardPage('DONE')}
											disabled={boardPages.DONE.isLoading}
										>
											{boardPages.DONE.isLoading ? 'Loading...' : 'Load More'}
										</button>
									) : null}
								</div>
							</section>
						</div>
					</div>
				) : (
					<div className="overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-md">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[760px] text-sm">
								<thead className="bg-foreground/5">
									<tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
										<th className="px-4 py-3 font-semibold">Task</th>
										<th className="px-4 py-3 font-semibold">Project</th>
										<th className="px-4 py-3 font-semibold">Status</th>
										<th className="px-4 py-3 font-semibold">Priority</th>
										<th className="px-4 py-3 font-semibold">Updated</th>
										<th className="px-4 py-3 text-right font-semibold">Actions</th>
									</tr>
								</thead>
								<tbody>
									{listTasks.map((task) => {
										const taskId = task?.id || task?._id

										return (
											<tr key={taskId} className="border-t border-border/30 hover:bg-foreground/5">
												<td className="px-4 py-3 align-middle">
													<div className="max-w-[320px]">
														<p className="truncate font-medium text-foreground">{task?.title || 'Untitled task'}</p>
														<p className="truncate text-xs text-muted-foreground">{task?.description || 'No description'}</p>
													</div>
												</td>
												<td className="px-4 py-3 align-middle">
													<Badge
														variant="outline"
														className="max-w-[180px] justify-start truncate border-border/70 bg-background/40 text-xs font-medium text-muted-foreground"
														title={getTaskProjectLabel(task)}
													>
														{getTaskProjectLabel(task)}
													</Badge>
												</td>
												<td className="px-4 py-3 align-middle"><StatusBadge status={task?.status} /></td>
												<td className="px-4 py-3 align-middle"><PriorityBadge priority={task?.priority} /></td>
												<td className="px-4 py-3 align-middle text-muted-foreground">{formatDate(task?.updatedAt)}</td>
												<td className="px-4 py-3 align-middle">
													<div className="flex items-center justify-end gap-2">
														<Button
															type="button"
															size="sm"
															variant="ghost"
															className="h-8"
															onClick={() => openEditTask(task)}
															disabled={String(editingTaskId) === String(taskId) && isSavingTask}
														>
															Edit
														</Button>
														<Button
															type="button"
															size="sm"
															variant="outline"
															className="h-8"
															onClick={() => handleAdvanceTaskStatus(task)}
															disabled={String(updatingTaskId) === String(taskId)}
														>
															{String(updatingTaskId) === String(taskId) ? (
																<Loader2 className="h-3.5 w-3.5 animate-spin" />
															) : (
																'Next'
															)}
														</Button>
														<Button
															type="button"
															size="sm"
															variant="ghost"
															className="h-8 text-destructive hover:text-destructive"
															onClick={() => handleDeleteTask(task)}
															disabled={String(deletingTaskId) === String(taskId)}
														>
															{String(deletingTaskId) === String(taskId) ? (
																<Loader2 className="h-3.5 w-3.5 animate-spin" />
															) : (
																'Delete'
															)}
														</Button>
													</div>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
							{listTotalPages > 1 ? (
								<PaginationControls
									currentPage={listPage}
									totalPages={listTotalPages}
									totalElements={listTotalElements}
									pageSize={LIST_PAGE_SIZE}
									isLoading={isLoadingList}
									onPageChange={(nextPage) => loadListPage(nextPage)}
								/>
							) : null}
						</div>
					</div>
				)}
			</section>

			{pendingDeleteTask ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
					<Card className="w-full max-w-md overflow-hidden border border-white/10 bg-[#07090f]/95 shadow-2xl backdrop-blur-xl">
						<CardHeader className="border-b border-white/10 px-6 py-4">
							<CardTitle className="text-xl font-semibold text-white/95">Warning</CardTitle>
						</CardHeader>

						<CardContent className="space-y-4 px-6 py-8 text-center text-sm">
							<div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
								<AlertTriangle className="h-6 w-6" />
							</div>
							<p className="text-base text-white/80">
								Are you sure you want to delete{' '}
								<span className="font-semibold text-white">{pendingDeleteTask?.title || 'Untitled task'}</span>?
							</p>
							<p className="text-base text-red-300">
								This action cannot be undone.
							</p>
						</CardContent>

						<CardFooter className="grid grid-cols-2 gap-3 border-t border-white/10 bg-white/[0.03] p-4">
							<Button
								type="button"
								variant="destructive"
								className="h-11 border border-red-300/20 bg-red-500/25 text-red-100 hover:bg-red-500/40 hover:text-red-50"
								onClick={confirmDeleteTask}
								disabled={isConfirmingDelete}
							>
								{isConfirmingDelete ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Delete
							</Button>
							<Button
								type="button"
								variant="outline"
								className="h-11 border-white/20 bg-white/[0.04] text-white/90 hover:bg-white/[0.08]"
								onClick={closeDeleteTaskModal}
								disabled={isConfirmingDelete}
							>
								Cancel
							</Button>
						</CardFooter>
					</Card>
				</div>
			) : null}

			{isEditTaskOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
					<Card className="w-full max-w-md border-border/60 bg-background/95 shadow-2xl">
						<CardHeader className="border-b border-border/60">
							<div className="flex items-center justify-between gap-4">
								<CardTitle>Edit Task</CardTitle>
								<Button type="button" variant="ghost" size="icon" onClick={closeEditTask} disabled={isSavingTask}>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>

						<form onSubmit={handleSaveTask} className="space-y-4">
							<CardContent className="space-y-4 pt-6">
								<div className="space-y-2">
									<Label htmlFor="edit-task-title">Task Title</Label>
									<Input
										id="edit-task-title"
										name="title"
										value={editTaskForm.title}
										onChange={handleEditTaskFormChange}
										autoComplete="off"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="edit-task-description">Description</Label>
									<textarea
										id="edit-task-description"
										name="description"
										value={editTaskForm.description}
										onChange={handleEditTaskFormChange}
										rows={4}
										className="w-full resize-none rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="edit-task-due-date">Due Date</Label>
									<Input
										id="edit-task-due-date"
										name="dueDate"
										type="date"
										value={editTaskForm.dueDate}
										min={editTaskMinDueDate}
										max={editTaskMaxDueDate || undefined}
										onChange={handleEditTaskFormChange}
										className="rounded-lg border-border/70 bg-background/50 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="edit-task-priority">Priority</Label>
									<select
										id="edit-task-priority"
										name="priority"
										value={editTaskForm.priority}
										onChange={handleEditTaskFormChange}
										className="w-full rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
									>
										<option value="LOW">Low</option>
										<option value="MEDIUM">Medium</option>
										<option value="HIGH">High</option>
									</select>
								</div>
							</CardContent>

							<CardFooter className="flex gap-2 border-t border-border/60">
								<Button type="submit" className="flex-1" disabled={isSavingTask || !editTaskForm.title.trim()}>
									{isSavingTask ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
									Save Task
								</Button>
								<Button type="button" variant="outline" className="flex-1" onClick={closeEditTask} disabled={isSavingTask}>
									Cancel
								</Button>
							</CardFooter>
						</form>
					</Card>
				</div>
			) : null}

			{isCreateTaskOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
					<Card className="w-full max-w-md border-border/60 bg-background/95 shadow-2xl">
						<CardHeader className="border-b border-border/60">
							<div className="flex items-center justify-between gap-4">
								<CardTitle>Add New Task</CardTitle>
								<Button type="button" variant="ghost" size="icon" onClick={closeCreateTask} disabled={isSubmittingTask}>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>

						<form onSubmit={handleCreateTask} className="space-y-4">
							<CardContent className="space-y-4 pt-6">
								<div className="space-y-2">
									<Label htmlFor="task-title">Task Title</Label>
									<Input
										id="task-title"
										name="title"
										value={taskForm.title}
										onChange={handleTaskFormChange}
										autoComplete="off"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="task-description">Description</Label>
									<textarea
										id="task-description"
										name="description"
										value={taskForm.description}
										onChange={handleTaskFormChange}
										rows={4}
										className="w-full resize-none rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="task-due-date">Due Date</Label>
									<Input
										id="task-due-date"
										name="dueDate"
										type="date"
										value={taskForm.dueDate}
										min={todayDateInput}
										onChange={handleTaskFormChange}
										className="rounded-lg border-border/70 bg-background/50 transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="task-priority">Priority</Label>
									<select
										id="task-priority"
										name="priority"
										value={taskForm.priority}
										onChange={handleTaskFormChange}
										className="w-full rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm transition-all focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/25 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/25"
									>
										<option value="LOW">Low</option>
										<option value="MEDIUM">Medium</option>
										<option value="HIGH">High</option>
									</select>
								</div>
							</CardContent>

							<CardFooter className="flex gap-2 border-t border-border/60">
								<Button type="submit" className="flex-1" disabled={isSubmittingTask || !taskForm.title.trim()}>
									{isSubmittingTask ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
									Create Task
								</Button>
								<Button type="button" variant="outline" className="flex-1" onClick={closeCreateTask} disabled={isSubmittingTask}>
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
