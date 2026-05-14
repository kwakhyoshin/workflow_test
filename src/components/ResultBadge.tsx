import type { JudgmentResult, ResultKind } from '../lib/judge'
import { TopologyPath } from './TopologyPath'

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
  if (result.kind === 'INCOMPLETE') {
    return <div className="text-xs text-zinc-500 dark:text-zinc-400">{result.message}</div>
  }

  return (
    <div className="flex flex-col gap-3">
      <TopologyPath result={result} />

      {result.blockingRule && (
        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 px-3 py-2 rounded bg-rose-50/60 dark:bg-rose-500/5 border border-rose-200/60 dark:border-rose-500/20 inline-flex items-center gap-2 self-start">
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-700 dark:text-rose-300">차단 룰</span>
          <span className="mono">
            {result.blockingRule.src_cidr} → {result.blockingRule.dst_cidr}
          </span>
          <span className="mono text-zinc-500 dark:text-zinc-500">
            {Array.isArray(result.blockingRule.ports) ? result.blockingRule.ports.join(',') : result.blockingRule.ports} / {result.blockingRule.protocol}
          </span>
        </div>
      )}
    </div>
  )
}
