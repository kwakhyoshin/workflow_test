import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deriveStatus, listCsrRequests, STATUS_META } from '../lib/csr'
import type { CsrStatus, CsrSubmission } from '../types'

const IMPACT_META = {
  urgent: { label: '긴급', cls: 'bg-rose-100   dark:bg-rose-500/15   text-rose-700   dark:text-rose-300' },
  normal: { label: '보통', cls: 'bg-zinc-100   dark:bg-white/[0.06]  text-zinc-700   dark:text-zinc-300' },
  low:    { label: '낮음', cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
} as const

export default function CsrListPage() {
  const [items, setItems] = useState<CsrSubmission[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | CsrStatus>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    listCsrRequests()
      .then(setItems)
      .catch((e) => setError(String(e?.message ?? e)))
  }, [])

  const filtered = useMemo(() => {
    if (!items) return []
    const q = search.trim().toLowerCase()
    return items.filter((it) => {
      const s = deriveStatus(it)
      if (filter !== 'all' && s !== filter) return false
      if (q) {
        const hay = `${it.id} ${it.requester_name} ${it.employee_id} ${it.department} ${it.reason}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [items, filter, search])

  const counts = useMemo(() => {
    if (!items) return null
    const c: Record<CsrStatus | 'all', number> = {
      all: items.length, received: 0, reviewing: 0, in_progress: 0, completed: 0, rejected: 0,
    }
    for (const it of items) c[deriveStatus(it)]++
    return c
  }, [items])

  return (
    <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
      <header className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
          CSR System · Mock
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          CSR 신청 목록
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          제출된 모든 CSR 신청 건이 여기에 표시됩니다. 카드를 클릭하면 상세 진행 상황을 확인할 수 있습니다.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={filter === 'all'}        onClick={() => setFilter('all')}        count={counts?.all ?? 0}>전체</Chip>
          <Chip active={filter === 'received'}   onClick={() => setFilter('received')}   count={counts?.received ?? 0}   tone="zinc">접수됨</Chip>
          <Chip active={filter === 'reviewing'}  onClick={() => setFilter('reviewing')}  count={counts?.reviewing ?? 0}  tone="amber">검토 중</Chip>
          <Chip active={filter === 'in_progress'} onClick={() => setFilter('in_progress')} count={counts?.in_progress ?? 0} tone="sky">처리 중</Chip>
          <Chip active={filter === 'completed'}  onClick={() => setFilter('completed')}  count={counts?.completed ?? 0}  tone="emerald">완료</Chip>
        </div>
        <div className="relative w-full sm:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="CSR-ID, 요청자, 부서, 사유로 검색..."
            className="input-themed w-full pl-9 pr-3 py-2 text-sm rounded-md"
          />
        </div>
      </div>

      {/* List */}
      <div className="glass rounded-2xl overflow-hidden">
        {error && (
          <div className="px-6 py-4 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10">
            로드 실패: {error}
          </div>
        )}
        {!items && !error && (
          <div className="px-6 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 dot-pulse" />
              불러오는 중…
            </span>
          </div>
        )}
        {items && filtered.length === 0 && (
          <div className="px-6 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {items.length === 0 ? '아직 제출된 CSR이 없습니다. 신청 페이지에서 첫 CSR을 제출해 보세요.' : '필터에 해당하는 항목이 없습니다.'}
          </div>
        )}
        {items && filtered.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-widest border-b border-zinc-200 dark:border-white/[0.05]">
                <th className="px-5 py-3 text-left font-medium">CSR ID</th>
                <th className="px-3 py-3 text-left font-medium">요청자 / 부서</th>
                <th className="px-3 py-3 text-left font-medium">신청일</th>
                <th className="px-3 py-3 text-left font-medium">영향도</th>
                <th className="px-3 py-3 text-left font-medium">룰</th>
                <th className="px-3 py-3 text-left font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => {
                const s = deriveStatus(it)
                const sm = STATUS_META[s]
                const im = IMPACT_META[it.impact]
                return (
                  <tr key={it.id} className="border-b border-zinc-100 dark:border-white/[0.04] last:border-none hover:bg-cyan-50/40 dark:hover:bg-cyan-500/5 transition">
                    <td className="px-5 py-3.5">
                      <Link to={`/csr/${encodeURIComponent(it.id)}`} className="mono text-sm font-semibold text-cyan-700 dark:text-cyan-300 hover:underline">
                        {it.id}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="text-sm text-zinc-800 dark:text-zinc-200">{it.requester_name} <span className="text-zinc-400 dark:text-zinc-500 text-xs mono ml-1">({it.employee_id})</span></div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{it.department}</div>
                    </td>
                    <td className="px-3 py-3.5 mono text-xs text-zinc-600 dark:text-zinc-400">{fmtDate(it.created_at)}</td>
                    <td className="px-3 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${im.cls}`}>{im.label}</span>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 mono">{it.rules.length}건</td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${sm.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                        {sm.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
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

type Tone = 'zinc' | 'amber' | 'sky' | 'emerald'
function Chip({ children, active, onClick, count, tone }: { children: React.ReactNode; active: boolean; onClick: () => void; count: number; tone?: Tone }) {
  const activeCls =
    tone === 'amber'   ? 'bg-amber-500 text-white' :
    tone === 'sky'     ? 'bg-sky-500 text-white' :
    tone === 'emerald' ? 'bg-emerald-500 text-white' :
    tone === 'zinc'    ? 'bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900' :
                         'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-1.5 text-xs font-medium rounded-md border transition flex items-center gap-1.5 ' +
        (active
          ? activeCls + ' border-transparent'
          : 'bg-white dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.10] hover:border-zinc-400 dark:hover:border-white/[0.20]')
      }
    >
      {children}
      <span className={'text-[10px] mono ' + (active ? 'opacity-80' : 'text-zinc-400 dark:text-zinc-500')}>
        {count}
      </span>
    </button>
  )
}
