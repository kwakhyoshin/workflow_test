export interface NetworkZone {
  id: string
  name: string
  cidr: string
}

export interface ServerFarm {
  id: string
  name: string
  zone_id: string
  cidr: string
}

export interface System {
  id: string
  name: string
  ip: string
  farm_id: string
  zone_id: string
  description: string
}

export interface Firewall {
  id: string
  name: string
  description: string
}

export interface ZoneConnection {
  id: string
  zone_a: string
  zone_b: string
  firewall_id: string
}

export type FirewallAction = 'ALLOW' | 'BLOCK'

export interface FirewallRule {
  id: string
  firewall_id: string
  src_cidr: string
  dst_cidr: string
  ports: number[] | 'ANY'
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'ANY'
  action: FirewallAction
}

export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'ANY'

export interface RuleInput {
  id: string                // local-only uuid
  src_ip: string
  dst_ip: string
  port: string              // raw input ("80", "80,443", "8000-8100")
  protocol: Protocol
}
