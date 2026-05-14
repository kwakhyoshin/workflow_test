import { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { findSystemByIp, isValidIPv4 } from '../lib/cmdb'
import type { NetworkZone, ServerFarm, System } from '../types'
import { SystemPicker } from './SystemPicker'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  // CMDB picker용 데이터 (있으면 [📋] 버튼 표시)
  systems?: System[]
  zones?: NetworkZone[]
  farms?: ServerFarm[]
}

type LookupState =
  | { kind: 'idle' }
  | { kind: 'invalid' }
  | { kind: 'loading' }
  | { kind: 'found'; system: System }
  | { kind: 'not_found' }

export function IpInput({ value, onChange, placeholder, systems, zones, farms }: Props) {
  const debounced = useDebounce(value, 300)
  const [state, setState] = useState<LookupState>({ kind: 'idle' })
  const [pickerOpen, setPickerOpen] = useState(false)

  const canPick = !!(systems && zones && farms)

  useEffect(() => {
    const ip = debounced.trim()
    if (!ip) { setState({ kind: 'idle' }); return }
    if (!isValidIPv4(ip)) { setState({ kind: 'invalid' }); return }
    // CMDB가 메모리에 있으면 우선 거기서 찾고, 없으면 Firestore 호출
    if (systems) {
      const found = systems.find((s) => s.ip === ip)
      setState(found ? { kind: 'found', system: found } : { kind: 'not_found' })
      return
    }
    let cancelled = false
    setState({ kind: 'loading' })
    findSystemByIp(ip).then((sys) => {
      if (cancelled) return
      setState(sys ? { kind: 'found', system: sys } : { kind: 'not_found' })
    }).catch(() => { if (!cancelled) setState({ kind: 'not_found' }) })
    return () => { cancelled = true }
  }, [debounced, systems])

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '10.30.1.10'}
          className="input-themed mono w-36 px-3 py-2 text-sm rounded-md"
        />
        {canPick && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-zinc-500 dark:text-zinc-400 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.10] hover:text-cyan-700 dark:hover:text-cyan-300 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:bg-cyan-50/60 dark:hover:bg-cyan-500/10 transition"
            title="시스템 목록에서 선택"
            aria-label="시스템 선택"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="4" rx="1" />
              <rect x="3" y="10" width="18" height="4" rx="1" />
              <rect x="3" y="16" width="18" height="4" rx="1" />
              <path d="M7 6h.01M7 12h.01M7 18h.01" />
            </svg>
          </button>
        )}
      </div>
      <div className="mt-1.5 min-h-[18px] text-[11px] tracking-tight font-medium">
        {state.kind === 'idle'      && <span className="text-zinc-400 dark:text-zinc-600">—</span>}
        {state.kind === 'invalid'   && <span className="text-amber-600 dark:text-amber-400">⚠ IP 형식 오류</span>}
        {state.kind === 'loading'   && <span className="text-zinc-500 dark:text-zinc-400">조회중…</span>}
        {state.kind === 'not_found' && <span className="text-zinc-500 dark:text-zinc-400">CMDB 미등록</span>}
        {state.kind === 'found'     && (
          <span className="text-cyan-700 dark:text-cyan-300" title={state.system.description}>
            <span className="mr-1">●</span>{state.system.name}
          </span>
        )}
      </div>

      {canPick && (
        <SystemPicker
          open={pickerOpen}
          systems={systems!}
          zones={zones!}
          farms={farms!}
          onSelect={(s) => {
            onChange(s.ip)
            setPickerOpen(false)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
