import type { JudgmentResult } from '../lib/judge'

// 각 zone에 대해 색상 톤 매핑 (네트워크 구성도 색상과 통일)
const ZONE_TONE: Record<string, { bg: string; ring: string; text: string }> = {
  'zone-dmz':    { bg: 'from-violet-500/20 to-violet-500/5',   ring: 'ring-violet-500/40',  text: 'text-violet-700 dark:text-violet-300' },
  'zone-biz':    { bg: 'from-sky-500/20    to-sky-500/5',      ring: 'ring-sky-500/40',     text: 'text-sky-700    dark:text-sky-300' },
  'zone-office': { bg: 'from-teal-500/20   to-teal-500/5',     ring: 'ring-teal-500/40',    text: 'text-teal-700   dark:text-teal-300' },
  'zone-dev':    { bg: 'from-amber-500/20  to-amber-500/5',    ring: 'ring-amber-500/40',   text: 'text-amber-700  dark:text-amber-300' },
  'zone-db':     { bg: 'from-rose-500/20   to-rose-500/5',     ring: 'ring-rose-500/40',    text: 'text-rose-700   dark:text-rose-300' },
  'zone-sec':    { bg: 'from-emerald-500/20 to-emerald-500/5', ring: 'ring-emerald-500/40', text: 'text-emerald-700 dark:text-emerald-300' },
  'zone-infra':  { bg: 'from-lime-500/20   to-lime-500/5',     ring: 'ring-lime-500/40',    text: 'text-lime-700   dark:text-lime-300' },
}

function zoneTone(id: string | undefined) {
  return id ? ZONE_TONE[id] ?? { bg: 'from-zinc-500/20 to-zinc-500/5', ring: 'ring-zinc-500/40', text: 'text-zinc-700 dark:text-zinc-300' }
            : { bg: 'from-zinc-500/20 to-zinc-500/5', ring: 'ring-zinc-500/40', text: 'text-zinc-700 dark:text-zinc-300' }
}

export function TopologyPath({ result }: { result: JudgmentResult }) {
  if (result.kind === 'INCOMPLETE') return null

  // UNREGISTERED — IP가 어디에도 속하지 않는 경우
  if (result.kind === 'UNREGISTERED') {
    return (
      <div className="flex items-center justify-center gap-3 py-2">
        <UnknownNode label="Source" sublabel={result.srcZone ? result.srcZone.name : '?'} known={!!result.srcZone} />
        <BrokenLink />
        <UnknownNode label="Destination" sublabel={result.dstZone ? result.dstZone.name : '?'} known={!!result.dstZone} />
      </div>
    )
  }

  // SAME_ZONE — 같은 구간
  if (result.kind === 'SAME_ZONE') {
    const tone = zoneTone(result.srcZone?.id)
    return (
      <div className="flex items-center justify-center gap-3 py-2">
        <EndpointNode tone={tone} title={result.srcSystem?.name} subtitle={result.srcZone?.name ?? ''} />
        <SameZoneConnector toneColor={tone.text} zoneName={result.srcZone?.name} />
        <EndpointNode tone={tone} title={result.dstSystem?.name} subtitle={result.dstZone?.name ?? ''} />
      </div>
    )
  }

  // NO_ROUTE — 경로 없음
  if (result.kind === 'NO_ROUTE') {
    const sTone = zoneTone(result.srcZone?.id)
    const dTone = zoneTone(result.dstZone?.id)
    return (
      <div className="flex items-center justify-center gap-3 py-2">
        <EndpointNode tone={sTone} title={result.srcSystem?.name} subtitle={result.srcZone?.name ?? ''} />
        <BrokenLink label="라우팅 작업 필요" />
        <EndpointNode tone={dTone} title={result.dstSystem?.name} subtitle={result.dstZone?.name ?? ''} />
      </div>
    )
  }

  // ALLOWED or BLOCKED — render full path with zones + firewalls
  const zones = result.pathZones
  const firewalls = result.pathFirewalls
  const blockIdx = result.blockingHopIndex

  // Build nodes: [zoneStart, fw0, zoneMid, fw1, zoneMid2, ..., fwN-1, zoneEnd]
  const elements: React.ReactNode[] = []

  for (let i = 0; i < zones.length; i++) {
    const z = zones[i]
    const tone = zoneTone(z.id)
    const isFirst = i === 0
    const isLast = i === zones.length - 1
    elements.push(
      <EndpointNode
        key={`z-${z.id}-${i}`}
        tone={tone}
        title={isFirst ? result.srcSystem?.name : isLast ? result.dstSystem?.name : undefined}
        subtitle={z.name}
        label={isFirst ? 'Source' : isLast ? 'Destination' : 'Transit'}
      />
    )

    if (i < firewalls.length) {
      const fw = firewalls[i]
      let fwStatus: 'ok' | 'block' | 'dimmed' = 'ok'
      if (blockIdx !== undefined) {
        if (i < blockIdx) fwStatus = 'ok'
        else if (i === blockIdx) fwStatus = 'block'
        else fwStatus = 'dimmed'
      }
      const linkStatus: 'ok' | 'block' | 'dimmed' = fwStatus
      elements.push(<Connector key={`l-${i}-a`} status={linkStatus} />)
      elements.push(<FirewallNode key={`fw-${fw.id}-${i}`} name={fw.name} description={fw.description} status={fwStatus} />)
      const nextLinkStatus =
        fwStatus === 'ok' ? 'ok' : fwStatus === 'block' ? 'dimmed' : 'dimmed'
      elements.push(<Connector key={`l-${i}-b`} status={nextLinkStatus} />)
    }
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-stretch justify-start gap-1.5 min-w-fit py-1">
        {elements}
      </div>
    </div>
  )
}

