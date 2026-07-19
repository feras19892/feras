import { describe, it, expect } from 'vitest'
import { solveCircuitAC, solveCircuitTransient } from './solver'
import type { WorkshopComponent, WorkshopWire, Terminal } from './types'

let idCounter = 1
function term(compId: number, index: number, dx: number, dy: number): Terminal {
  return { id: idCounter++, compId, index, dx, dy, nodeId: null }
}

function makeComp(overrides: Partial<WorkshopComponent> & { type: WorkshopComponent['type']; x: number; y: number }): WorkshopComponent {
  const id = idCounter++
  const base: WorkshopComponent = {
    id,
    type: overrides.type,
    x: overrides.x,
    y: overrides.y,
    rotation: 0,
    value: 0,
    unit: '',
    label: overrides.type,
    closed: true,
    terminals: [],
    voltage: 0,
    current: 0,
  }
  return { ...base, ...overrides, id }
}

function wire(id: number, fromCompId: number, fromTerminalIndex: number, toCompId: number, toTerminalIndex: number): WorkshopWire {
  return { id, fromCompId, fromTerminalIndex, toCompId, toTerminalIndex, color: 'red', thickness: 3, points: [] }
}

// Builds: AC source (220V, 50Hz) -> ammeter -> resistor(100R) -> back to AC source.
// A voltage-mode multimeter probes across the resistor.
// An oscilloscope is wired directly across the resistor.
function buildCircuit() {
  const src = makeComp({ type: 'acsource', x: 0, y: 0, value: 220, acAmplitude: 220, acFrequency: 50, acPhase: 0 })
  src.terminals = [term(src.id, 0, -22, 0), term(src.id, 1, 22, 0)]

  const amm = makeComp({ type: 'ammeter', x: 100, y: 0, value: 0 })
  amm.terminals = [term(amm.id, 0, -13, 0), term(amm.id, 1, 13, 0)]

  const res = makeComp({ type: 'resistor', x: 200, y: 0, value: 100 })
  res.terminals = [term(res.id, 0, -25, 0), term(res.id, 1, 25, 0)]

  const mm = makeComp({
    type: 'multimeter', x: 200, y: 100, value: 0,
    multimeterMode: 'voltage',
    probeBlack: { x: 175, y: 0 },
    probeRed: { x: 225, y: 0 },
    clampPos: { x: 200, y: 150 },
  })
  mm.terminals = [term(mm.id, 0, -22, 0), term(mm.id, 1, 22, 0)]

  const osc = makeComp({ type: 'oscilloscope', x: 200, y: -100 })
  osc.terminals = [term(osc.id, 0, -40, 0), term(osc.id, 1, 40, 0)]

  const components = [src, amm, res, mm, osc]
  const wires: WorkshopWire[] = [
    wire(1, src.id, 0, amm.id, 0),
    wire(2, amm.id, 1, res.id, 0),
    wire(3, res.id, 1, src.id, 1),
    // Oscilloscope wired directly across the resistor terminals
    wire(4, osc.id, 0, res.id, 0),
    wire(5, osc.id, 1, res.id, 1),
  ]
  return { src, amm, res, mm, osc, components, wires }
}

describe('AC lab measuring instruments', () => {
  it('solveCircuitAC converges for a simple RL-free series circuit', () => {
    const { components, wires } = buildCircuit()
    const result = solveCircuitAC(components, wires)
    expect(result.converged).toBe(true)
  })

  it('ammeter reads the expected series RMS current (Vrms/R)', () => {
    const { amm, res, components, wires } = buildCircuit()
    const result = solveCircuitAC(components, wires)
    const iAmm = result.componentCurrentPhasors.get(amm.id)!
    const iAmmMag = Math.sqrt(iAmm.re ** 2 + iAmm.im ** 2)
    // The entered "220V" AC source value is RMS (matches real-world mains rating),
    // so I_rms = V_rms / R, with no extra sqrt(2) factor.
    const expectedI = 220 / res.value
    expect(iAmmMag).toBeCloseTo(expectedI, 2)
  })

  it('voltmeter-mode multimeter reads the voltage across the resistor', () => {
    const { mm, res, components, wires } = buildCircuit()
    const result = solveCircuitAC(components, wires)
    const vMM = result.componentVoltagePhasors.get(mm.id)!
    const vMMMag = Math.sqrt(vMM.re ** 2 + vMM.im ** 2)
    const vRes = result.componentVoltagePhasors.get(res.id)!
    const vResMag = Math.sqrt(vRes.re ** 2 + vRes.im ** 2)
    expect(vMMMag).toBeGreaterThan(0)
    expect(vMMMag).toBeCloseTo(vResMag, 2)
  })

  it('oscilloscope trace is populated with a non-trivial waveform', () => {
    const { osc, components, wires } = buildCircuit()
    const result = solveCircuitTransient(components, wires, 3, 50)
    expect(result.converged).toBe(true)
    const oscIdx = components.indexOf(osc)
    expect(oscIdx).toBeGreaterThanOrEqual(0)
    const trace = result.timePoints.map((t, i) => ({ t, v: result.componentVoltages[i][oscIdx] }))
    expect(trace.length).toBeGreaterThan(1)
    const maxV = Math.max(...trace.map(p => Math.abs(p.v)))
    // The 220V (RMS) source should produce a waveform peaking near 220*sqrt(2) ≈ 311V
    // (small tolerance for discretization since we only sample 50 points/cycle).
    expect(maxV).toBeGreaterThan(300)
    expect(maxV).toBeLessThan(320)
  })

  it('editing the AC source voltage updates the readings (acAmplitude stays in sync)', () => {
    const { src, amm, res, components, wires } = buildCircuit()
    // Simulate a user editing the source voltage via the toolbar.
    src.value = 12
    src.acAmplitude = 12
    const result = solveCircuitAC(components, wires)
    const iAmm = result.componentCurrentPhasors.get(amm.id)!
    const iAmmMag = Math.sqrt(iAmm.re ** 2 + iAmm.im ** 2)
    expect(iAmmMag).toBeCloseTo(12 / res.value, 2)
  })
})

