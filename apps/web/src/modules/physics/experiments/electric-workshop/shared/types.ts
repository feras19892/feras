export type ComponentType =
  | 'battery' | 'resistor' | 'capacitor' | 'inductor'
  | 'diode' | 'switch' | 'lamp' | 'ammeter' | 'voltmeter'
  | 'relay' | 'breaker' | 'fuse' | 'ground' | 'wire'
  | 'multimeter'

export interface Terminal {
  id: number
  compId: number
  index: number
  dx: number
  dy: number
  nodeId: number | null
}

export interface WorkshopComponent {
  id: number
  type: ComponentType
  x: number
  y: number
  rotation: number
  value: number
  unit: string
  label: string
  closed: boolean
  terminals: Terminal[]
  relayCoilTerminals?: [Terminal, Terminal]
  relayState?: boolean
  breakerTripped?: boolean
  breakerRating?: number
  fuseBlown?: boolean
  multimeterMode?: 'voltage' | 'current' | 'resistance'
  scale?: number
  voltage: number
  current: number
}

export interface WorkshopWire {
  id: number
  fromCompId: number
  fromTerminalIndex: number
  toCompId: number
  toTerminalIndex: number
  color: string
  thickness: number
  points: { x: number; y: number }[]
  fromWireId?: number
  fromWirePointIndex?: number
  toWireId?: number
  toWirePointIndex?: number
  manual?: boolean
}

export interface SolveResult {
  nodeVoltages: Map<number, number>
  componentCurrents: Map<number, number>
  componentVoltages: Map<number, number>
  converged: boolean
  iterations: number
  faults: FaultInfo[]
}

export interface ComponentDef {
  type: ComponentType
  label: string
  labelAr: string
  defaultValue: number
  unit: string
  icon: string
  color: string
  width: number
  height: number
  terminalCount: 2 | 4
  category: 'dc' | 'ac' | 'home' | 'industrial' | 'common'
}

export const WIRE_COLORS = {
  red: '#ef4444',
  black: '#1e293b',
  green: '#22c55e',
  yellow: '#eab308',
  blue: '#3b82f6',
  gray: '#64748b',
  white: '#e2e8f0',
}

export interface FaultInfo {
  type: 'short-circuit' | 'overcurrent' | 'open-circuit' | 'overheating' | 'reverse-polarity' | 'voltage-mismatch' | 'direct-short' | 'polarity-mismatch'
  componentId: number
  message: string
  severity: 'warning' | 'danger'
}

export const WIRE_COLOR_NAMES = [
  { key: 'red',    label: 'أحمر (طور)',     color: WIRE_COLORS.red },
  { key: 'black',  label: 'أسود (محايد)',   color: WIRE_COLORS.black },
  { key: 'green',  label: 'أخضر (أرضي)',    color: WIRE_COLORS.green },
  { key: 'yellow', label: 'أصفر (إشارة)',   color: WIRE_COLORS.yellow },
  { key: 'blue',   label: 'أزرق (DC+)',     color: WIRE_COLORS.blue },
  { key: 'gray',   label: 'رمادي (DC-)',    color: WIRE_COLORS.gray },
]
