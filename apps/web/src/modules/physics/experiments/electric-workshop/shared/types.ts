import type { Complex } from '@my-modern-app/math-engine'
export type { Complex }

export type ComponentType =
  | 'battery' | 'resistor' | 'capacitor' | 'inductor'
  | 'diode' | 'switch' | 'lamp' | 'ammeter' | 'voltmeter'
  | 'relay' | 'breaker' | 'fuse' | 'ground' | 'wire'
  | 'multimeter'
  | 'acsource' | 'transformer' | 'oscilloscope'
  | 'led' | 'potentiometer' | 'motor'

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
  probeBlack?: { x: number; y: number }
  probeRed?: { x: number; y: number }
  clampPos?: { x: number; y: number }
  clampWireId?: number | null
  scale?: number
  voltage: number
  current: number
  // AC-specific fields
  acFrequency?: number    // Hz
  acPhase?: number        // degrees
  acAmplitude?: number    // RMS voltage (V) — matches entered/displayed value; peak = value * sqrt(2)
  transformerRatio?: number  // turns ratio N2/N1
  oscilloscopeTrace?: { t: number; v: number }[]  // waveform data
  // Phasor results (complex: re + j*im)
  voltageRe?: number
  voltageIm?: number
  currentRe?: number
  currentIm?: number
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

export interface ACSolveResult {
  nodeVoltagePhasors: Map<number, Complex>
  componentCurrentPhasors: Map<number, Complex>
  componentVoltagePhasors: Map<number, Complex>
  converged: boolean
  faults: FaultInfo[]
}

export interface TransientResult {
  timePoints: number[]
  nodeVoltages: number[][]   // [timeIndex][nodeIndex]
  componentCurrents: number[][]  // [timeIndex][compIndex]
  componentVoltages: number[][]  // [timeIndex][compIndex]
  converged: boolean
}

export interface ComponentDef {
  type: ComponentType
  label: string
  defaultValue: number
  unit: string
  icon: string
  color: string
  width: number
  height: number
  terminalCount: 2 | 3 | 4 | 5
  category: 'dc' | 'ac' | 'home' | 'industrial' | 'common'
  acOnly?: boolean
  group: 'source' | 'passive' | 'active' | 'measurement' | 'protection' | 'misc'
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
  type: 'short-circuit' | 'overcurrent' | 'open-circuit' | 'overheating' | 'overheating-lamp' | 'overheating-diode' | 'reverse-polarity' | 'voltage-mismatch' | 'direct-short' | 'polarity-mismatch'
  componentId: number
  messageKey: string
  vars?: Record<string, string | number>
  severity: 'warning' | 'danger'
}

export const WIRE_COLOR_NAMES = [
  { key: 'red',    color: WIRE_COLORS.red },
  { key: 'black',  color: WIRE_COLORS.black },
  { key: 'green',  color: WIRE_COLORS.green },
  { key: 'yellow', color: WIRE_COLORS.yellow },
  { key: 'blue',   color: WIRE_COLORS.blue },
  { key: 'gray',   color: WIRE_COLORS.gray },
]
