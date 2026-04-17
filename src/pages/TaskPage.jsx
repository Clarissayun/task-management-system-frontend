import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpRight, Edit, FolderOpen, LayoutGrid, List, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { getProjects } from '../api/projects.api'
import { deleteTask, getTasks, saveTask, updateTask, updateTaskStatus } from '../api/tasks.api'
import useAuth from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import PriorityBadge from '../components/dashboard/PriorityBadge'
import StatusBadge from '../components/dashboard/StatusBadge'

const TASK_STATUS_FLOW = ['TODO', 'IN_PROGRESS', 'DONE']

function getUserId(user) {
	return user?.userId || user?.id || null
}

function formatDate(dateValue) {
	if (!dateValue) return '-'
	const parsedDate = new Date(dateValue)
	return Number.isNaN(parsedDate.getTime()) ? dateValue : parsedDate.toLocaleDateString()
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

function TaskCard({
	task,
	projectLabel,
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
	const [projects, setProjects] = useState([])
	const [viewMode, setViewMode] = useState('board')
	const [isLoading, setIsLoading] = useState(true)
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
	const [taskForm, setTaskForm] = useState({
		title: '',
		description: '',
		priority: 'LOW',
	})
	const [editTaskForm, setEditTaskForm] = useState({
		title: '',
		description: '',
		priority: 'LOW',
	})

	useEffect(() => {
		const loadTasks = async () => {
			if (!userId) {
				setIsLoading(false)
				setProjects([])
				return
			}

			setIsLoading(true)
			setError('')

			try {
				const [standaloneTasks, projects] = await Promise.all([
					getTasks({ userId }),
					getProjects(),
				])

				const nextProjects = Array.isArray(projects) ? projects : []
				setProjects(nextProjects)

				const projectIds = nextProjects
					.map((project) => project?.id || project?._id || project?.projectId)
					.filter(Boolean)

				const projectTaskResults = await Promise.allSettled(
					projectIds.map((projectId) => getTasks({ userId, projectId }))
				)

				const mergedTasks = new Map()

				const pushTasks = (taskList) => {
					if (!Array.isArray(taskList)) {
						return
					}

					taskList.forEach((task) => {
						const taskId = task?.id || task?._id
						if (!taskId) {
							return
						}

						mergedTasks.set(String(taskId), task)
					})
				}

				pushTasks(standaloneTasks)

				projectTaskResults.forEach((result) => {
					if (result.status === 'fulfilled') {
						pushTasks(result.value)
					}
				})

				setTasks(Array.from(mergedTasks.values()))
			} catch (apiError) {
				setTasks([])
				setProjects([])
				setError(apiError.message || 'Failed to load tasks.')
			} finally {
				setIsLoading(false)
			}
		}

		loadTasks()
	}, [userId])

		const projectNameById = useMemo(() => {
			return projects.reduce((lookup, project) => {
				const projectId = project?.id || project?._id || project?.projectId
				if (projectId) {
					lookup[String(projectId)] = project?.name || 'Untitled project'
				}
				return lookup
			}, {})
		}, [projects])

		const getTaskProjectLabel = (task) => {
			const projectId = task?.projectId
			if (!projectId) {
				return 'Personal'
			}

			return projectNameById[String(projectId)] || 'Project'
		}

	const taskCounts = useMemo(() => {
		const total = tasks.length
		const completed = tasks.filter((task) => task.status === 'DONE').length
		const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length
		const todo = tasks.filter((task) => task.status === 'TODO').length

		return { total, completed, inProgress, todo }
	}, [tasks])

	const boardTasks = useMemo(
		() => ({
			TODO: tasks.filter((task) => task.status === 'TODO'),
			IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS'),
			DONE: tasks.filter((task) => task.status === 'DONE'),
		}),
		[tasks]
	)

	const openCreateTask = (targetStatus = 'TODO') => {
		setTaskForm({
			title: '',
			description: '',
			priority: 'LOW',
		})
		setCreateTargetStatus(targetStatus)
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

		setIsSubmittingTask(true)
		setError('')

		try {
			const createdTask = await saveTask({
				userId,
				title: taskForm.title.trim(),
				description: taskForm.description.trim(),
				priority: taskForm.priority,
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
				setTasks((current) => [finalTask, ...current])
			}

			setIsCreateTaskOpen(false)
			setCreateTargetStatus('TODO')
			setTaskForm({
				title: '',
				description: '',
				priority: 'LOW',
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

		const existingTask = tasks.find(
			(task) => String(task?.id || task?._id) === String(editingTaskId)
		)

		setIsSavingTask(true)
		setError('')

		try {
			const payload = {
				title: editTaskForm.title.trim(),
				description: editTaskForm.description.trim(),
				priority: editTaskForm.priority,
			}

			if (existingTask?.projectId) {
				payload.projectId = existingTask.projectId
			}

			const updatedTask = await updateTask(editingTaskId, payload)

			setTasks((current) =>
				current.map((item) => {
					const itemId = item?.id || item?._id
					return String(itemId) === String(editingTaskId)
						? { ...item, ...(updatedTask || {}), updatedAt: new Date().toISOString() }
						: item
				})
			)

			setIsEditTaskOpen(false)
			setEditingTaskId(null)
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
			setTasks((current) =>
				current.map((item) => {
					const itemId = item?.id || item?._id
					return String(itemId) === String(taskId)
						? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
						: item
				})
			)
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
			setTasks((current) =>
				current.filter((item) => String(item?.id || item?._id) !== String(taskId))
			)
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
			setTasks((current) =>
				current.map((item) => {
					const itemId = item?.id || item?._id
					return String(itemId) === String(droppedTaskId)
						? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
						: item
				})
			)
		} catch (apiError) {
			setError(apiError.message || 'Failed to move task.')
		} finally {
			setUpdatingTaskId(null)
		}
	}

	const pendingDeleteTaskId = pendingDeleteTask?.id || pendingDeleteTask?._id
	const isConfirmingDelete =
		pendingDeleteTaskId && String(deletingTaskId) === String(pendingDeleteTaskId)

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
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-xl font-semibold tracking-tight !text-foreground">Tasks</h2>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="flex items-center gap-3 sm:ml-2">
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

				{tasks.length === 0 ? (
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
								<div className="space-y-3">
									{boardTasks.TODO.map((task) => {
										const taskId = task?.id || task?._id

										return (
											<TaskCard
												key={taskId}
												task={task}
												projectLabel={getTaskProjectLabel(task)}
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
								<button
									type="button"
									className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-background/70"
									onClick={() => openCreateTask('TODO')}
								>
									Add Task
									<Plus className="h-3.5 w-3.5" />
								</button>
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
								<div className="space-y-3">
									{boardTasks.IN_PROGRESS.map((task) => {
										const taskId = task?.id || task?._id

										return (
											<TaskCard
												key={taskId}
												task={task}
												projectLabel={getTaskProjectLabel(task)}
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
								<button
									type="button"
									className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-background/70"
									onClick={() => openCreateTask('IN_PROGRESS')}
								>
									Add Task
									<Plus className="h-3.5 w-3.5" />
								</button>
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
								<div className="space-y-3">
									{boardTasks.DONE.map((task) => {
										const taskId = task?.id || task?._id

										return (
											<TaskCard
												key={taskId}
												task={task}
												projectLabel={getTaskProjectLabel(task)}
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
								<button
									type="button"
									className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-background/70"
									onClick={() => openCreateTask('DONE')}
								>
									Add Task
									<Plus className="h-3.5 w-3.5" />
								</button>
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
									{tasks.map((task) => {
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
