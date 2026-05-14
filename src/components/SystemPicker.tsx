import { useEffect, useMemo, useRef, useState } from 'react'
import type { NetworkZone, ServerFarm, System } from '../types'

interface Props {
  open: boolean
  systems: System[]
  zones: NetworkZone[]
  farms: ServerFarm[]
  onSelect: (s: System) => void
  onClose: () => void
}

// 토폴로지 다이어그램과 통일된 zone 색상 톤
const ZONE_TONE: Record<string, string> = {
  'zone-dmz':    'bg-violet-500/15 text-violet-700  dark:text-violet-300  border-violet-500/30',
  'zone-biz':    'bg-sky-500/15    text-sky-700     dark:text-sky-300     border-sky-500/30',
  'zone-office': 'bg-teal-500/15   text-teal-700    dark:text-teal-300    border-teal-500/30',
  'zone-dev':    'bg-amber-500/15  text-amber-700   dark:text-amber-300   border-amber-500/30',
  'zone-db':     'bg-rose-500/15   text-rose-700    dark:text-rose-300    border-rose-500/30',
  'zone-sec':    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  'zone-infra':  'bg-lime-500/15   text-lime-700    dark:text-lime-300    border-lime-500/30',
}

export function SystemPicker({ open, systems, zones, farms, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ESC 닫기 + 열릴 때 검색창 포커스
  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return systems
    return systems.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.ip.includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.purpose       ?? '').toLowerCase().includes(q) ||
      (s.owner_team    ?? '').toLowerCase().includes(q) ||
      (s.service_type  ?? '').toLowerCase().includes(q),
    )
  }, [search, systems])

  // Farm별 그룹핑
  const grouped = useMemo(() => {
    const m = new Map<string, System[]>()
    for (const s of filtered) {
      if (!m.has(s.farm_id)) m.set(s.farm_id, [])
      m.get(s.farm_id)!.push(s)
    }
    return farms
      .filter((f) => m.has(f.id))
      .map((f) => ({ farm: f, items: m.get(f.id)! }))
  }, [filtered, farms])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center modal-backdrop p-4 pt-[10vh]" onClick={onClose}>
      <div
        className="glass relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-1">
              CMDB · System Picker
            </div>
            <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">시스템 선택</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50/40 dark:bg-black/20">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-sm">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, IP, 용도, 담당팀, 서비스 유형으로 검색…"
              className="input-themed w-full pl-9 pr-3 py-2 text-sm rounded-md"
            />
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="mono">{filtered.length}</span> / {systems.length} systems
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {grouped.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              검색 결과가 없습니다
            </div>
          ) : (
            grouped.map(({ farm, items }) => (
              <div key={farm.id} className="border-b border-zinc-200/60 dark:border-white/[0.04] last:border-none">
                <div className="px-5 py-2 bg-zinc-50/60 dark:bg-white/[0.015] text-[10px] uppercase tracking-widest font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>{farm.name}</span>
                  <span className="mono text-zinc-400 dark:text-zinc-500">{items.length}</span>
                </div>
                <ul>
                  {items.map((s) => {
                    const zoneTone = ZONE_TONE[s.zone_id] ?? 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30'
                    const zone = zones.find((z) => z.id === s.zone_id)
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(s)}
                          className="w-full text-left px-5 py-3 hover:bg-cyan-50/60 dark:hover:bg-cyan-500/10 transition group focus:outline-none focus:bg-cyan-50/80 dark:focus:bg-cyan-500/15"
                        >
                          <div className="flex items-baseline gap-3">
                            <span className="mono text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                              {s.name}
                            </span>
                            <span className="mono text-xs text-zinc-500 dark:text-zinc-400">{s.ip}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${zoneTone}`}>
                              {zone?.name ?? s.zone_id}
                            </span>
                            {s.service_type && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400">
                                {s.service_type}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {s.purpose ?? s.description}
                            {s.owner_team && (
                              <>
                                <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
                                <span className="text-zinc-600 dark:text-zinc-300">{s.owner_team}</span>
                              </>
                            )}
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
