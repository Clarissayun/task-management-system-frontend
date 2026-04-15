import { useEffect, useState } from 'react'
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import { Button } from '../components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip'
import useAuth from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const SIDEBAR_COLLAPSED_KEY = 'task-management-system-sidebar-collapsed'

function getInitialSidebarState() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getInitialSidebarState)
  const [isCompactViewport, setIsCompactViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia('(max-width: 1279px)').matches
  })
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1279px)')

    const handleChange = (event) => {
      setIsCompactViewport(event.matches)
    }

    setIsCompactViewport(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    if (!isCompactViewport) {
      setIsMobileSidebarOpen(false)
    }
  }, [isCompactViewport])

  const effectiveSidebarCollapsed = isSidebarCollapsed || isCompactViewport

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
      {/* Background Layers */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ backgroundImage: 'var(--landing-base)' }}
      />

      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--landing-glow-1)' }}
        />
        <div
          className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--landing-glow-2)' }}
        />
        <div
          className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--landing-glow-3)' }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--landing-pattern) 1px, transparent 1px), linear-gradient(to bottom, var(--landing-pattern) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(circle at top, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at top, black, transparent 75%)',
        }}
      />

      {isCompactViewport && isMobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 cursor-default bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <DashboardSidebar
        isCollapsed={effectiveSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onToggle={() => {
          if (isCompactViewport) {
            setIsMobileSidebarOpen((current) => !current)
            return
          }

          setIsSidebarCollapsed((current) => !current)
        }}
        onNavigate={() => setIsMobileSidebarOpen(false)}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-border/30 bg-background/50 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isCompactViewport ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen((current) => !current)}
                  className="h-9 w-9 rounded-md transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                  aria-label={isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                  {isMobileSidebarOpen ? (
                    <X className="h-[1.2rem] w-[1.2rem] transition-all" />
                  ) : (
                    <Menu className="h-[1.2rem] w-[1.2rem] transition-all" />
                  )}
                </Button>
              ) : null}

              <div className="flex-1" />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                {user?.username || user?.email || 'User'}
              </span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="h-9 w-9 rounded-md transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
                      ) : (
                        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
                      )}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
