import type { JudgmentResult, ResultKind } from '../lib/judge'
import { TopologyPath } from './TopologyPath'

const STYLE: Record<
  ResultKind,
  { label: string; cls: string; dot: string }
> = {
  ALLOWED:      { label: '통신 가능',        cls: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-400/60', dot: 'bg-emerald-500 dark:bg-emerald-300' },
  SAME_ZONE:    { label: '동일 구간',        cls: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-400/60', dot: 'bg-emerald-500 dark:bg-emerald-300' },
  BLOCKED:      { label: '방화벽 신청 필요',  cls: 'bg-rose-50    dark:bg-rose-500/20    text-rose-700    dark:text-rose-200    border-rose-200    dark:border-rose-400/60',    dot: 'bg-rose-500    dark:bg-rose-300' },
  NO_ROUTE:     { label: '라우팅 작업 필요',  cls: 'bg-orange-50  dark:bg-orange-500/20  text-orange-700  dark:text-orange-200  border-orange-200  dark:border-orange-400/60',  dot: 'bg-orange-500  dark:bg-orange-300' },
  UNREGISTERED: { label: 'IP 미등록',         cls: 'bg-amber-50   dark:bg-amber-500/20   text-amber-700   dark:text-amber-200   border-amber-200   dark:border-amber-400/60',   dot: 'bg-amber-500   dark:bg-amber-300' },
  INCOMPLETE:   { label: '입력 미완성',       cls: 'bg-zinc-100   dark:bg-white/[0.08]   text-zinc-600    dark:text-zinc-300    border-zinc-200    dark:border-white/[0.20]',   dot: 'bg-zinc-400    dark:bg-zinc-400' },
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
  if (result.kind === 'INCOMPLETE') {
    return <div className="text-xs text-zinc-500 dark:text-zinc-300">{result.message}</div>
  }

  return (
    <div className="flex flex-col gap-3">
      <TopologyPath result={result} />

      {result.blockingRule && (
        <div className="text-[11px] text-zinc-700 dark:text-zinc-200 px-3 py-2 rounded bg-rose-50/80 dark:bg-rose-500/15 border border-rose-200/80 dark:border-rose-400/40 inline-flex items-center gap-2 self-start">
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-700 dark:text-rose-300">차단 룰</span>
          <span className="mono">
            {result.blockingRule.src_cidr} → {result.blockingRule.dst_cidr}
          </span>
          <span className="mono text-zinc-500 dark:text-zinc-400">
            {Array.isArray(result.blockingRule.ports) ? result.blockingRule.ports.join(',') : result.blockingRule.ports} / {result.blockingRule.protocol}
          </span>
        </div>
      )}
    </div>
  )
}
