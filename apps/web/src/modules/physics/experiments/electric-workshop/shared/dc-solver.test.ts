import { describe, it, expect } from 'vitest'
import { solveCircuit } from './solver'
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

describe('DC Solver — Ohm\'s Law', () => {
  it('should compute correct current for simple battery + resistor circuit', () => {
    const bat = makeComp({ type: 'battery', x: 0, y: 0, value: 12 })
    bat.terminals = [term(bat.id, 0, -20, 0), term(bat.id, 1, 20, 0)]

    const res = makeComp({ type: 'resistor', x: 100, y: 0, value: 100 })
    res.terminals = [term(res.id, 0, -25, 0), term(res.id, 1, 25, 0)]

    const wires: WorkshopWire[] = [
      wire(1, bat.id, 0, res.id, 1),
      wire(2, res.id, 0, bat.id, 1),
    ]

    const result = solveCircuit([bat, res], wires)
    expect(result.converged).toBe(true)

    const current = result.componentCurrents.get(res.id)
    expect(current).toBeDefined()
    expect(Math.abs(current!)).toBeCloseTo(0.12, 4) // I = 12V / 100Ω = 0.12A
  })
})

describe('DC Solver — Series Circuit', () => {
  it('should compute correct current through series resistors', () => {
    const bat = makeComp({ type: 'battery', x: 0, y: 0, value: 10 })
    bat.terminals = [term(bat.id, 0, -20, 0), term(bat.id, 1, 20, 0)]

    const r1 = makeComp({ type: 'resistor', x: 100, y: 0, value: 50 })
    r1.terminals = [term(r1.id, 0, -25, 0), term(r1.id, 1, 25, 0)]

    const r2 = makeComp({ type: 'resistor', x: 200, y: 0, value: 100 })
    r2.terminals = [term(r2.id, 0, -25, 0), term(r2.id, 1, 25, 0)]

    const wires: WorkshopWire[] = [
      wire(1, bat.id, 0, r2.id, 1),
      wire(2, r2.id, 0, r1.id, 1),
      wire(3, r1.id, 0, bat.id, 1),
    ]

    const result = solveCircuit([bat, r1, r2], wires)
    expect(result.converged).toBe(true)

    // I = 10V / (50 + 100)Ω = 0.0667A
    const current = result.componentCurrents.get(r1.id)
    expect(current).toBeDefined()
    expect(Math.abs(current!)).toBeCloseTo(10 / 150, 3)
  })
})

describe('DC Solver — Parallel Circuit', () => {
  it('should compute correct total current for parallel resistors', () => {
    const bat = makeComp({ type: 'battery', x: 0, y: 0, value: 6 })
    bat.terminals = [term(bat.id, 0, -20, 0), term(bat.id, 1, 20, 0)]

    const r1 = makeComp({ type: 'resistor', x: 100, y: -50, value: 100 })
    r1.terminals = [term(r1.id, 0, -25, 0), term(r1.id, 1, 25, 0)]

    const r2 = makeComp({ type: 'resistor', x: 100, y: 50, value: 200 })
    r2.terminals = [term(r2.id, 0, -25, 0), term(r2.id, 1, 25, 0)]

    const wires: WorkshopWire[] = [
      wire(1, bat.id, 0, r1.id, 1),
      wire(2, bat.id, 0, r2.id, 1),
      wire(3, r1.id, 0, bat.id, 1),
      wire(4, r2.id, 0, bat.id, 1),
    ]

    const result = solveCircuit([bat, r1, r2], wires)
    expect(result.converged).toBe(true)

    // I1 = 6/100 = 0.06A, I2 = 6/200 = 0.03A
    const i1 = Math.abs(result.componentCurrents.get(r1.id) ?? 0)
    const i2 = Math.abs(result.componentCurrents.get(r2.id) ?? 0)
    expect(i1).toBeCloseTo(0.06, 3)
    expect(i2).toBeCloseTo(0.03, 3)
  })
})

