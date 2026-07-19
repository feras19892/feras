import type { WorkshopComponent, WorkshopWire, TransientResult } from './types'
import { buildNodeGraph } from './nodeGraph'
import { solveLinear } from '@my-modern-app/math-engine'

export function solveCircuitTransientDC(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  totalTime: number = 0.1,
  numSteps: number = 200,
): TransientResult {
  const battery = components.find(c => c.type === 'battery')
  if (!battery) {
    return { timePoints: [], nodeVoltages: [], componentCurrents: [], componentVoltages: [], converged: false }
  }

  const hasCap = components.some(c => c.type === 'capacitor')
  const hasInd = components.some(c => c.type === 'inductor')
  if (!hasCap && !hasInd) {
    return { timePoints: [], nodeVoltages: [], componentCurrents: [], componentVoltages: [], converged: false }
  }

  const { terminalNodeIndex, numNodes } = buildNodeGraph(components, wires, 'battery')
  if (numNodes === 0) {
    return { timePoints: [], nodeVoltages: [], componentCurrents: [], componentVoltages: [], converged: false }
  }

  function getTerminalNode(compId: number, termIndex: number): number {
    return terminalNodeIndex.get(`${compId}:${termIndex}`) ?? 0
  }

  const batteries = components.filter(c => c.type === 'battery')
  const numVS = batteries.length
  const size = numNodes + numVS

  const timePoints: number[] = []
  const nodeVoltages: number[][] = []
  const componentCurrents: number[][] = []
  const componentVoltages: number[][] = []

  const capState = new Map<number, { vPrev: number; iPrev: number }>()
  const indState = new Map<number, { vPrev: number; iPrev: number }>()
  const capVal = new Map<number, number>()
  const indVal = new Map<number, number>()

  let maxRC = 0
  let maxRL = 0
  for (const comp of components) {
    if (comp.type === 'capacitor') {
      const C = comp.value * 1e-6
      capState.set(comp.id, { vPrev: 0, iPrev: 0 })
      capVal.set(comp.id, C)
      for (const r of components) {
        if (r.type === 'resistor') {
          maxRC = Math.max(maxRC, r.value * C)
        }
      }
    } else if (comp.type === 'inductor') {
      const L = comp.value * 1e-3
      indState.set(comp.id, { vPrev: 0, iPrev: 0 })
      indVal.set(comp.id, L)
      for (const r of components) {
        if (r.type === 'resistor') {
          maxRL = Math.max(maxRL, L / r.value)
        }
      }
    }
  }

  const maxTau = Math.max(maxRC, maxRL)
  if (maxTau > 0) {
    totalTime = Math.max(totalTime, maxTau * 5)
  }
  const actualDt = totalTime / numSteps

  const capGeq = new Map<number, number>()
  const indGeq = new Map<number, number>()
  for (const [id, C] of capVal) capGeq.set(id, 2 * C / actualDt)
  for (const [id, L] of indVal) indGeq.set(id, actualDt / (2 * L))

  function buildAndSolve(t: number): number[] | null {
    const G = new Array(size * size).fill(0)
    const RHS = new Array(size).fill(0)

    function addG(n1: number, n2: number, g: number) {
      if (n1 === n2) return
      G[n1 * size + n1] += g
      G[n2 * size + n2] += g
      G[n1 * size + n2] -= g
      G[n2 * size + n1] -= g
    }

    for (const comp of components) {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)

      if (comp.type === 'resistor' || comp.type === 'lamp') {
        addG(n0, n1, 1 / Math.max(comp.value, 1e-6))
      } else if (comp.type === 'led') {
        addG(n0, n1, 1 / 100)
      } else if (comp.type === 'motor') {
        addG(n0, n1, 1 / Math.max(comp.value || 6, 1e-6))
      } else if (comp.type === 'potentiometer') {
        const R = Math.max(comp.value || 1000, 1)
        addG(n0, n1, 1 / R)
      } else if (comp.type === 'ammeter') {
        addG(n0, n1, 1e6)
      } else if (comp.type === 'voltmeter') {
        addG(n0, n1, 1e-12)
      } else if (comp.type === 'switch') {
        addG(n0, n1, comp.closed ? 1e6 : 1e-12)
      } else if (comp.type === 'breaker') {
        addG(n0, n1, comp.breakerTripped ? 1e-12 : 1e6)
      } else if (comp.type === 'fuse') {
        addG(n0, n1, comp.fuseBlown ? 1e-12 : 1e6)
      } else if (comp.type === 'capacitor') {
        const Geq = capGeq.get(comp.id)!
        addG(n0, n1, Geq)
        const st = capState.get(comp.id)!
        const Ieq = Geq * st.vPrev + st.iPrev
        RHS[n0] += Ieq
        RHS[n1] -= Ieq
      } else if (comp.type === 'inductor') {
        const Geq = indGeq.get(comp.id)!
        addG(n0, n1, Geq)
        const st = indState.get(comp.id)!
        const Ieq = st.iPrev + Geq * st.vPrev
        RHS[n0] -= Ieq
        RHS[n1] += Ieq
      } else if (comp.type === 'diode') {
        addG(n0, n1, 1e-6)
      } else if (comp.type === 'relay') {
        const coilR = 100
        addG(n0, n1, 1 / coilR)
        const comNode = getTerminalNode(comp.id, 2)
        const noNode = getTerminalNode(comp.id, 3)
        const ncNode = getTerminalNode(comp.id, 4)
        if (comp.relayState) {
          addG(comNode, noNode, 1e6)
          addG(comNode, ncNode, 1e-12)
        } else {
          addG(comNode, ncNode, 1e6)
          addG(comNode, noNode, 1e-12)
        }
      } else if (comp.type === 'battery') {
        const vsIdx = batteries.indexOf(comp)
        const row = numNodes + vsIdx
        G[n0 * size + row] += 1
        G[n1 * size + row] -= 1
        G[row * size + n0] += 1
        G[row * size + n1] -= 1
        RHS[row] = comp.value
      }
    }

    return solveLinear(G, RHS, size)
  }

  for (let step = 0; step <= numSteps; step++) {
    const t = step * actualDt
    const x = buildAndSolve(t)
    if (!x) {
      return { timePoints, nodeVoltages, componentCurrents, componentVoltages, converged: false }
    }

    timePoints.push(t)
    const nv: number[] = []
    for (let i = 0; i < numNodes; i++) nv.push(x[i])
    nodeVoltages.push(nv)

    const cv: number[] = []
    const cc: number[] = []
    for (const comp of components) {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      const v = x[n0] - x[n1]
      cv.push(v)

      if (comp.type === 'battery') {
        const vsIdx = batteries.indexOf(comp)
        cc.push(x[numNodes + vsIdx])
      } else if (comp.type === 'resistor' || comp.type === 'lamp') {
        cc.push(v / Math.max(comp.value, 1e-6))
      } else if (comp.type === 'ammeter') {
        cc.push(v * 1e6)
      } else if (comp.type === 'switch') {
        cc.push(comp.closed ? v * 1e6 : 0)
      } else if (comp.type === 'capacitor') {
        const st = capState.get(comp.id)!
        const Geq = capGeq.get(comp.id)!
        const Ieq = Geq * st.vPrev + st.iPrev
        const iNew = Geq * v - Ieq
        cc.push(iNew)
        st.vPrev = v
        st.iPrev = iNew
      } else if (comp.type === 'inductor') {
        const st = indState.get(comp.id)!
        const Geq = indGeq.get(comp.id)!
        const Ieq = st.iPrev + Geq * st.vPrev
        const iNew = Geq * v + Ieq
        cc.push(iNew)
        st.vPrev = v
        st.iPrev = iNew
      } else if (comp.type === 'relay') {
        cc.push(v / 100)
      } else if (comp.type === 'led') {
        const Vf = comp.value || 2
        cc.push(v > Vf ? (v - Vf) / 100 : 0)
      } else if (comp.type === 'motor') {
        cc.push(v / Math.max(comp.value || 6, 1e-6))
      } else if (comp.type === 'potentiometer') {
        cc.push(v / Math.max(comp.value || 1000, 1))
      } else {
        cc.push(0)
      }
    }
    componentVoltages.push(cv)
    componentCurrents.push(cc)
  }

  return { timePoints, nodeVoltages, componentCurrents, componentVoltages, converged: true }
}
