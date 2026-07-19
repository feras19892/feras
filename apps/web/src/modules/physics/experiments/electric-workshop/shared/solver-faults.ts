import type { WorkshopComponent, WorkshopWire, FaultInfo, Complex } from './types'
import { cAbs } from '@my-modern-app/math-engine'

export function detectFaultsDC(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  componentCurrents: Map<number, number>,
  componentVoltages: Map<number, number>,
  find: (x: number) => number,
): FaultInfo[] {
  const faults: FaultInfo[] = []
  for (const comp of components) {
    const I = Math.abs(componentCurrents.get(comp.id) ?? 0)
    const V = Math.abs(componentVoltages.get(comp.id) ?? 0)
    const P = V * I

    if (comp.type === 'battery' && I > 50) {
      faults.push({ type: 'short-circuit', componentId: comp.id, messageKey: 'ew.fault.shortCircuit', vars: { I: I.toFixed(1) }, severity: 'danger' })
    }
    if (comp.type === 'resistor' && P > 5) {
      faults.push({ type: 'overheating', componentId: comp.id, messageKey: 'ew.fault.overheating', vars: { P: P.toFixed(2) }, severity: 'warning' })
    }
    if (comp.type === 'breaker' && comp.breakerTripped) {
      faults.push({ type: 'overcurrent', componentId: comp.id, messageKey: 'ew.fault.breakerTripped', severity: 'danger' })
    }
    if (comp.type === 'fuse' && comp.fuseBlown) {
      faults.push({ type: 'overcurrent', componentId: comp.id, messageKey: 'ew.fault.fuseBlown', severity: 'danger' })
    }
    if (comp.type === 'lamp' && V > comp.value * 1.5) {
      faults.push({ type: 'overheating-lamp', componentId: comp.id, messageKey: 'ew.fault.lampOvervoltage', vars: { V: V.toFixed(1) }, severity: 'warning' })
    }
    if (comp.type === 'diode' && V > 50) {
      faults.push({ type: 'overheating-diode', componentId: comp.id, messageKey: 'ew.fault.diodeOvervoltage', severity: 'warning' })
    }
    if (comp.type === 'led' && V > (comp.value || 2) * 3) {
      faults.push({ type: 'overheating', componentId: comp.id, messageKey: 'ew.fault.lampOvervoltage', vars: { V: V.toFixed(1) }, severity: 'warning' })
    }
    if (comp.type === 'motor' && I > 10) {
      faults.push({ type: 'overheating', componentId: comp.id, messageKey: 'ew.fault.overheating', vars: { P: P.toFixed(2) }, severity: 'warning' })
    }
  }

  for (const comp of components) {
    if (comp.type === 'battery') {
      const I = Math.abs(componentCurrents.get(comp.id) ?? 0)
      if (I < 1e-10) {
        const hasPath = wires.some(w =>
          w.fromCompId === comp.id || w.toCompId === comp.id
        )
        if (hasPath) {
          faults.push({ type: 'open-circuit', componentId: comp.id, messageKey: 'ew.fault.openCircuit', severity: 'warning' })
        }
      }
    }
  }

  const allBatteries = components.filter(c => c.type === 'battery')
  for (let i = 0; i < allBatteries.length; i++) {
    for (let j = i + 1; j < allBatteries.length; j++) {
      const b1 = allBatteries[i]
      const b2 = allBatteries[j]
      const b1pNode = b1.terminals[0].nodeId ?? -1
      const b1nNode = b1.terminals[1].nodeId ?? -2
      const b2pNode = b2.terminals[0].nodeId ?? -3
      const b2nNode = b2.terminals[1].nodeId ?? -4
      if (b1pNode === b2pNode && b1nNode === b2nNode && b1.value !== b2.value) {
        faults.push({ type: 'voltage-mismatch', componentId: b2.id, messageKey: 'ew.fault.voltageMismatch', vars: { V1: String(b1.value), V2: String(b2.value) }, severity: 'danger' })
      }
      if (b1pNode === b2nNode && b1nNode === b2pNode) {
        faults.push({ type: 'polarity-mismatch', componentId: b2.id, messageKey: 'ew.fault.polarityMismatch', vars: { V: (b1.value + b2.value).toFixed(1) }, severity: 'danger' })
      }
    }
  }

  for (const bat of allBatteries) {
    const bpNode = bat.terminals[0].nodeId ?? -1
    const bnNode = bat.terminals[1].nodeId ?? -2
    if (bpNode === bnNode) {
      faults.push({ type: 'direct-short', componentId: bat.id, messageKey: 'ew.fault.directShort', vars: { V: String(bat.value) }, severity: 'danger' })
    }
  }

  return faults
}

export function detectFaultsAC(
  components: WorkshopComponent[],
  componentCurrentPhasors: Map<number, Complex>,
  componentVoltagePhasors: Map<number, Complex>,
): FaultInfo[] {
  const faults: FaultInfo[] = []
  for (const comp of components) {
    const I = cAbs(componentCurrentPhasors.get(comp.id) ?? { re: 0, im: 0 })
    const V = cAbs(componentVoltagePhasors.get(comp.id) ?? { re: 0, im: 0 })
    const P = V * I * Math.cos(0)

    if (comp.type === 'acsource' && I > 50) {
      faults.push({ type: 'short-circuit', componentId: comp.id, messageKey: 'ew.fault.shortCircuit', vars: { I: I.toFixed(1) }, severity: 'danger' })
    }
    if (comp.type === 'resistor' && P > 5) {
      faults.push({ type: 'overheating', componentId: comp.id, messageKey: 'ew.fault.overheating', vars: { P: P.toFixed(2) }, severity: 'warning' })
    }
    if (comp.type === 'lamp' && V > comp.value * 1.5) {
      faults.push({ type: 'overheating-lamp', componentId: comp.id, messageKey: 'ew.fault.lampOvervoltage', vars: { V: V.toFixed(1) }, severity: 'warning' })
    }
    if (comp.type === 'capacitor' && V > 500) {
      faults.push({ type: 'overheating', componentId: comp.id, messageKey: 'ew.fault.capacitorOvervoltage', vars: { V: V.toFixed(1) }, severity: 'warning' })
    }
    if (comp.type === 'inductor' && I > 10) {
      faults.push({ type: 'overheating', componentId: comp.id, messageKey: 'ew.fault.inductorOvercurrent', vars: { I: I.toFixed(1) }, severity: 'warning' })
    }
  }

  const acSources = components.filter(c => c.type === 'acsource')
  for (const src of acSources) {
    const I = cAbs(componentCurrentPhasors.get(src.id) ?? { re: 0, im: 0 })
    if (I < 1e-10) {
      const hasPath = components.some(c => c.id !== src.id)
      if (hasPath) {
        faults.push({ type: 'open-circuit', componentId: src.id, messageKey: 'ew.fault.openCircuit', severity: 'warning' })
      }
    }
  }

  return faults
}