describe('DC Solver — Voltage Divider', () => {
  it('should compute correct voltage across each resistor', () => {
    const bat = makeComp({ type: 'battery', x: 0, y: 0, value: 12 })
    bat.terminals = [term(bat.id, 0, -20, 0), term(bat.id, 1, 20, 0)]

    const r1 = makeComp({ type: 'resistor', x: 100, y: 0, value: 100 })
    r1.terminals = [term(r1.id, 0, -25, 0), term(r1.id, 1, 25, 0)]

    const r2 = makeComp({ type: 'resistor', x: 200, y: 0, value: 200 })
    r2.terminals = [term(r2.id, 0, -25, 0), term(r2.id, 1, 25, 0)]

    const wires: WorkshopWire[] = [
      wire(1, bat.id, 0, r2.id, 1),
      wire(2, r2.id, 0, r1.id, 1),
      wire(3, r1.id, 0, bat.id, 1),
    ]

    const result = solveCircuit([bat, r1, r2], wires)
    expect(result.converged).toBe(true)

    // V1 = 12 × 100/300 = 4V, V2 = 12 × 200/300 = 8V
    const v1 = Math.abs(result.componentVoltages.get(r1.id) ?? 0)
    const v2 = Math.abs(result.componentVoltages.get(r2.id) ?? 0)
    expect(v1).toBeCloseTo(4, 1)
    expect(v2).toBeCloseTo(8, 1)
  })
})

describe('DC Solver — Open Circuit', () => {
  it('should handle open switch (no current)', () => {
    const bat = makeComp({ type: 'battery', x: 0, y: 0, value: 9 })
    bat.terminals = [term(bat.id, 0, -20, 0), term(bat.id, 1, 20, 0)]

    const sw = makeComp({ type: 'switch', x: 100, y: 0, value: 0, closed: false })
    sw.terminals = [term(sw.id, 0, -15, 0), term(sw.id, 1, 15, 0)]

    const res = makeComp({ type: 'resistor', x: 200, y: 0, value: 100 })
    res.terminals = [term(res.id, 0, -25, 0), term(res.id, 1, 25, 0)]

    const wires: WorkshopWire[] = [
      wire(1, bat.id, 0, res.id, 1),
      wire(2, res.id, 0, sw.id, 1),
      wire(3, sw.id, 0, bat.id, 1),
    ]

    const result = solveCircuit([bat, sw, res], wires)
    expect(result.converged).toBe(true)

    const current = Math.abs(result.componentCurrents.get(res.id) ?? 0)
    expect(current).toBeCloseTo(0, 6)
  })
})

describe('DC Solver — Short Circuit Detection', () => {
  it('should detect short circuit when battery terminals are directly connected', () => {
    const bat = makeComp({ type: 'battery', x: 0, y: 0, value: 9 })
    bat.terminals = [term(bat.id, 0, -20, 0), term(bat.id, 1, 20, 0)]

    const wires: WorkshopWire[] = [
      wire(1, bat.id, 0, bat.id, 1),
    ]

    const result = solveCircuit([bat], wires)
    expect(result.faults.length).toBeGreaterThan(0)
    const hasShort = result.faults.some(f => f.severity === 'danger')
    expect(hasShort).toBe(true)
  })
})

describe('DC Solver — LED Forward Voltage', () => {
  it('should converge with LED in circuit', () => {
    const bat = makeComp({ type: 'battery', x: 0, y: 0, value: 5 })
    bat.terminals = [term(bat.id, 0, -20, 0), term(bat.id, 1, 20, 0)]

    const led = makeComp({ type: 'led', x: 100, y: 0, value: 2 })
    led.terminals = [term(led.id, 0, -14, 0), term(led.id, 1, 14, 0)]

    const res = makeComp({ type: 'resistor', x: 200, y: 0, value: 220 })
    res.terminals = [term(res.id, 0, -25, 0), term(res.id, 1, 25, 0)]

    const wires: WorkshopWire[] = [
      wire(1, bat.id, 0, res.id, 1),
      wire(2, res.id, 0, led.id, 0),
      wire(3, led.id, 1, bat.id, 1),
    ]

    const result = solveCircuit([bat, led, res], wires)
    expect(result.converged).toBe(true)

    // LED should have approximately its forward voltage
    const ledV = Math.abs(result.componentVoltages.get(led.id) ?? 0)
    expect(ledV).toBeGreaterThan(1.5)
    expect(ledV).toBeLessThan(3.0)

    // Current should be approximately (5 - 2) / 220 = 0.0136A
    const current = Math.abs(result.componentCurrents.get(res.id) ?? 0)
    expect(current).toBeCloseTo((5 - 2) / 220, 2)
  })
})

describe('DC Solver — Empty Circuit', () => {
  it('should return converged with no components', () => {
    const result = solveCircuit([], [])
    expect(result.converged).toBe(true)
    expect(result.iterations).toBe(0)
  })
})
