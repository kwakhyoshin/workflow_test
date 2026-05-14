import { RuleTable } from './components/RuleTable'
import { ThemeToggle } from './components/ThemeToggle'

export default function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ── Background layers ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none hero-glow" />
      <div className="absolute inset-0 pointer-events-none hero-grid" />

      {/* ── Top nav ──────────────────────────────────────── */}
      <nav className="relative z-10 border-b border-zinc-200 dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500/90 to-violet-500/90 dark:from-cyan-400/80 dark:to-violet-500/80 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-xs">🔥</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Firewall Request
            </span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded">
              pilot
            </span>
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

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-7 rounded-full bg-white/80 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-[11px] font-medium tracking-wide text-zinc-700 dark:text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 dot-pulse" />
            Live · CMDB 24 systems · 5 firewalls
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
            <span className="text-gradient-cool">방화벽 요청,</span>
            <br />
            <span className="text-zinc-900 dark:text-white">한 화면에서 즉시 판정.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            출발지·도착지 IP와 포트만 입력하면 CMDB와 네트워크 토폴로지를 분석해
            <span className="text-zinc-900 dark:text-zinc-100 font-medium"> 방화벽 신청</span>이 필요한지,
            <span className="text-zinc-900 dark:text-zinc-100 font-medium"> 라우팅 작업</span>이 필요한지,
            아니면 <span className="text-zinc-900 dark:text-zinc-100 font-medium">이미 통신 가능</span>한지 자동으로 알려줍니다.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { num: '24',  lbl: 'Systems'   },
              { num: '6',   lbl: 'Farms'     },
              { num: '5',   lbl: 'Firewalls' },
              { num: '100', lbl: 'Switches'  },
            ].map((s) => (
              <div key={s.lbl} className="glass rounded-xl px-4 py-4 text-left">
                <div className="text-2xl font-bold text-gradient-accent mono leading-none">{s.num}</div>
                <div className="mt-1.5 text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-medium">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-1.5">
              01 · Request
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">룰 입력 & 판정</h2>
          </div>
          <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 max-w-xs text-right leading-relaxed">
            여러 룰을 한 번에 입력하고 <span className="text-zinc-700 dark:text-zinc-200">[조회]</span>를 누르세요.
          </p>
        </div>

        <RuleTable />

        <div className="mt-6 px-4 py-3 rounded-lg bg-white/60 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] text-xs text-zinc-600 dark:text-zinc-400">
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">M5</span>
          <span className="mx-2 text-zinc-400 dark:text-zinc-600">/</span>
          판정 결과가 <span className="text-rose-600 dark:text-rose-300 font-medium">방화벽 신청 필요</span> 또는 <span className="text-orange-600 dark:text-orange-300 font-medium">라우팅 작업 필요</span>인 룰이 하나라도 있으면 <span className="text-zinc-800 dark:text-zinc-200 font-medium">CSR 요청</span> 버튼이 활성화됩니다.
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-zinc-200 dark:border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-600 font-mono">
          <span>kwakhyoshin/workflow_test</span>
          <span>built on firestore · react · vite</span>
        </div>
      </footer>
    </div>
  )
}
