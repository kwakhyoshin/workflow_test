import { RuleTable } from '../components/RuleTable'

export default function RequestPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section>
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-7 rounded-full bg-white/80 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-[11px] font-medium tracking-wide text-zinc-700 dark:text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 dot-pulse" />
            Live · CMDB 25 systems · 5 firewalls
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

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { num: '25',  lbl: 'Systems'   },
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
      <main className="max-w-6xl mx-auto px-6 pb-24">
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
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">M5+</span>
          <span className="mx-2 text-zinc-400 dark:text-zinc-600">/</span>
          판정 결과가 <span className="text-rose-600 dark:text-rose-300 font-medium">방화벽 신청 필요</span> 또는 <span className="text-orange-600 dark:text-orange-300 font-medium">라우팅 작업 필요</span>인 룰이 하나라도 있으면 <span className="text-zinc-800 dark:text-zinc-200 font-medium">CSR 요청</span> 버튼이 활성화됩니다.
          접수 후 <span className="text-zinc-800 dark:text-zinc-200 font-medium">CSR 시스템</span> 페이지에서 진행 상황을 확인할 수 있습니다.
        </div>
      </main>
    </>
  )
}
