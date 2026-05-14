import type {
  Firewall,
  FirewallRule,
  NetworkZone,
  RuleInput,
  ZoneConnection,
} from '../types'
import { cidrContains, parsePorts, portsOverlap } from './network'
import type { Topology } from './topology'

export type ResultKind =
  | 'INCOMPLETE'
  | 'UNREGISTERED'
  | 'SAME_ZONE'
  | 'NO_ROUTE'
  | 'ALLOWED'
  | 'BLOCKED'

export interface JudgmentResult {
  kind: ResultKind
  message: string
  srcZone?: NetworkZone
  dstZone?: NetworkZone
  pathFirewalls: Firewall[]
  blockingFirewall?: Firewall
  matchedRules: FirewallRule[]
}

function findPath(
  srcId: string,
  dstId: string,
  connections: ZoneConnection[],
): string[] | null {
  // BFS — returns ordered list of firewall_ids in the path
  const adj = new Map<string, Array<{ zone: string; fw: string }>>()
  for (const c of connections) {
    if (!adj.has(c.zone_a)) adj.set(c.zone_a, [])
    if (!adj.has(c.zone_b)) adj.set(c.zone_b, [])
    adj.get(c.zone_a)!.push({ zone: c.zone_b, fw: c.firewall_id })
    adj.get(c.zone_b)!.push({ zone: c.zone_a, fw: c.firewall_id })
  }
  const queue: Array<{ zone: string; fws: string[] }> = [
    { zone: srcId, fws: [] },
  ]
  const visited = new Set<string>([srcId])
  while (queue.length) {
    const cur = queue.shift()!
    if (cur.zone === dstId) return cur.fws
    for (const n of adj.get(cur.zone) ?? []) {
      if (visited.has(n.zone)) continue
      visited.add(n.zone)
      queue.push({ zone: n.zone, fws: [...cur.fws, n.fw] })
    }
  }
  return null
}

export function judge(rule: RuleInput, topo: Topology): JudgmentResult {
  const empty = { pathFirewalls: [] as Firewall[], matchedRules: [] as FirewallRule[] }

  // 1. 입력 완성도 체크
  if (!rule.src_ip || !rule.dst_ip) {
    return { kind: 'INCOMPLETE', message: 'IP 입력 미완성', ...empty }
  }
  const ports = rule.protocol === 'ICMP' ? [] : parsePorts(rule.port)
  if (rule.protocol !== 'ICMP' && !ports) {
    return { kind: 'INCOMPLETE', message: '포트 형식 오류 또는 미입력', ...empty }
  }

  // 2. Zone 매칭 (CIDR)
  const srcZone = topo.zones.find((z) => cidrContains(z.cidr, rule.src_ip))
  const dstZone = topo.zones.find((z) => cidrContains(z.cidr, rule.dst_ip))
  if (!srcZone || !dstZone) {
    const missing = !srcZone && !dstZone ? '출발지·도착지' : !srcZone ? '출발지' : '도착지'
    return {
      kind: 'UNREGISTERED',
      message: `${missing} IP가 알려진 네트워크 구간에 속하지 않습니다 (자산 등록 필요)`,
      srcZone, dstZone,
      ...empty,
    }
  }

  // 3. 같은 Zone?
  if (srcZone.id === dstZone.id) {
    return {
      kind: 'SAME_ZONE',
      message: `동일 구간(${srcZone.name}) 내 통신 — 방화벽 신청 불필요`,
      srcZone, dstZone,
      ...empty,
    }
  }

  // 4. 경로 탐색
  const fwIds = findPath(srcZone.id, dstZone.id, topo.connections)
  if (!fwIds) {
    return {
      kind: 'NO_ROUTE',
      message: `${srcZone.name} ↔ ${dstZone.name} 사이 네트워크 경로 없음 — 라우팅 작업 필요`,
      srcZone, dstZone,
      ...empty,
    }
  }
  const pathFirewalls = fwIds.map((id) => topo.firewalls.find((f) => f.id === id)!)

  // 5. 경로 상 각 방화벽에서 룰 평가
  const matchedRules: FirewallRule[] = []
  for (const fw of pathFirewalls) {
    const applicable = topo.rules.filter((r) => {
      if (r.firewall_id !== fw.id) return false
      if (!cidrContains(r.src_cidr, rule.src_ip)) return false
      if (!cidrContains(r.dst_cidr, rule.dst_ip)) return false
      if (rule.protocol !== 'ICMP' && ports && !portsOverlap(ports, r.ports)) return false
      if (r.protocol !== 'ANY' && r.protocol !== rule.protocol) return false
      return true
    })

    // BLOCK 우선
    const blockRule = applicable.find((r) => r.action === 'BLOCK')
    if (blockRule) {
      return {
        kind: 'BLOCKED',
        message: `${fw.name}에서 BLOCK 룰(${blockRule.src_cidr} → ${blockRule.dst_cidr})에 의해 차단됨 — 방화벽 신청 필요`,
        srcZone, dstZone,
        pathFirewalls,
        blockingFirewall: fw,
        matchedRules: [...matchedRules, blockRule],
      }
    }
    const allowRule = applicable.find((r) => r.action === 'ALLOW')
    if (allowRule) {
      matchedRules.push(allowRule)
    } else {
      return {
        kind: 'BLOCKED',
        message: `${fw.name}에 매칭되는 ALLOW 룰이 없음 (기본 차단) — 방화벽 신청 필요`,
        srcZone, dstZone,
        pathFirewalls,
        blockingFirewall: fw,
        matchedRules,
      }
    }
  }

  return {
    kind: 'ALLOWED',
    message: `경로 상 모든 방화벽(${pathFirewalls.map((f) => f.name).join(', ')}) 통과 — 통신 가능`,
    srcZone, dstZone,
    pathFirewalls,
    matchedRules,
  }
}
