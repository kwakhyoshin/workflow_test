import { Link, NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

export function Layout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ── Background layers ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none hero-glow" />
      <div className="absolute inset-0 pointer-events-none hero-grid" />

      {/* ── Top nav ──────────────────────────────────────── */}
      <nav className="relative z-10 border-b border-zinc-200 dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500/90 to-violet-500/90 dark:from-cyan-400/80 dark:to-violet-500/80 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-xs">🔥</span>
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Firewall Request
              </span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded">
                pilot
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-1 ml-3 pl-3 border-l border-zinc-200 dark:border-white/[0.08]">
              <NavTab to="/" end>신청</NavTab>
              <NavTab to="/csr">CSR 시스템</NavTab>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href={`${import.meta.env.BASE_URL}topology.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-3 py-1.5 text-xs font-medium rounded-md"
            >
              <span className="mr-1.5">🗺️</span>네트워크 구성도
            </a>
            <span className="ml-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-600">v0.1.0</span>
          </div>
        </div>
      </nav>

      {/* ── Page content ─────────────────────────────────── */}
      <div className="relative z-10">
        <Outlet />
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-zinc-200 dark:border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-600 font-mono">
          <span>kwakhyoshin/workflow_test</span>
          <span>built on firestore · react · vite</span>
        </div>
      </footer>
    </div>
  )
}

function NavTab({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        'px-3 py-1.5 text-xs font-medium rounded-md transition ' +
        (isActive
          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.05]')
      }
    >
      {children}
    </NavLink>
  )
}
