import type { WorkshopComponent, WorkshopWire, SolveResult } from './types'
import { buildNodeGraph } from './nodeGraph'
import { solveLinear } from '@my-modern-app/math-engine'
import { measureMultimeterDC } from './solver-multimeter'
import { detectFaultsDC } from './solver-faults'
import { getMatrixBuffers } from './matrixBuffer'
import { updateRelayStates } from './relayStates'
export { updateRelayStates }

const VT = 0.02585
const IS = 1e-12
const ETA = 1.5

export function solveCircuit(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
): SolveResult {
  const nodeVoltages = new Map<number, number>()
  const componentCurrents = new Map<number, number>()
  const componentVoltages = new Map<number, number>()

  if (components.length === 0) {
    return { nodeVoltages, componentCurrents, componentVoltages, converged: true, iterations: 0, faults: [] }
  }

  const { terminalNodeIndex, nodeToIndex, numNodes, find } = buildNodeGraph(components, wires, 'battery')

  if (numNodes === 0) {
    return { nodeVoltages, componentCurrents, componentVoltages, converged: true, iterations: 0, faults: [] }
  }

  const batteries = components.filter(c => c.type === 'battery' || c.type === 'solarcell')
  const opamps = components.filter(c => c.type === 'opamp')
  const numVS = batteries.length + opamps.length
  const size = numNodes + numVS

  const maxIter = 20
  let converged = false
  let prevX: number[] = new Array(size).fill(0)
  let actualIter = 0

  for (let iter = 0; iter < maxIter; iter++) {
    const { G, RHS } = getMatrixBuffers(size)
    let opampIndex = 0

    const addConductance = (n1: number, n2: number, g: number) => {
      if (n1 === n2) return
      G[n1 * size + n1] += g
      G[n2 * size + n2] += g
      G[n1 * size + n2] -= g
      G[n2 * size + n1] -= g
    }

    const getTerminalNode = (compId: number, termIndex: number): number => {
      return terminalNodeIndex.get(`${compId}:${termIndex}`) ?? 0
    }

    for (const comp of components) {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)

      if (comp.type === 'resistor' || comp.type === 'lamp' || comp.type === 'thermistor' || comp.type === 'buzzer') {
        const R = comp.value || 1
        addConductance(n0, n1, 1 / R)
      } else if (comp.type === 'led') {
        const Vf = comp.value || 2
        const Vd = prevX[n0] - prevX[n1]
        const Id = Vd > Vf ? (Vd - Vf) / 100 : 0
        const Gd = Vd > Vf ? 1 / 100 : 1e-12
        const Ieq = Id - Gd * Vd
        addConductance(n0, n1, Gd)
        RHS[n0] -= Ieq
        RHS[n1] += Ieq
      } else if (comp.type === 'potentiometer') {
        const R = Math.max(comp.value || 1000, 1)
        addConductance(n0, n1, 1 / R)
        const wiper = getTerminalNode(comp.id, 2)
        const wiperRatio = comp.wiperRatio ?? 0.5
        const rWiper = R * wiperRatio
        addConductance(n0, wiper, 1 / Math.max(rWiper, 1e-6))
        addConductance(wiper, n1, 1 / Math.max(R - rWiper, 1e-6))
        addConductance(wiper, 0, 1e-12)
      } else if (comp.type === 'motor') {
        const R = Math.max(comp.value || 6, 1)
        addConductance(n0, n1, 1 / R)
      } else if (comp.type === 'ammeter') {
        addConductance(n0, n1, 1e6)
      } else if (comp.type === 'voltmeter') {
        addConductance(n0, n1, 1e-8)
      } else if (comp.type === 'multimeter') {
        // Skip — measures via probes/clamp
      } else if (comp.type === 'switch') {
        if (comp.closed) {
          addConductance(n0, n1, 1e6)
        } else {
          addConductance(n0, n1, 1e-12)
        }
      } else if (comp.type === 'breaker') {
        if (comp.breakerTripped) {
          addConductance(n0, n1, 1e-12)
        } else {
          addConductance(n0, n1, 1e6)
        }
      } else if (comp.type === 'fuse') {
        if (comp.fuseBlown) {
          addConductance(n0, n1, 1e-12)
        } else {
          addConductance(n0, n1, 1e6)
        }
      } else if (comp.type === 'ground') {
        // Ground is already node 0
      } else if (comp.type === 'capacitor') {
        addConductance(n0, n1, 1e-12)
      } else if (comp.type === 'inductor') {
        addConductance(n0, n1, 1e6)
      } else if (comp.type === 'battery' || comp.type === 'solarcell') {
        const vsIdx = batteries.indexOf(comp)
        const row = numNodes + vsIdx
        G[n0 * size + row] += 1
        G[n1 * size + row] -= 1
        G[row * size + n0] += 1
        G[row * size + n1] -= 1
        RHS[row] = comp.value
      } else if (comp.type === 'diode') {
        const Vd = prevX[n0] - prevX[n1]
        const Id = IS * (Math.exp(Vd / (ETA * VT)) - 1)
        const Gd = (IS / (ETA * VT)) * Math.exp(Vd / (ETA * VT))
        const Ieq = Id - Gd * Vd
        addConductance(n0, n1, Gd)
        RHS[n0] -= Ieq
        RHS[n1] += Ieq
      } else if (comp.type === 'relay') {
        const a1Node = getTerminalNode(comp.id, 0)
        const a2Node = getTerminalNode(comp.id, 1)
        const comNode = getTerminalNode(comp.id, 2)
        const noNode = getTerminalNode(comp.id, 3)
        const ncNode = getTerminalNode(comp.id, 4)
        const coilR = 100
        addConductance(a1Node, a2Node, 1 / coilR)
        if (comp.relayState) {
          addConductance(comNode, noNode, 1e6)
          addConductance(comNode, ncNode, 1e-12)
        } else {
          addConductance(comNode, ncNode, 1e6)
          addConductance(comNode, noNode, 1e-12)
        }
      } else if (comp.type === 'zener') {
        const Vz = comp.value || 5.1
        const Vd = prevX[n0] - prevX[n1]
        if (Vd >= 0) {
          const Id = IS * (Math.exp(Vd / (ETA * VT)) - 1)
          const Gd = (IS / (ETA * VT)) * Math.exp(Vd / (ETA * VT))
          const Ieq = Id - Gd * Vd
          addConductance(n0, n1, Gd)
          RHS[n0] -= Ieq
          RHS[n1] += Ieq
        } else if (Vd <= -Vz) {
          const Vdz = Vd + Vz
          const Iz = IS * (Math.exp(-Vdz / (ETA * VT)) - 1)
          const Gz = (IS / (ETA * VT)) * Math.exp(-Vdz / (ETA * VT))
          const Ieq = -Iz - Gz * Vd
          addConductance(n0, n1, Gz)
          RHS[n0] -= Ieq
          RHS[n1] += Ieq
        } else {
          addConductance(n0, n1, 1e-12)
        }
      } else if (comp.type === 'npn' || comp.type === 'pnp') {
        const beta = comp.beta || 100
        const isNpn = comp.type === 'npn'
        const b = getTerminalNode(comp.id, 0)
        const c = getTerminalNode(comp.id, 1)
        const e = getTerminalNode(comp.id, 2)
        const vBE = isNpn ? prevX[b] - prevX[e] : prevX[e] - prevX[b]
        const Vt = 0.02585
        const Ic = beta * IS * (Math.exp(vBE / Vt) - 1)
        const Ib = Ic / beta
        const gm = Ic / Vt
        const gmu = 1e-6
        const IeqC = Ic - gm * vBE
        const sign = isNpn ? 1 : -1
        RHS[c] -= sign * IeqC
        RHS[e] += sign * IeqC
        RHS[b] -= sign * Ib
        addConductance(b, e, gm / beta)
        G[c * size + b] += sign * gm
        G[e * size + b] -= sign * gm
        G[b * size + c] += sign * gmu
        G[e * size + c] -= sign * gmu
        addConductance(c, e, gmu)
      } else if (comp.type === 'opamp') {
        const A = comp.opampGain || 100000
        const inp = getTerminalNode(comp.id, 0)
        const inn = getTerminalNode(comp.id, 1)
        const out = getTerminalNode(comp.id, 2)
        const vsRow = numNodes + batteries.length + opampIndex
        G[out * size + vsRow] += 1
        G[vsRow * size + out] += 1
        G[vsRow * size + inp] += A
        G[vsRow * size + inn] -= A
        opampIndex++
      }
    }

    const X = solveLinear(G, RHS, size)
    if (!X) {
      return { nodeVoltages, componentCurrents, componentVoltages, converged: false, iterations: iter, faults: [] }
    }
    const XArr: number[] = Array.from(X)

    let maxDiff = 0
    for (let i = 0; i < size; i++) {
      maxDiff = Math.max(maxDiff, Math.abs(XArr[i] - prevX[i]))
    }
    prevX = XArr

    if (maxDiff < 1e-9 && iter > 0) {
      converged = true
      actualIter = iter
      break
    }
  }

  const X = prevX
  for (const [, idx] of nodeToIndex) {
    nodeVoltages.set(idx, X[idx] ?? 0)
  }

  for (const comp of components) {
    const n0 = terminalNodeIndex.get(`${comp.id}:0`) ?? 0
    const n1 = terminalNodeIndex.get(`${comp.id}:1`) ?? 0
    const v0 = X[n0]
    const v1 = X[n1]
    const V = v0 - v1
    if (comp.type !== 'multimeter') componentVoltages.set(comp.id, V)

    if (comp.type === 'battery' || comp.type === 'solarcell') {
      const vsIdx = batteries.indexOf(comp)
      componentCurrents.set(comp.id, X[numNodes + vsIdx])
    } else if (comp.type === 'resistor' || comp.type === 'lamp' || comp.type === 'thermistor' || comp.type === 'buzzer') {
      componentCurrents.set(comp.id, V / (comp.value || 1))
    } else if (comp.type === 'led') {
      const Vf = comp.value || 2
      componentCurrents.set(comp.id, V > Vf ? (V - Vf) / 100 : 0)
    } else if (comp.type === 'potentiometer') {
      componentCurrents.set(comp.id, V / Math.max(comp.value || 1000, 1))
    } else if (comp.type === 'motor') {
      componentCurrents.set(comp.id, V / Math.max(comp.value || 6, 1))
    } else if (comp.type === 'ammeter') {
      componentCurrents.set(comp.id, V * 1e6)
    } else if (comp.type === 'switch') {
      componentCurrents.set(comp.id, comp.closed ? V * 1e6 : 0)
    } else if (comp.type === 'breaker') {
      componentCurrents.set(comp.id, comp.breakerTripped ? 0 : V * 1e6)
    } else if (comp.type === 'fuse') {
      componentCurrents.set(comp.id, comp.fuseBlown ? 0 : V * 1e6)
    } else if (comp.type === 'capacitor') {
      componentCurrents.set(comp.id, 0)
    } else if (comp.type === 'inductor') {
      componentCurrents.set(comp.id, V * 1e6)
    } else if (comp.type === 'diode') {
      componentCurrents.set(comp.id, IS * (Math.exp(V / (ETA * VT)) - 1))
    } else if (comp.type === 'voltmeter') {
      componentCurrents.set(comp.id, V * 1e-8)
    } else if (comp.type === 'relay') {
      const a1Node = terminalNodeIndex.get(`${comp.id}:0`) ?? 0
      const a2Node = terminalNodeIndex.get(`${comp.id}:1`) ?? 0
      const coilV = X[a1Node] - X[a2Node]
      componentCurrents.set(comp.id, coilV / 100)
    } else if (comp.type === 'zener') {
      const Vz = comp.value || 5.1
      if (V >= 0) {
        componentCurrents.set(comp.id, IS * (Math.exp(V / (ETA * VT)) - 1))
      } else if (V <= -Vz) {
        const Vdz = V + Vz
        componentCurrents.set(comp.id, -(IS * (Math.exp(-Vdz / (ETA * VT)) - 1)))
      } else {
        componentCurrents.set(comp.id, 0)
      }
    } else if (comp.type === 'npn' || comp.type === 'pnp') {
      const beta = comp.beta || 100
      const isNpn = comp.type === 'npn'
      const b = terminalNodeIndex.get(`${comp.id}:0`) ?? 0
      const e = terminalNodeIndex.get(`${comp.id}:2`) ?? 0
      const vBE = isNpn ? X[b] - X[e] : X[e] - X[b]
      const Vt = 0.02585
      const Ic = beta * IS * (Math.exp(vBE / Vt) - 1)
      componentCurrents.set(comp.id, Ic)
    } else if (comp.type === 'opamp') {
      const opampIdx = opamps.indexOf(comp)
      const vsRow = numNodes + batteries.length + opampIdx
      componentCurrents.set(comp.id, X[vsRow] ?? 0)
    } else {
      componentCurrents.set(comp.id, 0)
    }
  }

  measureMultimeterDC(components, wires, terminalNodeIndex, X, componentCurrents, componentVoltages)

  const faults = detectFaultsDC(components, wires, componentCurrents, componentVoltages, find)

  return { nodeVoltages, componentCurrents, componentVoltages, converged, iterations: converged ? actualIter : maxIter, faults }
}
