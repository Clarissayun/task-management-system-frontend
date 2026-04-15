import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
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

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </section>
    </main>
  )
}
