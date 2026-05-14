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
  description: string         // 짧은 라벨 (UI 표시용)
  purpose?: string            // 비즈니스 용도 상세 — AI 사유 추론용 컨텍스트
  owner_team?: string         // 운영 담당 팀
  service_type?: string       // "Web Server" | "Database" | "API Gateway" 등
  typical_ports?: number[]    // 일반적으로 열려있는 포트
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

export type Duration = 'permanent' | 'temporary'
export type Impact   = 'urgent' | 'normal' | 'low'

export interface CsrFormInput {
  requester_name:  string
  employee_id:     string
  department:      string
  reason:          string
  due_date:        string    // YYYY-MM-DD
  duration:        Duration
  end_date?:       string    // temporary일 때만
  impact:          Impact
}

export type CsrStatus = 'received' | 'reviewing' | 'in_progress' | 'completed' | 'rejected'

export interface CsrSubmission extends CsrFormInput {
  id:           string        // CSR-YYYYMMDD-NNNN
  rules:        RuleInput[]   // 신청 대상 룰들
  created_at:   string        // ISO timestamp
  status?:      CsrStatus     // 서버에서 진행상태 (없으면 'received'로 간주)
}
