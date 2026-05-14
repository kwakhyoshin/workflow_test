// CIDR 매칭 + 포트 파싱 유틸

export function ipToInt(ip: string): number {
  const parts = ip.split('.').map((o) => parseInt(o, 10))
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255)) return NaN
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

export function cidrContains(cidr: string, ip: string): boolean {
  const [base, maskStr] = cidr.split('/')
  const mask = parseInt(maskStr, 10)
  if (isNaN(mask) || mask < 0 || mask > 32) return false
  if (mask === 0) return true
  const ipInt = ipToInt(ip)
  const baseInt = ipToInt(base)
  if (isNaN(ipInt) || isNaN(baseInt)) return false
  const maskBits = mask === 32 ? 0xffffffff : (0xffffffff << (32 - mask)) >>> 0
  return ((ipInt & maskBits) >>> 0) === ((baseInt & maskBits) >>> 0)
}

/** 사용자 포트 입력을 number[]로 파싱한다.
 *  지원: "80", "80,443", "8000-8005", "80, 8000-8005"
 *  실패 시 null. */
export function parsePorts(input: string): number[] | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const out: number[] = []
  for (const part of trimmed.split(',').map((s) => s.trim())) {
    if (!part) return null
    if (part.includes('-')) {
      const [aStr, bStr] = part.split('-')
      const a = parseInt(aStr, 10)
      const b = parseInt(bStr, 10)
      if (isNaN(a) || isNaN(b) || a > b || a < 1 || b > 65535) return null
      if (b - a > 10000) return null
      for (let p = a; p <= b; p++) out.push(p)
    } else {
      const p = parseInt(part, 10)
      if (isNaN(p) || p < 1 || p > 65535) return null
      out.push(p)
    }
  }
  return out.length ? out : null
}

/** rule.ports (number[] | 'ANY')가 요청 포트들과 교집합이 있는지 */
export function portsOverlap(
  requested: number[],
  rulePorts: number[] | 'ANY',
): boolean {
  if (rulePorts === 'ANY') return true
  const ruleSet = new Set(rulePorts)
  return requested.some((p) => ruleSet.has(p))
}
