import type { WorkshopComponent, WorkshopWire } from './types'

export const STORAGE_KEY_DC = 'electric-workshop-state-dc'
export const STORAGE_KEY_AC = 'electric-workshop-state-ac'
export const STORAGE_VERSION = 1

export type PersistedWorkshopState = {
  version: number
  components: WorkshopComponent[]
  wires: WorkshopWire[]
  idCounter: number
}

export function saveState(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  storageKey: string,
  idCounter: number,
) {
  try {
    const data = {
      version: STORAGE_VERSION,
      components: components.map(c => ({ ...c, terminals: c.terminals.map(t => ({ ...t })) })),
      wires: wires.map(w => ({ ...w, points: [...w.points] })),
      idCounter,
    }
    localStorage.setItem(storageKey, JSON.stringify(data))
  } catch (e) {
    // ignore storage errors
  }
}

export function loadState(storageKey: string): PersistedWorkshopState | null {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || data.version !== STORAGE_VERSION || !data.components || !data.wires) {
      localStorage.removeItem(storageKey)
      return null
    }
    return { version: data.version, components: data.components, wires: data.wires, idCounter: data.idCounter }
  } catch (e) {
    try { localStorage.removeItem(storageKey) } catch { /* ignore */ }
    return null
  }
}

const CIRCUITS_KEY = 'electric-workshop-saved-circuits'

export function saveCircuit(
  name: string,
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  idCounter: number,
): boolean {
  try {
    const raw = localStorage.getItem(CIRCUITS_KEY)
    const list: { name: string; data: any }[] = raw ? JSON.parse(raw) : []
    const data = {
      version: STORAGE_VERSION,
      components: components.map(c => ({ ...c, terminals: c.terminals.map(t => ({ ...t })) })),
      wires: wires.map(w => ({ ...w, points: [...w.points] })),
      idCounter,
    }
    const idx = list.findIndex(c => c.name === name)
    if (idx >= 0) list[idx].data = data
    else list.push({ name, data })
    localStorage.setItem(CIRCUITS_KEY, JSON.stringify(list))
    return true
  } catch (e) {
    return false
  }
}

export function getSavedCircuits(): string[] {
  try {
    const raw = localStorage.getItem(CIRCUITS_KEY)
    if (!raw) return []
    const list: { name: string; data: any }[] = JSON.parse(raw)
    return list.map(c => c.name)
  } catch (e) {
    return []
  }
}

export function deleteCircuit(name: string): boolean {
  try {
    const raw = localStorage.getItem(CIRCUITS_KEY)
    if (!raw) return false
    const list: { name: string; data: any }[] = JSON.parse(raw)
    const idx = list.findIndex(c => c.name === name)
    if (idx < 0) return false
    list.splice(idx, 1)
    localStorage.setItem(CIRCUITS_KEY, JSON.stringify(list))
    return true
  } catch (e) {
    return false
  }
}

export function loadCircuitData(name: string): PersistedWorkshopState | null {
  try {
    const raw = localStorage.getItem(CIRCUITS_KEY)
    if (!raw) return null
    const list: { name: string; data: any }[] = JSON.parse(raw)
    const found = list.find(c => c.name === name)
    if (!found) return null
    if (!found.data || found.data.version !== STORAGE_VERSION) return null
    return {
      version: found.data.version,
      components: found.data.components,
      wires: found.data.wires,
      idCounter: found.data.idCounter ?? 1,
    }
  } catch (e) {
    return null
  }
}