/* ───────────── Sub-components ───────────── */

function EndpointNode({
  tone, title, subtitle, label,
}: {
  tone: { bg: string; ring: string; text: string }
  title?: string
  subtitle: string
  label?: 'Source' | 'Destination' | 'Transit'
}) {
  return (
    <div className="flex flex-col items-center min-w-[110px]">
      {label && (
        <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
          {label}
        </div>
      )}
      <div className={`relative w-[100px] rounded-lg bg-gradient-to-b ${tone.bg} ring-1 ${tone.ring} px-2.5 py-2 shadow-sm`}>
        <div className={`text-[10px] uppercase tracking-wider font-semibold ${tone.text} text-center`}>
          {subtitle || '—'}
        </div>
        {title && (
          <div className="mono text-[11px] font-bold text-zinc-800 dark:text-zinc-50 text-center mt-0.5 truncate" title={title}>
            {title}
          </div>
        )}
      </div>
    </div>
  )
}

function UnknownNode({ label, sublabel, known }: { label: string; sublabel: string; known: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[100px]">
      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">{label}</div>
      <div className={'w-[100px] rounded-lg px-2.5 py-2 ring-1 text-center ' + (known
        ? 'bg-zinc-100 dark:bg-white/[0.04] ring-zinc-300 dark:ring-white/10 text-zinc-700 dark:text-zinc-300'
        : 'bg-amber-50 dark:bg-amber-500/10 ring-amber-300 dark:ring-amber-500/40 text-amber-700 dark:text-amber-300')}>
        <div className="text-[10px] uppercase tracking-wider font-semibold">{sublabel}</div>
        {!known && <div className="text-[10px] mt-0.5 opacity-80">미등록</div>}
      </div>
    </div>
  )
}

function FirewallNode({
  name, description, status,
}: { name: string; description: string; status: 'ok' | 'block' | 'dimmed' }) {
  const cfg = {
    ok:      { ring: 'ring-emerald-500/50', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300', icon: '✓',  badge: '허용', badgeCls: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
    block:   { ring: 'ring-rose-500/60',    bg: 'bg-rose-500/15    dark:bg-rose-500/20',    text: 'text-rose-700    dark:text-rose-300',    icon: '🔥', badge: '신청 필요', badgeCls: 'bg-rose-500/25 text-rose-700 dark:text-rose-200' },
    dimmed:  { ring: 'ring-zinc-300 dark:ring-white/10', bg: 'bg-zinc-100 dark:bg-white/[0.03]', text: 'text-zinc-400 dark:text-zinc-600', icon: '·',  badge: '미도달', badgeCls: 'bg-zinc-200 dark:bg-white/[0.05] text-zinc-500 dark:text-zinc-500' },
  }[status]
  return (
    <div className="flex flex-col items-center min-w-[110px]">
      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Firewall</div>
      <div className={`relative w-[110px] rounded-lg ring-2 ${cfg.ring} ${cfg.bg} px-2 py-2 shadow-md ${status === 'block' ? 'shadow-rose-500/20' : ''}`}>
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm leading-none">{cfg.icon}</span>
          <span className={`mono text-[11px] font-bold ${cfg.text}`} title={description}>{name}</span>
        </div>
        <div className={`mt-1.5 text-[9px] font-semibold text-center uppercase tracking-wider px-1.5 py-0.5 rounded ${cfg.badgeCls}`}>
          {cfg.badge}
        </div>
      </div>
    </div>
  )
}

function Connector({ status }: { status: 'ok' | 'block' | 'dimmed' }) {
  const cfg = {
    ok:     { line: 'bg-emerald-500/60 dark:bg-emerald-400/60', arrow: 'border-l-emerald-500/60 dark:border-l-emerald-400/60' },
    block:  { line: 'bg-rose-500/70    dark:bg-rose-400/70',    arrow: 'border-l-rose-500/70    dark:border-l-rose-400/70' },
    dimmed: { line: 'bg-zinc-300       dark:bg-white/10',       arrow: 'border-l-zinc-300       dark:border-l-white/10' },
  }[status]
  return (
    <div className="flex items-center self-center mt-4">
      <div className={`w-6 h-[2px] ${cfg.line}`} />
      <div
        className={`w-0 h-0 border-y-[5px] border-y-transparent border-l-[7px] ${cfg.arrow}`}
      />
    </div>
  )
}

function BrokenLink({ label = '경로 없음' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center self-center mt-4">
      <div className="flex items-center text-amber-500 dark:text-amber-400">
        <span className="text-lg">⋯</span>
        <span className="text-lg mx-1">✕</span>
        <span className="text-lg">⋯</span>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mt-1">{label}</span>
    </div>
  )
}

function SameZoneConnector({ toneColor, zoneName }: { toneColor: string; zoneName?: string }) {
  return (
    <div className="flex flex-col items-center self-center mt-4">
      <div className={`w-16 h-[2px] ${toneColor.replace('text-', 'bg-')}`} style={{ opacity: 0.5 }} />
      <span className={`text-[9px] font-semibold uppercase tracking-wider ${toneColor} mt-1`}>{zoneName ?? '동일 구간'}</span>
    </div>
  )
}
