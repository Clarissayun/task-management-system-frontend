import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  LayoutGrid,
  ListTodo,
  Settings,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import { ROUTES } from '../../constants/routes'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: ROUTES.dashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo, href: ROUTES.tasks },
  { id: 'projects', label: 'Projects', icon: FolderOpen, href: ROUTES.projects },
]

const UPCOMING_ITEMS = [
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '#' },
  { id: 'docs', label: 'Docs', icon: FileText, href: '#' },
]

const SECONDARY_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings, href: ROUTES.profile },
]

export default function DashboardSidebar({
  isCollapsed = false,
  isMobileOpen = false,
  onToggle,
  onNavigate,
}) {
  const location = useLocation()

  const isActive = (href) => {
    if (href === '#') return false
    return location.pathname === href
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-border/30 bg-background/70 py-6 backdrop-blur-xl transition-transform duration-300 lg:relative lg:z-20 lg:h-full lg:min-h-0 lg:self-stretch lg:overflow-y-auto lg:bg-background/50 lg:backdrop-blur-none ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'w-20 px-3 lg:w-20' : 'w-64 px-4 lg:w-64'}`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 px-2">
          <img src={logo} alt="Logo" className="h-8 w-8 flex-shrink-0" />
          {!isCollapsed ? (
            <span className="text-sm font-semibold tracking-tight">Task Manager</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const isDisabled = item.href === '#'

          return (
            <Link
              key={item.id}
              to={item.href}
              title={item.label}
              className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-all ${
                isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
              } ${
                active
                  ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                  : isDisabled
                    ? 'cursor-not-allowed text-muted-foreground'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              }`}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault()
                  return
                }

                onNavigate?.()
              }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed ? <span>{item.label}</span> : null}
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 border-t border-border/30 pt-6">
        {!isCollapsed ? (
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Coming Soon
          </p>
        ) : null}
        <nav className="space-y-1">
          {UPCOMING_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const isDisabled = item.href === '#'

            return (
              <Link
                key={item.id}
                to={item.href}
                title={item.label}
                className={`flex items-center justify-between rounded-lg py-2.5 text-sm font-medium transition-all ${
                  isCollapsed ? 'px-2' : 'gap-3 px-3'
                } ${
                  isDisabled
                    ? 'cursor-not-allowed text-muted-foreground'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                }`}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault()
                    return
                  }
                  onNavigate?.()
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed ? <span>{item.label}</span> : null}
                </div>
                {!isCollapsed ? (
                  <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    Upcoming
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-6 border-t border-border/30 pt-6">
        {!isCollapsed ? (
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </p>
        ) : null}
        <nav className="space-y-1">
          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.id}
                to={item.href}
                title={item.label}
                className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                } ${
                  active
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                }`}
                onClick={() => onNavigate?.()}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed ? <span>{item.label}</span> : null}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto flex justify-center lg:pb-2">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-500 p-0.5">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-background text-xs font-semibold text-foreground/80">
            U
          </div>
        </div>
      </div>
    </aside>
  )
}
