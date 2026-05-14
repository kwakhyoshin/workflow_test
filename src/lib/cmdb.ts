import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'
import type { System } from '../types'

const ipv4Re = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/

export function isValidIPv4(ip: string): boolean {
  return ipv4Re.test(ip.trim())
}

/**
 * IP로 시스템을 조회한다. 매칭 없으면 null.
 */
export async function findSystemByIp(ip: string): Promise<System | null> {
  if (!isValidIPv4(ip)) return null
  const q = query(collection(db, 'systems'), where('ip', '==', ip.trim()))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const docSnap = snap.docs[0]
  return { id: docSnap.id, ...(docSnap.data() as Omit<System, 'id'>) }
}
