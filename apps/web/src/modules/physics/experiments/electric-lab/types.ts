export type ComponentType = 'battery' | 'resistor' | 'ammeter' | 'voltmeter' | 'wire' | 'capacitor' | 'switch' | 'lamp' | 'galvanometer'

export interface CircuitComponent {
  id: number
  type: ComponentType
  x: number
  y: number
  label: string
  value: number
  unit: string
  _length?: number
  _area?: number
  _closed?: boolean
  _charge?: number
  _maxCharge?: number
  _internalR?: number
}

export interface Trial {
  id: number
  voltage: number
  current: number
  resistance: number
  V1?: number
  V2?: number
  R1?: number
  R2?: number
  R3?: number
  I1?: number
  I2?: number
  I3?: number
  EMF?: number
  Vt?: number
  r?: number
  closed?: boolean
}

export interface CircuitState {
  components: CircuitComponent[]
  running: boolean
  trials: Trial[]
  nextId: number
}
