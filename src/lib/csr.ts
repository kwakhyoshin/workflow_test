import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { CsrFormInput, CsrStatus, CsrSubmission, RuleInput } from '../types'

function pad(n: number, w: number): string {
  return n.toString().padStart(w, '0')
}

function generateCsrNumber(): string {
  const now = new Date()
  const ymd =
    pad(now.getFullYear(), 4) +
    pad(now.getMonth() + 1, 2) +
    pad(now.getDate(), 2)
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
    status: 'received',
  }
  await setDoc(doc(db, 'csr_requests', id), {
    ...payload,
    created_at_server: serverTimestamp(),
  })
  return payload
}

export async function listCsrRequests(): Promise<CsrSubmission[]> {
  // 최신 순. created_at은 ISO 문자열이라 사전순 = 시간순.
  const q = query(collection(db, 'csr_requests'), orderBy('created_at', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as CsrSubmission[]
}

export async function getCsrRequest(id: string): Promise<CsrSubmission | null> {
  const snap = await getDoc(doc(db, 'csr_requests', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as object) } as CsrSubmission
}

/** 신청 시점 대비 경과 시간으로 상태 자동 진행 (목업) */
export function deriveStatus(submission: CsrSubmission): CsrStatus {
  if (submission.status && submission.status !== 'received') return submission.status
  const elapsedH = (Date.now() - new Date(submission.created_at).getTime()) / 1000 / 3600
  if (elapsedH < 0.5)  return 'received'
  if (elapsedH < 4)    return 'reviewing'
  if (elapsedH < 24)   return 'in_progress'
  return 'completed'
}

export const STATUS_META: Record<CsrStatus, { label: string; cls: string; dot: string; order: number }> = {
  received:    { label: '접수됨',   cls: 'bg-zinc-100    dark:bg-white/[0.05]   text-zinc-700    dark:text-zinc-300    border-zinc-200    dark:border-white/[0.10]',  dot: 'bg-zinc-400    dark:bg-zinc-500',    order: 1 },
  reviewing:   { label: '검토 중',  cls: 'bg-amber-50    dark:bg-amber-500/10   text-amber-700   dark:text-amber-300   border-amber-200   dark:border-amber-500/30',   dot: 'bg-amber-500   dark:bg-amber-400',   order: 2 },
  in_progress: { label: '처리 중',  cls: 'bg-sky-50      dark:bg-sky-500/10     text-sky-700     dark:text-sky-300     border-sky-200     dark:border-sky-500/30',     dot: 'bg-sky-500     dark:bg-sky-400',     order: 3 },
  completed:   { label: '완료',     cls: 'bg-emerald-50  dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30', dot: 'bg-emerald-500 dark:bg-emerald-400', order: 4 },
  rejected:    { label: '반려',     cls: 'bg-rose-50     dark:bg-rose-500/10    text-rose-700    dark:text-rose-300    border-rose-200    dark:border-rose-500/30',    dot: 'bg-rose-500    dark:bg-rose-400',    order: 0 },
}
