import type { JudgmentResult, ResultKind } from '../lib/judge'

const STYLE: Record<
  ResultKind,
  { label: string; cls: string; dot: string }
> = {
  ALLOWED:      { label: '통신 가능',        cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  SAME_ZONE:    { label: '동일 구간',        cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  BLOCKED:      { label: '방화벽 신청 필요',  cls: 'bg-rose-50    dark:bg-rose-500/10    text-rose-700    dark:text-rose-300    border-rose-200    dark:border-rose-500/30',    dot: 'bg-rose-500    dark:bg-rose-400' },
  NO_ROUTE:     { label: '라우팅 작업 필요',  cls: 'bg-orange-50  dark:bg-orange-500/10  text-orange-700  dark:text-orange-300  border-orange-200  dark:border-orange-500/30',  dot: 'bg-orange-500  dark:bg-orange-400' },
  UNREGISTERED: { label: 'IP 미등록',         cls: 'bg-amber-50   dark:bg-amber-500/10   text-amber-700   dark:text-amber-300   border-amber-200   dark:border-amber-500/30',   dot: 'bg-amber-500   dark:bg-amber-400' },
  INCOMPLETE:   { label: '입력 미완성',       cls: 'bg-zinc-100   dark:bg-white/[0.04]   text-zinc-600    dark:text-zinc-400    border-zinc-200    dark:border-white/[0.08]',   dot: 'bg-zinc-400    dark:bg-zinc-500' },
}

export function ResultBadge({ result }: { result: JudgmentResult }) {
  const s = STYLE[result.kind]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-tight ${s.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span>{s.label}</span>
    </span>
  )
}

export function ResultDetail({ result }: { result: JudgmentResult }) {
  return (
    <div className="text-xs flex flex-col gap-1.5">
      <div className="text-zinc-700 dark:text-zinc-200 leading-relaxed">{result.message}</div>
      <div className="flex items-center gap-3 flex-wrap text-zinc-500 dark:text-zinc-400">
        {result.srcZone && result.dstZone && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Zone</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.08]">
              {result.srcZone.name}
            </span>
            <svg className="w-3 h-3 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.08]">
              {result.dstZone.name}
            </span>
          </div>
        )}
        {result.pathFirewalls.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Path</span>
            {result.pathFirewalls.map((f) => (
              <span
                key={f.id}
                className={
                  'mono inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ' +
                  (result.blockingFirewall?.id === f.id
                    ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                    : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08]')
                }
                title={f.description}
              >
                {f.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