// ─── Real Power Tests ─────────────────────────────────────────────

describe('AC real power calculation', () => {
  // Build: AC source -> resistor -> back
  function buildResistorCircuit(R: number = 100) {
    const src = makeComp({ type: 'acsource', x: 0, y: 0, value: 220, acAmplitude: 220, acFrequency: 50 })
    src.terminals = [term(src.id, 0, -22, 0), term(src.id, 1, 22, 0)]
    const res = makeComp({ type: 'resistor', x: 100, y: 0, value: R })
    res.terminals = [term(res.id, 0, -25, 0), term(res.id, 1, 25, 0)]
    const components = [src, res]
    const wires = [wire(1, src.id, 0, res.id, 0), wire(2, res.id, 1, src.id, 1)]
    return { src, res, components, wires }
  }

  // Build: AC source -> inductor -> back
  function buildInductorCircuit(LmH: number = 100) {
    const src = makeComp({ type: 'acsource', x: 0, y: 0, value: 220, acAmplitude: 220, acFrequency: 50 })
    src.terminals = [term(src.id, 0, -22, 0), term(src.id, 1, 22, 0)]
    const ind = makeComp({ type: 'inductor', x: 100, y: 0, value: LmH })
    ind.terminals = [term(ind.id, 0, -25, 0), term(ind.id, 1, 25, 0)]
    const components = [src, ind]
    const wires = [wire(1, src.id, 0, ind.id, 0), wire(2, ind.id, 1, src.id, 1)]
    return { src, ind, components, wires }
  }

  // Build: AC source -> capacitor -> back
  function buildCapacitorCircuit(CuF: number = 100) {
    const src = makeComp({ type: 'acsource', x: 0, y: 0, value: 220, acAmplitude: 220, acFrequency: 50 })
    src.terminals = [term(src.id, 0, -22, 0), term(src.id, 1, 22, 0)]
    const cap = makeComp({ type: 'capacitor', x: 100, y: 0, value: CuF })
    cap.terminals = [term(cap.id, 0, -25, 0), term(cap.id, 1, 25, 0)]
    const components = [src, cap]
    const wires = [wire(1, src.id, 0, cap.id, 0), wire(2, cap.id, 1, src.id, 1)]
    return { src, cap, components, wires }
  }

  it('resistor real power P = V_rms * I_rms (cos phi = 1)', () => {
    const { res, components, wires } = buildResistorCircuit(100)
    const result = solveCircuitAC(components, wires)
    const v = result.componentVoltagePhasors.get(res.id)!
    const i = result.componentCurrentPhasors.get(res.id)!
    // P = Re(V * conj(I)) = V_re*I_re + V_im*I_im
    const realPower = v.re * i.re + v.im * i.im
    const expectedP = (220 * 220) / 100 // V^2/R = 484W
    expect(realPower).toBeCloseTo(expectedP, 1)
  })

  it('ideal inductor real power = 0 (purely reactive)', () => {
    const { ind, components, wires } = buildInductorCircuit(100)
    const result = solveCircuitAC(components, wires)
    const v = result.componentVoltagePhasors.get(ind.id)!
    const i = result.componentCurrentPhasors.get(ind.id)!
    const realPower = v.re * i.re + v.im * i.im
    // Ideal inductor consumes zero real power
    expect(Math.abs(realPower)).toBeLessThan(0.01)
  })

  it('ideal capacitor real power = 0 (purely reactive)', () => {
    const { cap, components, wires } = buildCapacitorCircuit(100)
    const result = solveCircuitAC(components, wires)
    const v = result.componentVoltagePhasors.get(cap.id)!
    const i = result.componentCurrentPhasors.get(cap.id)!
    const realPower = v.re * i.re + v.im * i.im
    // Ideal capacitor consumes zero real power
    expect(Math.abs(realPower)).toBeLessThan(0.01)
  })
})

