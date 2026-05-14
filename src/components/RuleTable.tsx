import { Fragment, useEffect, useMemo, useState } from 'react'
import type { Protocol, RuleInput } from '../types'
import { IpInput } from './IpInput'
import { ResultBadge, ResultDetail } from './ResultBadge'
import { loadTopology, type Topology } from '../lib/topology'
import { judge, type JudgmentResult } from '../lib/judge'
import { CsrPanel } from './CsrPanel'

function newRule(): RuleInput {
  return {
    id: crypto.randomUUID(),
    src_ip: '',
    dst_ip: '',
    port: '',
    protocol: 'TCP',
  }
}

export function RuleTable() {
  const [rules, setRules] = useState<RuleInput[]>([newRule()])
  const [results, setResults] = useState<Record<string, JudgmentResult>>({})
  const [topo, setTopo] = useState<Topology | null>(null)
  const [topoError, setTopoError] = useState<string | null>(null)
  const [csrOpen, setCsrOpen] = useState(false)

  useEffect(() => {
    loadTopology()
      .then(setTopo)
      .catch((e) => setTopoError(String(e?.message ?? e)))
  }, [])

  const update = (id: string, patch: Partial<RuleInput>) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    setResults((res) => {
      if (!(id in res)) return res
      const next = { ...res }
      delete next[id]
      return next
    })
  }
  const remove = (id: string) => {
    setRules((rs) => (rs.length <= 1 ? rs : rs.filter((r) => r.id !== id)))
    setResults((res) => {
      const next = { ...res }
      delete next[id]
      return next
    })
  }
  const add = () => setRules((rs) => [...rs, newRule()])

  const evaluate = () => {
    if (!topo) return
    const next: Record<string, JudgmentResult> = {}
    for (const r of rules) next[r.id] = judge(r, topo)
    setResults(next)
  }

  // CSR 신청 대상: BLOCKED 또는 NO_ROUTE 결과를 가진 룰들
  const csrEligibleRules = useMemo(() => {
    return rules.filter((r) => {
      const res = results[r.id]
      return res && (res.kind === 'BLOCKED' || res.kind === 'NO_ROUTE')
    })
  }, [rules, results])

  const evaluated = Object.keys(results).length > 0

  return (
    <>
    <div className="glass rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/[0.14] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
          <span className="text-zinc-500 dark:text-zinc-300">Status</span>
          {topoError ? (
            <span className="text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-300" />
              error
            </span>
          ) : !topo ? (
            <span className="text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-300 dot-pulse" />
              loading topology
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300" />
              ready
            </span>
          )}
        </div>
        <div className="text-[11px] text-zinc-600 dark:text-zinc-200">
          {rules.length} rule{rules.length !== 1 && 's'}
          {evaluated && (
            <span className="ml-2 text-zinc-500 dark:text-zinc-400">·  {Object.keys(results).length} evaluated</span>
          )}
        </div>
      </div>

      {topoError && (
        <div className="px-6 py-2 bg-rose-50 dark:bg-rose-500/5 border-b border-rose-200 dark:border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
          {topoError}
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-600 dark:text-zinc-200 text-[10px] uppercase tracking-widest border-b border-zinc-200 dark:border-white/[0.15] bg-zinc-50/40 dark:bg-white/[0.03]">
            <th className="px-5 py-3 text-left w-12 font-semibold">#</th>
            <th className="px-3 py-3 text-left font-semibold">Source IP</th>
            <th className="px-3 py-3 text-left font-semibold">Destination IP</th>
            <th className="px-3 py-3 text-left font-semibold">Port</th>
            <th className="px-3 py-3 text-left font-semibold">Protocol</th>
            <th className="px-3 py-3 text-left font-semibold">Result</th>
            <th className="px-3 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r, idx) => {
            const result = results[r.id]
            return (
              <Fragment key={r.id}>
                <tr className="border-b border-zinc-100 dark:border-white/[0.10] hover:bg-zinc-50/40 dark:hover:bg-white/[0.05] transition align-top">
                  <td className="px-5 py-4 mono text-zinc-500 dark:text-zinc-300 text-xs">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-3 py-3">
                    <IpInput
                      value={r.src_ip}
                      onChange={(v) => update(r.id, { src_ip: v })}
                      systems={topo?.systems}
                      zones={topo?.zones}
                      farms={topo?.farms}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <IpInput
                      value={r.dst_ip}
                      onChange={(v) => update(r.id, { dst_ip: v })}
                      systems={topo?.systems}
                      zones={topo?.zones}
                      farms={topo?.farms}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={r.port}
                      onChange={(e) => update(r.id, { port: e.target.value })}
                      placeholder={r.protocol === 'ICMP' ? '(ICMP)' : '80, 443'}
                      disabled={r.protocol === 'ICMP'}
                      className="input-themed mono w-32 px-3 py-2 text-sm rounded-md"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={r.protocol}
                      onChange={(e) => update(r.id, { protocol: e.target.value as Protocol })}
                      className="input-themed px-2.5 py-2 text-sm rounded-md cursor-pointer"
                    >
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="ICMP">ICMP</option>
                      <option value="ANY">ANY</option>
                    </select>
                  </td>
                  <td className="px-3 py-4">
                    {result ? <ResultBadge result={result} /> : <span className="text-xs text-zinc-400 dark:text-zinc-500">—</span>}
                  </td>
                  <td className="px-3 py-4">
                    <button
                      onClick={() => remove(r.id)}
                      disabled={rules.length <= 1}
                      className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/15 disabled:text-zinc-300 dark:disabled:text-zinc-600 disabled:hover:bg-transparent disabled:cursor-not-allowed rounded transition"
                      title="이 룰 삭제"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
                {result && (
                  <tr className="bg-zinc-50/60 dark:bg-white/[0.04] border-b border-zinc-100 dark:border-white/[0.10]">
                    <td></td>
                    <td colSpan={6} className="px-3 py-4">
                      <ResultDetail result={result} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>

      <div className="px-5 py-4 border-t border-zinc-200 dark:border-white/[0.14] bg-zinc-50/60 dark:bg-black/30 flex items-center justify-between">
        <button onClick={add} className="btn-secondary px-3 py-1.5 text-xs font-medium rounded-md">
          + 룰 추가
        </button>
        <div className="flex items-center gap-3">
          {csrEligibleRules.length > 0 && (
            <span className="text-[11px] text-rose-600 dark:text-rose-300 font-medium">
              ⚠ {csrEligibleRules.length}건 조치 필요
            </span>
          )}
          <button
            onClick={() => setCsrOpen(true)}
            disabled={csrEligibleRules.length === 0}
            className="btn-secondary px-4 py-2 text-xs font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
            title={csrEligibleRules.length === 0 ? '판정 결과에 방화벽 신청/라우팅 필요 항목이 있어야 활성화됩니다.' : ''}
          >
            CSR 요청
          </button>
          <button
            onClick={evaluate}
            disabled={!topo}
            className="btn-primary px-6 py-2 text-xs rounded-md tracking-wide"
          >
            조회 →
          </button>
        </div>
      </div>

    </div>

    <CsrPanel
      open={csrOpen}
      onClose={() => setCsrOpen(false)}
      rulesForRequest={csrEligibleRules}
    />
    </>
  )
}
