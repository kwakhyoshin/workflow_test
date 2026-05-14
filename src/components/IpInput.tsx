import { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { findSystemByIp, isValidIPv4 } from '../lib/cmdb'
import type { System } from '../types'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

type LookupState =
  | { kind: 'idle' }
  | { kind: 'invalid' }
  | { kind: 'loading' }
  | { kind: 'found'; system: System }
  | { kind: 'not_found' }

export function IpInput({ value, onChange, placeholder }: Props) {
  const debounced = useDebounce(value, 300)
  const [state, setState] = useState<LookupState>({ kind: 'idle' })

  useEffect(() => {
    const ip = debounced.trim()
    if (!ip) { setState({ kind: 'idle' }); return }
    if (!isValidIPv4(ip)) { setState({ kind: 'invalid' }); return }
    let cancelled = false
    setState({ kind: 'loading' })
    findSystemByIp(ip).then((sys) => {
      if (cancelled) return
      setState(sys ? { kind: 'found', system: sys } : { kind: 'not_found' })
    }).catch(() => { if (!cancelled) setState({ kind: 'not_found' }) })
    return () => { cancelled = true }
  }, [debounced])

  return (
    <div className="flex flex-col">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? '10.30.1.10'}
        className="input-dark mono w-40 px-3 py-2 text-sm rounded-md"
      />
      <div className="mt-1.5 min-h-[18px] text-[11px] tracking-tight font-medium">
        {state.kind === 'idle'      && <span className="text-zinc-700">—</span>}
        {state.kind === 'invalid'   && <span className="text-amber-400">⚠ IP 형식 오류</span>}
        {state.kind === 'loading'   && <span className="text-zinc-500">조회중…</span>}
        {state.kind === 'not_found' && <span className="text-zinc-500">CMDB 미등록</span>}
        {state.kind === 'found'     && (
          <span className="text-cyan-300" title={state.system.description}>
            <span className="mr-1">●</span>{state.system.name}
          </span>
        )}
      </div>
    </div>
  )
}