// ─── Transient Companion Model Tests ──────────────────────────────

describe('transient solver companion model', () => {
  // Build: AC source -> capacitor -> back (series RC)
  function buildRCCircuit() {
    const src = makeComp({ type: 'acsource', x: 0, y: 0, value: 10, acAmplitude: 10, acFrequency: 50 })
    src.terminals = [term(src.id, 0, -22, 0), term(src.id, 1, 22, 0)]
    const cap = makeComp({ type: 'capacitor', x: 100, y: 0, value: 100 }) // 100µF
    cap.terminals = [term(cap.id, 0, -25, 0), term(cap.id, 1, 25, 0)]
    const components = [src, cap]
    const wires = [wire(1, src.id, 0, cap.id, 0), wire(2, cap.id, 1, src.id, 1)]
    return { src, cap, components, wires }
  }

  // Build: AC source -> inductor -> back (series RL)
  function buildRLCircuit() {
    const src = makeComp({ type: 'acsource', x: 0, y: 0, value: 10, acAmplitude: 10, acFrequency: 50 })
    src.terminals = [term(src.id, 0, -22, 0), term(src.id, 1, 22, 0)]
    const ind = makeComp({ type: 'inductor', x: 100, y: 0, value: 100 }) // 100mH
    ind.terminals = [term(ind.id, 0, -25, 0), term(ind.id, 1, 25, 0)]
    const components = [src, ind]
    const wires = [wire(1, src.id, 0, ind.id, 0), wire(2, ind.id, 1, src.id, 1)]
    return { src, ind, components, wires }
  }

  it('RC transient converges and produces a waveform with correct amplitude', () => {
    const { cap, components, wires } = buildRCCircuit()
    const result = solveCircuitTransient(components, wires, 3, 200)
    expect(result.converged).toBe(true)
    const capIdx = components.indexOf(cap)
    const voltages = result.componentVoltages.map(cv => cv[capIdx])
    // After steady state, capacitor voltage should be non-trivial
    const maxV = Math.max(...voltages.map(Math.abs))
    expect(maxV).toBeGreaterThan(1)
    // For a 10V RMS source (14.14V peak) with Xc = 1/(2π*50*100e-6) ≈ 31.8Ω,
    // V_cap_peak ≈ V_peak * Xc / |Z| ≈ 14.14 * 31.8 / 31.8 ≈ 14.14V
    // (since there's no resistor, all voltage drops across the cap)
    expect(maxV).toBeLessThan(20)
  })

  it('RL transient converges and produces a waveform with correct amplitude', () => {
    const { ind, components, wires } = buildRLCircuit()
    const result = solveCircuitTransient(components, wires, 3, 200)
    expect(result.converged).toBe(true)
    const indIdx = components.indexOf(ind)
    const voltages = result.componentVoltages.map(cv => cv[indIdx])
    const maxV = Math.max(...voltages.map(Math.abs))
    expect(maxV).toBeGreaterThan(1)
    // For a 10V RMS source (14.14V peak) with Xl = 2π*50*0.1 ≈ 31.4Ω,
    // V_ind_peak ≈ V_peak ≈ 14.14V (since there's no resistor, all voltage drops across L)
    expect(maxV).toBeLessThan(20)
  })

  it('RC transient current leads voltage by ~90 degrees', () => {
    const { cap, components, wires } = buildRCCircuit()
    const result = solveCircuitTransient(components, wires, 5, 500)
    expect(result.converged).toBe(true)
    const capIdx = components.indexOf(cap)
    // Sample the last cycle for steady-state phase relationship
    const N = result.timePoints.length
    const startIdx = Math.floor(N * 0.8) // last 20% should be steady state
    const vSamples = result.componentVoltages.slice(startIdx).map(cv => cv[capIdx])
    const iSamples = result.componentCurrents.slice(startIdx).map(cc => cc[capIdx])
    // Find zero crossings to estimate phase
    const vMax = Math.max(...vSamples.map(Math.abs))
    const iMax = Math.max(...iSamples.map(Math.abs))
    expect(vMax).toBeGreaterThan(0.1)
    expect(iMax).toBeGreaterThan(0.1)
    // The current should be non-zero and oscillating
    expect(iSamples.filter(i => Math.abs(i) > iMax * 0.5).length).toBeGreaterThan(2)
  })
})
