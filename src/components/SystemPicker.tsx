import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  'zone-dmz':    'bg-violet-500/15  dark:bg-violet-500/25  text-violet-700  dark:text-violet-100  border-violet-500/40  dark:border-violet-400/60',
  'zone-biz':    'bg-sky-500/15     dark:bg-sky-500/25     text-sky-700     dark:text-sky-100     border-sky-500/40     dark:border-sky-400/60',
  'zone-office': 'bg-teal-500/15    dark:bg-teal-500/25    text-teal-700    dark:text-teal-100    border-teal-500/40    dark:border-teal-400/60',
  'zone-dev':    'bg-amber-500/15   dark:bg-amber-500/25   text-amber-700   dark:text-amber-100   border-amber-500/40   dark:border-amber-400/60',
  'zone-db':     'bg-rose-500/15    dark:bg-rose-500/25    text-rose-700    dark:text-rose-100    border-rose-500/40    dark:border-rose-400/60',
  'zone-sec':    'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-100 border-emerald-500/40 dark:border-emerald-400/60',
  'zone-infra':  'bg-lime-500/15    dark:bg-lime-500/25    text-lime-700    dark:text-lime-100    border-lime-500/40    dark:border-lime-400/60',
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center modal-backdrop p-4 pt-[10vh]" onClick={onClose}>
      <div
        className="glass relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-white/[0.14] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-300 mb-1">
              CMDB · System Picker
            </div>
            <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">시스템 선택</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-white/[0.10] transition"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-white/[0.14] bg-zinc-50/40 dark:bg-black/20">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-300 text-sm">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, IP, 용도, 담당팀, 서비스 유형으로 검색…"
              className="input-themed w-full pl-9 pr-3 py-2 text-sm rounded-md"
            />
          </div>
          <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-200">
            <span className="mono font-semibold">{filtered.length}</span> / {systems.length} systems
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {grouped.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-300">
              검색 결과가 없습니다
            </div>
          ) : (
            grouped.map(({ farm, items }) => (
              <div key={farm.id} className="border-b border-zinc-200/60 dark:border-white/[0.12] last:border-none">
                <div className="px-5 py-2 bg-zinc-50/80 dark:bg-white/[0.06] text-[10px] uppercase tracking-widest font-semibold text-zinc-600 dark:text-zinc-200 flex items-center justify-between border-b border-zinc-200/40 dark:border-white/[0.08]">
                  <span>{farm.name}</span>
                  <span className="mono text-zinc-500 dark:text-zinc-300">{items.length}</span>
                </div>
                <ul>
                  {items.map((s) => {
                    const zoneTone = ZONE_TONE[s.zone_id] ?? 'bg-zinc-500/15 dark:bg-zinc-500/25 text-zinc-700 dark:text-zinc-100 border-zinc-500/40 dark:border-zinc-400/60'
                    const zone = zones.find((z) => z.id === s.zone_id)
                    return (
                      <li key={s.id} className="border-t border-zinc-100 dark:border-white/[0.06] first:border-none">
                        <button
                          type="button"
                          onClick={() => onSelect(s)}
                          className="w-full text-left px-5 py-3 hover:bg-cyan-50/60 dark:hover:bg-cyan-500/15 transition group focus:outline-none focus:bg-cyan-50/80 dark:focus:bg-cyan-500/20"
                        >
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="mono text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-cyan-700 dark:group-hover:text-cyan-200">
                              {s.name}
                            </span>
                            <span className="mono text-xs text-zinc-600 dark:text-zinc-200">{s.ip}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${zoneTone}`}>
                              {zone?.name ?? s.zone_id}
                            </span>
                            {s.service_type && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.10] border border-zinc-200 dark:border-white/[0.20] text-zinc-700 dark:text-zinc-100 font-medium">
                                {s.service_type}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-200 line-clamp-1">
                            {s.purpose ?? s.description}
                            {s.owner_team && (
                              <>
                                <span className="mx-1.5 text-zinc-400 dark:text-zinc-500">·</span>
                                <span className="text-zinc-700 dark:text-zinc-100 font-medium">{s.owner_team}</span>
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
    </div>,
    document.body,
  )
}
