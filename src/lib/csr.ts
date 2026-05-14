import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { CsrFormInput, CsrSubmission, RuleInput } from '../types'

function pad(n: number, w: number): string {
  return n.toString().padStart(w, '0')
}

function generateCsrNumber(): string {
  const now = new Date()
  const ymd =
    pad(now.getFullYear(), 4) +
    pad(now.getMonth() + 1, 2) +
    pad(now.getDate(), 2)
  // 4-digit running suffix derived from timestamp seconds — pilot only
  const suffix = pad((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % 10000, 4)
  return `CSR-${ymd}-${suffix}`
}

export async function submitCsr(
  form: CsrFormInput,
  rules: RuleInput[],
): Promise<CsrSubmission> {
  const id = generateCsrNumber()
  const payload: CsrSubmission = {
    id,
    ...form,
    rules,
    created_at: new Date().toISOString(),
  }
  // Mock: 실제로는 사내 CSR 시스템 API를 호출하지만, 파일럿은 Firestore에 보관
  await setDoc(doc(db, 'csr_requests', id), {
    ...payload,
    created_at_server: serverTimestamp(),
  })
  return payload
}
