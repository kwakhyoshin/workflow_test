import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import type {
  Firewall,
  FirewallRule,
  NetworkZone,
  ServerFarm,
  ZoneConnection,
} from '../types'

export interface Topology {
  zones: NetworkZone[]
  farms: ServerFarm[]
  firewalls: Firewall[]
  connections: ZoneConnection[]
  rules: FirewallRule[]
}

async function fetchCollection<T>(name: string): Promise<T[]> {
  const snap = await getDocs(collection(db, name))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[]
}

export async function loadTopology(): Promise<Topology> {
  const [zones, farms, firewalls, connections, rules] = await Promise.all([
    fetchCollection<NetworkZone>('network_zones'),
    fetchCollection<ServerFarm>('server_farms'),
    fetchCollection<Firewall>('firewalls'),
    fetchCollection<ZoneConnection>('zone_connections'),
    fetchCollection<FirewallRule>('firewall_rules'),
  ])
  return { zones, farms, firewalls, connections, rules }
}
