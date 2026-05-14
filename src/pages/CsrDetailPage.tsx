import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deriveStatus, getCsrRequest, STATUS_META } from '../lib/csr'
import type { CsrStatus, CsrSubmission } from '../types'

const STATUS_ORDER: CsrStatus[] = ['received', 'reviewing', 'in_progress', 'completed']

const IMPACT_META = {
  urgent: { label: '긴급', cls: 'bg-rose-100   dark:bg-rose-500/15   text-rose-700   dark:text-rose-300   border-rose-200 dark:border-rose-500/30' },
  normal: { label: '보통', cls: 'bg-zinc-100   dark:bg-white/[0.06]  text-zinc-700   dark:text-zinc-300   border-zinc-200 dark:border-white/[0.10]' },
  low:    { label: '낮음', cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' },
} as const

export default function CsrDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<CsrSubmission | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setItem(undefined)
    setError(null)
    getCsrRequest(decodeURIComponent(id))
      .then((d) => setItem(d))
      .catch((e) => setError(String(e?.message ?? e)))
  }, [id])

  return (
    <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
      <div className="mb-5">
        <Link to="/csr" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition">
          ← 목록으로
        </Link>
      </div>

      {error && (
        <div className="glass rounded-2xl px-6 py-4 text-sm text-rose-700 dark:text-rose-300">
          로드 실패: {error}
        </div>
      )}
      {item === undefined && !error && (
        <div className="glass rounded-2xl px-6 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 dot-pulse" />
            불러오는 중…
          </span>
        </div>
      )}
      {item === null && !error && (
        <div className="glass rounded-2xl px-6 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          해당 CSR을 찾을 수 없습니다: <span className="mono">{id}</span>
        </div>
      )}

      {item && (
        <>
          <header className="mb-8 flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
                CSR Request · Detail
              </div>
              <h1 className="mono text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {item.id}
              </h1>
              <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-700 dark:text-zinc-200">{item.requester_name}</span>
                <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
                <span>{item.department}</span>
                <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
                <span className="mono text-xs">{fmtDate(item.created_at)} 접수</span>
              </div>
            </div>
            <StatusBadge status={deriveStatus(item)} />
          </header>

          {/* Status timeline */}
          <section className="glass rounded-2xl px-6 py-5 mb-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
              Progress
            </div>
            <Timeline current={deriveStatus(item)} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — request meta */}
            <section className="glass rounded-2xl p-6 lg:col-span-1">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">신청 정보</h2>
              <dl className="space-y-3 text-sm">
                <Row label="요청자">
                  {item.requester_name} <span className="mono text-xs text-zinc-500 dark:text-zinc-400 ml-1">({item.employee_id})</span>
                </Row>
                <Row label="부서">{item.department}</Row>
                <Row label="희망 완료일"><span className="mono">{item.due_date}</span></Row>
                <Row label="사용 기간">
                  {item.duration === 'permanent' ? '영구' : <span>임시 (~ <span className="mono">{item.end_date}</span>)</span>}
                </Row>
                <Row label="업무 영향도">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${IMPACT_META[item.impact].cls}`}>
                    {IMPACT_META[item.impact].label}
                  </span>
                </Row>
              </dl>
            </section>

            {/* Right — reason + rules */}
            <section className="glass rounded-2xl p-6 lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">요청 사유</h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {item.reason}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                  신청 룰 <span className="ml-1.5 text-xs font-normal text-zinc-500 dark:text-zinc-400">({item.rules.length}건)</span>
                </h2>
                <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-zinc-50/60 dark:bg-white/[0.02] text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        <th className="px-3 py-2 text-left font-medium w-10">#</th>
                        <th className="px-3 py-2 text-left font-medium">Source</th>
                        <th className="px-3 py-2 text-left font-medium">Destination</th>
                        <th className="px-3 py-2 text-left font-medium">Port</th>
                        <th className="px-3 py-2 text-left font-medium">Protocol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.rules.map((r, i) => (
                        <tr key={r.id} className="border-t border-zinc-100 dark:border-white/[0.04]">
                          <td className="px-3 py-2 mono text-zinc-500 dark:text-zinc-400">{String(i+1).padStart(2,'0')}</td>
                          <td className="px-3 py-2 mono text-zinc-800 dark:text-zinc-200">{r.src_ip}</td>
                          <td className="px-3 py-2 mono text-zinc-800 dark:text-zinc-200">{r.dst_ip}</td>
                          <td className="px-3 py-2 mono text-zinc-600 dark:text-zinc-400">{r.port || '—'}</td>
                          <td className="px-3 py-2 mono text-zinc-600 dark:text-zinc-400">{r.protocol}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] uppercase tracking-widest font-medium text-zinc-500 dark:text-zinc-400 mb-1">{label}</dt>
      <dd className="text-zinc-800 dark:text-zinc-200">{children}</dd>
    </div>
  )
}

function StatusBadge({ status }: { status: CsrStatus }) {
  const m = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold ${m.cls}`}>
      <span className={`w-2 h-2 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

function Timeline({ current }: { current: CsrStatus }) {
  if (current === 'rejected') {
    return (
      <div className="flex items-center justify-center py-2 text-rose-700 dark:text-rose-300 text-sm">
        본 신청은 반려되었습니다.
      </div>
    )
  }
  const currentIdx = STATUS_ORDER.indexOf(current)
  return (
    <div className="flex items-center justify-between gap-2">
      {STATUS_ORDER.map((s, i) => {
        const m = STATUS_META[s]
        const reached = i <= currentIdx
        const active  = i === currentIdx
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center flex-1">
              <div className={
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition ' +
                (active   ? 'border-cyan-500 dark:border-cyan-400 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-lg shadow-cyan-500/30 dot-pulse'
                : reached ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'border-zinc-200 dark:border-white/[0.10] bg-zinc-50 dark:bg-white/[0.02] text-zinc-400 dark:text-zinc-600')
              }>
                {reached && !active ? '✓' : i + 1}
              </div>
              <div className={
                'mt-2 text-[11px] font-medium ' +
                (active   ? 'text-cyan-700 dark:text-cyan-300'
                : reached ? 'text-zinc-700 dark:text-zinc-300'
                          : 'text-zinc-400 dark:text-zinc-600')
              }>
                {m.label}
              </div>
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <div className={
                'h-[2px] flex-1 mx-1 mb-6 ' +
                (i < currentIdx ? 'bg-emerald-500/60 dark:bg-emerald-400/60'
                                : 'bg-zinc-200 dark:bg-white/[0.08]')
              } />
            )}
          </div>
        )
      })}
    </div>
  )
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  } catch {
    return iso
  }
}
