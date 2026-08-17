import type { WorkshopComponent, WorkshopWire, SolveResult, ACSolveResult, TransientResult } from './types'

export type SolverRequest = {
  id: number
  type: 'dc' | 'ac' | 'transient' | 'transient-dc'
  components: WorkshopComponent[]
  wires: WorkshopWire[]
  numCycles?: number
  steps?: number
}

export type SolverResponse = {
  id: number
  result: SolveResult | ACSolveResult | TransientResult | null
  error?: string
}

let worker: Worker | null = null
let nextId = 1
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()

function getWorker(): Worker | null {
  if (typeof window === 'undefined') return null
  if (worker) return worker
  try {
    worker = new Worker(new URL('./solver-worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<SolverResponse>) => {
      const { id, result, error } = e.data
      const p = pending.get(id)
      if (!p) return
      pending.delete(id)
      if (error) p.reject(new Error(error))
      else p.resolve(result)
    }
    worker.onerror = (err) => {
      console.error('[solver-worker] error:', err)
    }
  } catch {
    worker = null
  }
  return worker
}

export function solveInWorker(
  type: SolverRequest['type'],
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  opts?: { numCycles?: number; steps?: number },
): Promise<SolveResult | ACSolveResult | TransientResult | null> {
  const w = getWorker()
  if (!w) return Promise.resolve(null)

  const id = nextId++
  const req: SolverRequest = { id, type, components, wires, ...opts }

  return new Promise((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
    w.postMessage(req)
  })
}

export function isWorkerAvailable(): boolean {
  return getWorker() !== null
}
