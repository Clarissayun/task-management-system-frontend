import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip'
import { ROUTES } from '../constants/routes'
import { useTheme } from '../hooks/useTheme'

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'var(--landing-base)' }}
      />

      <div className="pointer-events-none absolute inset-0">
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
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--landing-pattern) 1px, transparent 1px), linear-gradient(to bottom, var(--landing-pattern) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(circle at top, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at top, black, transparent 75%)',
        }}
      />

      {/* --- Header --- */}
      <header className="relative z-10 bg-background/35 backdrop-blur supports-[backdrop-filter]:bg-background/25">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.root} className="font-heading text-base font-semibold tracking-tight">
            TaskManagementSystem
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"    
                    onClick={toggleTheme}
                    className="h-9 w-9 rounded-md transition-all duration-300 
                    hover:bg-black/10 dark:hover:bg-white/10 
                    hover:text-black dark:hover:text-white"
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
              asChild 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex px-3 border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <Link to={ROUTES.login}>Login</Link>
            </Button>

            <Button 
              asChild 
              size="sm" 
              className="px-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-md transition-transform active:scale-95"
            >
              <Link to={ROUTES.register}>Sign Up</Link>
            </Button>
          </div>
        </div>

        {/* --- Faded Separator Line --- */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
        </div>
      </header>

      {/* --- Hero Section --- */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col px-4 py-10 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-8 inline-flex items-center gap-3 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-xs font-medium tracking-wide text-violet-700 backdrop-blur-md dark:text-violet-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500"></span>
            </span>
            Built for teams and individuals
            <span className="ml-1 opacity-50">→</span>
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.18] tracking-[-0.03em] sm:text-6xl sm:leading-[1.15] lg:text-7xl lg:leading-[1.1]">
            <span
              className={
                theme === 'dark'
                  ? 'block font-black text-zinc-100 [text-shadow:0_1px_0_rgba(255,255,255,0.18)]'
                  : 'block font-black text-zinc-900 [text-shadow:0_1px_0_rgba(24,24,27,0.14)]'
              }
            >
              Master Your Workflow
            </span>
            <span className="mt-4 block text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Without the Chaos
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-balance text-base leading-normal text-muted-foreground sm:text-lg">
            A simple, powerful task management system that helps you 
            <span className="text-foreground font-semibold"> plan better</span>, 
            execute faster, and stay focused.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-12 min-w-[200px] rounded-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xl transition-all hover:-translate-y-1"
            >
              <Link to={ROUTES.register} className="flex items-center gap-2">
                Get Started — Free
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 min-w-[160px] rounded-full text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Link to={ROUTES.login}>Learn More</Link>
            </Button>
          </div>

          <div className="relative mt-20 perspective-1000">
            {/* Glow behind the mockup */}
            <div className="absolute -inset-10 z-0 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 blur-3xl rounded-full" />
            
            <div className="relative z-10 rounded-2xl border border-border/50 bg-background/50 p-4 backdrop-blur-xl shadow-2xl">
              <div className="aspect-[16/9] w-full rounded-xl border border-border/30 bg-zinc-900/5 dark:bg-white/5 flex items-center justify-center">
                <span className="text-sm text-muted-foreground italic">Dashboard preview incoming...</span>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}