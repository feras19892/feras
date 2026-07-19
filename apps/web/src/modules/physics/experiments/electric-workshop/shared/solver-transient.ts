import type { WorkshopComponent, WorkshopWire, TransientResult } from './types'
import { buildNodeGraph } from './nodeGraph'

export function solveCircuitTransient(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  numCycles: number = 3,
  stepsPerCycle: number = 50,
): TransientResult {
  const acSource = components.find(c => c.type === 'acsource')
  if (!acSource) {
    return { timePoints: [], nodeVoltages: [], componentCurrents: [], componentVoltages: [], converged: false }
  }

  const freq = acSource.acFrequency ?? 50
  const omega = 2 * Math.PI * freq
  const period = 1 / freq
  const dt = Math.max(period / stepsPerCycle, 1e-6)
  const totalSteps = numCycles * stepsPerCycle

  const timePoints: number[] = []
  const nodeVoltages: number[][] = []
  const componentCurrents: number[][] = []
  const componentVoltages: number[][] = []

  const { terminalNodeIndex, numNodes } = buildNodeGraph(components, wires, 'acsource')

  if (numNodes === 0) {
    return { timePoints: [], nodeVoltages: [], componentCurrents: [], componentVoltages: [], converged: false }
  }

  function getTerminalNode(compId: number, termIndex: number): number {
    return terminalNodeIndex.get(`${compId}:${termIndex}`) ?? 0
  }

  const acSources = components.filter(c => c.type === 'acsource')
  const transformers = components.filter(c => c.type === 'transformer')
  const numVS = acSources.length + transformers.length
  const size = numNodes + numVS

  const G = new Array(size * size).fill(0)
  const RHSbase = new Array(size).fill(0)

  function addG(n1: number, n2: number, g: number) {
    if (n1 === n2) return
    G[n1 * size + n1] += g
    G[n2 * size + n2] += g
    G[n1 * size + n2] -= g
    G[n2 * size + n1] -= g
  }

  function buildG() {
    G.fill(0)
    for (const comp of components) {
      if (comp.type === 'resistor') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, 1 / Math.max(comp.value, 1e-6))
      } else if (comp.type === 'lamp') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, 1 / Math.max(comp.value * comp.value / 5, 1))
      } else if (comp.type === 'led') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, 1 / 100)
      } else if (comp.type === 'potentiometer') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, 1 / Math.max(comp.value || 1000, 1e-6))
      } else if (comp.type === 'motor') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, 1 / Math.max(comp.value || 6, 1e-6))
      } else if (comp.type === 'switch') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, comp.closed ? 1e6 : 1e-12)
      } else if (comp.type === 'ammeter') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, 1e6)
      } else if (comp.type === 'voltmeter') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, 1e-12)
      } else if (comp.type === 'capacitor') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        const C = comp.value * 1e-6
        const Geq = 2 * C / dt
        addG(n0, n1, Geq)
      } else if (comp.type === 'inductor') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        const L = comp.value * 1e-3
        const Geq = dt / (2 * L)
        addG(n0, n1, Geq)
      } else if (comp.type === 'relay') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        const L = Math.max(comp.value, 1) * 1e-3
        const Geq = dt / (2 * L)
        addG(n0, n1, Geq)
        const nc0 = getTerminalNode(comp.id, 2)
        const nc1 = getTerminalNode(comp.id, 3)
        addG(nc0, nc1, comp.relayState ? 1e6 : 1e-12)
      } else if (comp.type === 'diode') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, 1e-6)
      } else if (comp.type === 'breaker') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, comp.breakerTripped ? 1e-12 : 1e6)
      } else if (comp.type === 'fuse') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        addG(n0, n1, comp.fuseBlown ? 1e-12 : 1e6)
      }
    }

    let vsIdx2 = 0
    for (const src of acSources) {
      const n0 = getTerminalNode(src.id, 0)
      const n1 = getTerminalNode(src.id, 1)
      const vsRow = numNodes + vsIdx2
      G[n0 * size + vsRow] += 1
      G[vsRow * size + n0] += 1
      G[n1 * size + vsRow] -= 1
      G[vsRow * size + n1] -= 1
      vsIdx2++
    }
    for (const tf of transformers) {
      const sp0 = getTerminalNode(tf.id, 0)
      const sp1 = getTerminalNode(tf.id, 1)
      const ss0 = getTerminalNode(tf.id, 2)
      const ss1 = getTerminalNode(tf.id, 3)
      const vsRow = numNodes + vsIdx2
      G[ss0 * size + vsRow] += 1
      G[vsRow * size + ss0] += 1
      G[ss1 * size + vsRow] -= 1
      G[vsRow * size + ss1] -= 1
      vsIdx2++
    }
  }

  function factorLU(): { luG: number[]; pivots: Int32Array } {
    const luG = [...G]
    const pivots = new Int32Array(size)
    for (let col = 0; col < size; col++) {
      let maxVal = 0
      let pivot = col
      for (let row = col; row < size; row++) {
        if (Math.abs(luG[row * size + col]) > maxVal) {
          maxVal = Math.abs(luG[row * size + col])
          pivot = row
        }
      }
      if (maxVal < 1e-15) {
        pivots[col] = col
        luG[col * size + col] = 1
        continue
      }
      pivots[col] = pivot
      if (pivot !== col) {
        for (let j = 0; j < size; j++) {
          [luG[col * size + j], luG[pivot * size + j]] = [luG[pivot * size + j], luG[col * size + j]]
        }
      }
      const diag = luG[col * size + col]
      for (let row = col + 1; row < size; row++) {
        const factor = luG[row * size + col] / diag
        luG[row * size + col] = factor
        for (let j = col + 1; j < size; j++) {
          luG[row * size + j] -= factor * luG[col * size + j]
        }
      }
    }
    return { luG, pivots }
  }

  buildG()
  let lu = factorLU()

  const capState = new Map<number, { vPrev: number; iPrev: number }>()
  const indState = new Map<number, { vPrev: number; iPrev: number }>()
  const capGeq = new Map<number, number>()
  const indGeq = new Map<number, number>()
  const tfPrimaryVPrev = new Map<number, number>()
  for (const comp of components) {
    if (comp.type === 'capacitor') {
      capState.set(comp.id, { vPrev: 0, iPrev: 0 })
      capGeq.set(comp.id, 2 * (comp.value * 1e-6) / dt)
    } else if (comp.type === 'inductor') {
      indState.set(comp.id, { vPrev: 0, iPrev: 0 })
      indGeq.set(comp.id, dt / (2 * (comp.value * 1e-3)))
    } else if (comp.type === 'relay') {
      indState.set(comp.id, { vPrev: 0, iPrev: 0 })
      indGeq.set(comp.id, dt / (2 * (Math.max(comp.value, 1) * 1e-3)))
    } else if (comp.type === 'transformer') {
      tfPrimaryVPrev.set(comp.id, 0)
    }
  }

  function solveAtTime(t: number): number[] {
    const RHS = [...RHSbase]
    let vsI = 0
    for (const src of acSources) {
      const Vrms = src.acAmplitude ?? src.value
      const Vpeak = Vrms * Math.SQRT2
      const phase = ((src.acPhase ?? 0) * Math.PI) / 180
      const vsRow = numNodes + vsI
      RHS[vsRow] = Vpeak * Math.sin(omega * t + phase)
      vsI++
    }
    for (const comp of components) {
      if (comp.type === 'capacitor') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        const st = capState.get(comp.id)!
        const Geq = capGeq.get(comp.id)!
        const Ieq = Geq * st.vPrev + st.iPrev
        RHS[n0] += Ieq
        RHS[n1] -= Ieq
      } else if (comp.type === 'inductor' || comp.type === 'relay') {
        const n0 = getTerminalNode(comp.id, 0)
        const n1 = getTerminalNode(comp.id, 1)
        const st = indState.get(comp.id)!
        const Geq = indGeq.get(comp.id)!
        const Ieq = st.iPrev + Geq * st.vPrev
        RHS[n0] -= Ieq
        RHS[n1] += Ieq
      }
    }
    let tfVsI = 0
    for (const tf of transformers) {
      const ratio = tf.transformerRatio ?? 1
      const vsRow = numNodes + acSources.length + tfVsI
      RHS[vsRow] = (tfPrimaryVPrev.get(tf.id) ?? 0) * ratio
      tfVsI++
    }
    const x = new Array(size).fill(0)
    const { luG, pivots } = lu
    for (let i = 0; i < size; i++) {
      const p = pivots[i]
      ;[RHS[i], RHS[p]] = [RHS[p], RHS[i]]
      x[i] = RHS[i]
      for (let j = 0; j < i; j++) {
        x[i] -= luG[i * size + j] * x[j]
      }
    }
    for (let i = size - 1; i >= 0; i--) {
      for (let j = i + 1; j < size; j++) {
        x[i] -= luG[i * size + j] * x[j]
      }
      x[i] /= luG[i * size + i]
    }
    return x
  }

  for (let step = 0; step <= totalSteps; step++) {
    const t = step * dt
    const x = solveAtTime(t)
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
      if (comp.type === 'resistor') {
        cc.push(v / Math.max(comp.value, 1e-6))
      } else if (comp.type === 'lamp') {
        cc.push(v / Math.max(comp.value * comp.value / 5, 1))
      } else if (comp.type === 'switch') {
        cc.push(comp.closed ? v / 1e-6 : 0)
      } else if (comp.type === 'ammeter') {
        cc.push(v / 1e-6)
      } else if (comp.type === 'acsource') {
        const vsRow = numNodes + acSources.indexOf(comp)
        cc.push(x[vsRow])
      } else if (comp.type === 'transformer') {
        const sp0 = getTerminalNode(comp.id, 0)
        const sp1 = getTerminalNode(comp.id, 1)
        const vPri = x[sp0] - x[sp1]
        tfPrimaryVPrev.set(comp.id, vPri)
        const tfVsIdx = transformers.indexOf(comp)
        const vsRow = numNodes + acSources.length + tfVsIdx
        cc.push(x[vsRow])
      } else if (comp.type === 'relay') {
        const st = indState.get(comp.id)!
        const Geq = indGeq.get(comp.id)!
        const Ieq = st.iPrev + Geq * st.vPrev
        const iNew = Geq * v + Ieq
        cc.push(iNew)
        st.vPrev = v
        st.iPrev = iNew
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

    let relayChanged = false
    for (const comp of components) {
      if (comp.type === 'relay') {
        const st = indState.get(comp.id)
        if (st) {
          const coilI = Math.abs(st.iPrev)
          const threshold = comp.value * 1e-3
          const newState = coilI > threshold
          if (newState !== comp.relayState) {
            comp.relayState = newState
            relayChanged = true
          }
        }
      }
    }
    if (relayChanged) {
      buildG()
      lu = factorLU()
    }
  }

  return { timePoints, nodeVoltages, componentCurrents, componentVoltages, converged: true }
}
