import type { WorkshopComponent, WorkshopWire, Complex, ACSolveResult } from './types'
import { buildNodeGraph } from './nodeGraph'
import { cSub, cDiv, solveComplexLinear } from '@my-modern-app/math-engine'
import { measureMultimeterAC } from './solver-multimeter'
import { detectFaultsAC } from './solver-faults'

export function solveCircuitAC(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
): ACSolveResult {
  const nodeVoltagePhasors = new Map<number, Complex>()
  const componentCurrentPhasors = new Map<number, Complex>()
  const componentVoltagePhasors = new Map<number, Complex>()

  if (components.length === 0) {
    return { nodeVoltagePhasors, componentCurrentPhasors, componentVoltagePhasors, converged: true, faults: [] }
  }

  const acSource = components.find(c => c.type === 'acsource')
  if (!acSource) {
    return { nodeVoltagePhasors, componentCurrentPhasors, componentVoltagePhasors, converged: true, faults: [] }
  }
  const freq = acSource.acFrequency ?? 50
  const omega = 2 * Math.PI * freq

  const { terminalNodeIndex, numNodes } = buildNodeGraph(components, wires, 'acsource')

  if (numNodes === 0) {
    return { nodeVoltagePhasors, componentCurrentPhasors, componentVoltagePhasors, converged: true, faults: [] }
  }

  const acSources = components.filter(c => c.type === 'acsource')
  const transformers = components.filter(c => c.type === 'transformer')
  const numVS = acSources.length + transformers.length * 2
  const size = numNodes + numVS

  const Gre = new Array(size * size).fill(0)
  const Gim = new Array(size * size).fill(0)
  const RHSre = new Array(size).fill(0)
  const RHSim = new Array(size).fill(0)

  function getTerminalNode(compId: number, termIndex: number): number {
    return terminalNodeIndex.get(`${compId}:${termIndex}`) ?? 0
  }

  function addY(n1: number, n2: number, y: Complex) {
    if (n1 === n2) return
    Gre[n1 * size + n1] += y.re; Gim[n1 * size + n1] += y.im
    Gre[n2 * size + n2] += y.re; Gim[n2 * size + n2] += y.im
    Gre[n1 * size + n2] -= y.re; Gim[n1 * size + n2] -= y.im
    Gre[n2 * size + n1] -= y.re; Gim[n2 * size + n1] -= y.im
  }

  for (const comp of components) {
    if (comp.type === 'resistor') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      const R = Math.max(comp.value, 1e-3)
      addY(n0, n1, { re: 1 / R, im: 0 })
    } else if (comp.type === 'capacitor') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      const C = comp.value * 1e-6
      addY(n0, n1, { re: 0, im: omega * C })
    } else if (comp.type === 'inductor') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      const L = comp.value * 1e-3
      addY(n0, n1, { re: 0, im: -1 / (omega * L) })
    } else if (comp.type === 'lamp') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      const R = Math.max(comp.value * comp.value / 5, 1)
      addY(n0, n1, { re: 1 / R, im: 0 })
    } else if (comp.type === 'led') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      addY(n0, n1, { re: 1 / 100, im: 0 })
    } else if (comp.type === 'potentiometer') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      const R = Math.max(comp.value || 1000, 1)
      addY(n0, n1, { re: 1 / R, im: 0 })
    } else if (comp.type === 'motor') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      const R = Math.max(comp.value || 6, 1)
      addY(n0, n1, { re: 1 / R, im: 0 })
    } else if (comp.type === 'switch') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      if (comp.closed) addY(n0, n1, { re: 1e6, im: 0 })
      else addY(n0, n1, { re: 1e-12, im: 0 })
    } else if (comp.type === 'ammeter') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      addY(n0, n1, { re: 1e6, im: 0 })
    } else if (comp.type === 'voltmeter') {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)
      addY(n0, n1, { re: 1e-12, im: 0 })
    } else if (comp.type === 'relay') {
      const a1 = getTerminalNode(comp.id, 0)
      const a2 = getTerminalNode(comp.id, 1)
      addY(a1, a2, { re: 1 / 100, im: 0 })
      const com = getTerminalNode(comp.id, 2)
      const no = getTerminalNode(comp.id, 3)
      const nc = getTerminalNode(comp.id, 4)
      if (comp.relayState) {
        addY(com, no, { re: 1e6, im: 0 })
        addY(com, nc, { re: 1e-12, im: 0 })
      } else {
        addY(com, no, { re: 1e-12, im: 0 })
        addY(com, nc, { re: 1e6, im: 0 })
      }
    }
  }

  let vsIdx = 0
  for (const src of acSources) {
    const n0 = getTerminalNode(src.id, 0)
    const n1 = getTerminalNode(src.id, 1)
    const vsRow = numNodes + vsIdx
    const Vrms = src.acAmplitude ?? src.value
    const phase = ((src.acPhase ?? 0) * Math.PI) / 180
    RHSre[vsRow] = Vrms * Math.cos(phase)
    RHSim[vsRow] = Vrms * Math.sin(phase)
    Gre[n0 * size + vsRow] += 1; Gim[n0 * size + vsRow] += 0
    Gre[vsRow * size + n0] += 1; Gim[vsRow * size + n0] += 0
    Gre[n1 * size + vsRow] -= 1; Gim[n1 * size + vsRow] += 0
    Gre[vsRow * size + n1] -= 1; Gim[vsRow * size + n1] += 0
    vsIdx++
  }

  for (const tf of transformers) {
    const p1 = getTerminalNode(tf.id, 0)
    const p2 = getTerminalNode(tf.id, 1)
    const s1 = getTerminalNode(tf.id, 2)
    const s2 = getTerminalNode(tf.id, 3)
    const n = tf.transformerRatio ?? tf.value
    const vsRow1 = numNodes + vsIdx
    const vsRow2 = numNodes + vsIdx + 1
    Gre[p1 * size + vsRow1] += 1; Gre[vsRow1 * size + p1] += 1
    Gre[p2 * size + vsRow1] -= 1; Gre[vsRow1 * size + p2] -= 1
    Gre[s1 * size + vsRow2] += 1; Gre[vsRow2 * size + s1] += 1
    Gre[s2 * size + vsRow2] -= 1; Gre[vsRow2 * size + s2] -= 1
    Gre[vsRow2 * size + s1] += 1; Gre[vsRow2 * size + s2] -= 1
    Gre[vsRow2 * size + p1] -= n; Gre[vsRow2 * size + p2] += n
    Gre[vsRow1 * size + vsRow1] += 1; Gre[vsRow1 * size + vsRow2] += n
    vsIdx += 2
  }

  const sol = solveComplexLinear(Gre, Gim, RHSre, RHSim, size)
  if (!sol) {
    return { nodeVoltagePhasors, componentCurrentPhasors, componentVoltagePhasors, converged: false, faults: [] }
  }
  const xre = sol.re
  const xim = sol.im

  for (let i = 0; i < numNodes; i++) {
    nodeVoltagePhasors.set(i, { re: xre[i], im: xim[i] })
  }

  vsIdx = 0
  for (const comp of components) {
    const n0 = getTerminalNode(comp.id, 0)
    const n1 = getTerminalNode(comp.id, 1)
    const v0 = { re: xre[n0], im: xim[n0] }
    const v1 = { re: xre[n1], im: xim[n1] }
    const vComp = cSub(v0, v1)
    componentVoltagePhasors.set(comp.id, vComp)

    if (comp.type === 'resistor') {
      const R = Math.max(comp.value, 1e-6)
      componentCurrentPhasors.set(comp.id, cDiv(vComp, { re: R, im: 0 }))
    } else if (comp.type === 'capacitor') {
      const C = comp.value * 1e-6
      const Zc = { re: 0, im: -1 / (omega * C) }
      componentCurrentPhasors.set(comp.id, cDiv(vComp, Zc))
    } else if (comp.type === 'inductor') {
      const L = comp.value * 1e-3
      const Zl = { re: 0, im: omega * L }
      componentCurrentPhasors.set(comp.id, cDiv(vComp, Zl))
    } else if (comp.type === 'lamp') {
      const R = Math.max(comp.value * comp.value / 5, 1)
      componentCurrentPhasors.set(comp.id, cDiv(vComp, { re: R, im: 0 }))
    } else if (comp.type === 'led') {
      componentCurrentPhasors.set(comp.id, cDiv(vComp, { re: 100, im: 0 }))
    } else if (comp.type === 'potentiometer') {
      const R = Math.max(comp.value || 1000, 1)
      componentCurrentPhasors.set(comp.id, cDiv(vComp, { re: R, im: 0 }))
    } else if (comp.type === 'motor') {
      const R = Math.max(comp.value || 6, 1)
      componentCurrentPhasors.set(comp.id, cDiv(vComp, { re: R, im: 0 }))
    } else if (comp.type === 'switch') {
      if (comp.closed) componentCurrentPhasors.set(comp.id, cDiv(vComp, { re: 1e-6, im: 0 }))
      else componentCurrentPhasors.set(comp.id, { re: 0, im: 0 })
    } else if (comp.type === 'ammeter') {
      componentCurrentPhasors.set(comp.id, cDiv(vComp, { re: 1e-6, im: 0 }))
    } else if (comp.type === 'acsource') {
      const vsRow = numNodes + vsIdx
      componentCurrentPhasors.set(comp.id, { re: xre[vsRow], im: xim[vsRow] })
      vsIdx++
    } else if (comp.type === 'transformer') {
      const vsRow1 = numNodes + vsIdx
      componentCurrentPhasors.set(comp.id, { re: xre[vsRow1], im: xim[vsRow1] })
      vsIdx += 2
    } else {
      componentCurrentPhasors.set(comp.id, { re: 0, im: 0 })
    }
  }

  measureMultimeterAC(components, wires, terminalNodeIndex, nodeVoltagePhasors, componentCurrentPhasors, componentVoltagePhasors)

  const faults = detectFaultsAC(components, componentCurrentPhasors, componentVoltagePhasors)

  return { nodeVoltagePhasors, componentCurrentPhasors, componentVoltagePhasors, converged: true, faults }
}
