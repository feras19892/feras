import type { ComponentDef, ComponentType } from './types'

export const componentDefs: ComponentDef[] = [
  { type: 'battery',     label: 'Battery',      defaultValue: 6,    unit: 'V',  icon: '🔋', color: '#f59e0b', width: 80, height: 40, terminalCount: 2, category: 'dc',     group: 'source' },
  { type: 'resistor',    label: 'Resistor',     defaultValue: 100,  unit: 'Ω',  icon: '🔲', color: '#6366f1', width: 80, height: 40, terminalCount: 2, category: 'common', group: 'passive' },
  { type: 'capacitor',   label: 'Capacitor',    defaultValue: 100,  unit: 'µF', icon: '🟦', color: '#06b6d4', width: 80, height: 40, terminalCount: 2, category: 'dc',     group: 'passive' },
  { type: 'inductor',    label: 'Inductor',     defaultValue: 100,  unit: 'mH', icon: '🟪', color: '#a855f7', width: 80, height: 40, terminalCount: 2, category: 'dc',     group: 'passive' },
  { type: 'diode',       label: 'Diode',        defaultValue: 0.7,  unit: 'V',  icon: '🔺', color: '#ef4444', width: 80, height: 40, terminalCount: 2, category: 'dc',     group: 'active' },
  { type: 'switch',      label: 'Switch',       defaultValue: 0,    unit: '',   icon: '🔀', color: '#22c55e', width: 80, height: 40, terminalCount: 2, category: 'common', group: 'active' },
  { type: 'lamp',        label: 'Lamp',         defaultValue: 6,    unit: 'V',  icon: '💡', color: '#fbbf24', width: 60, height: 60, terminalCount: 2, category: 'common', group: 'misc' },
  { type: 'ammeter',     label: 'Ammeter',      defaultValue: 0,    unit: 'A',  icon: '📊', color: '#22c55e', width: 50, height: 50, terminalCount: 2, category: 'common', group: 'measurement' },
  { type: 'voltmeter',   label: 'Voltmeter',    defaultValue: 0,    unit: 'V',  icon: '📡', color: '#8b5cf6', width: 50, height: 50, terminalCount: 2, category: 'common', group: 'measurement' },
  { type: 'relay',       label: 'Relay (SPDT)', defaultValue: 10,   unit: 'mA', icon: '🔄', color: '#92400e', width: 100, height: 60, terminalCount: 5, category: 'dc',     group: 'active' },
  { type: 'breaker',     label: 'MCB Breaker',  defaultValue: 10,   unit: 'A',  icon: '⚡', color: '#475569', width: 80, height: 40, terminalCount: 2, category: 'dc',     group: 'protection' },
  { type: 'fuse',        label: 'Fuse',         defaultValue: 5,    unit: 'A',  icon: '🧷', color: '#94a3b8', width: 80, height: 40, terminalCount: 2, category: 'dc',     group: 'protection' },
  { type: 'ground',      label: 'Ground',       defaultValue: 0,    unit: '',   icon: '⚫', color: '#22c55e', width: 40, height: 40, terminalCount: 1, category: 'common', group: 'misc' },
  { type: 'multimeter',  label: 'Multimeter',   defaultValue: 0,    unit: '',   icon: '📟', color: '#0ea5e9', width: 70, height: 90, terminalCount: 2, category: 'common', group: 'measurement' },
  // AC components
  { type: 'acsource',    label: 'AC Source',     defaultValue: 220,  unit: 'V',  icon: '〰️', color: '#3b82f6', width: 80, height: 40, terminalCount: 2, category: 'ac', group: 'source', acOnly: true },
  { type: 'transformer', label: 'Transformer',   defaultValue: 2,    unit: '',   icon: '🔄', color: '#8b5cf6', width: 100, height: 60, terminalCount: 4, category: 'ac', group: 'passive', acOnly: true },
  { type: 'oscilloscope',label: 'Oscilloscope',  defaultValue: 0,    unit: '',   icon: '📺', color: '#06b6d4', width: 120, height: 80, terminalCount: 2, category: 'ac', group: 'measurement', acOnly: true },
  // Additional components
  { type: 'led',         label: 'LED',           defaultValue: 2,    unit: 'V',  icon: '💡', color: '#ef4444', width: 60, height: 40, terminalCount: 2, category: 'common', group: 'active' },
  { type: 'potentiometer', label: 'Potentiometer', defaultValue: 1000, unit: 'Ω',  icon: '🎛️', color: '#f59e0b', width: 80, height: 60, terminalCount: 3, category: 'common', group: 'passive' },
  { type: 'motor',       label: 'DC Motor',      defaultValue: 6,    unit: 'V',  icon: '⚙️', color: '#64748b', width: 80, height: 60, terminalCount: 2, category: 'dc', group: 'active' },
  // Semiconductor components
  { type: 'zener',       label: 'Zener Diode',   defaultValue: 5.1,  unit: 'V',  icon: '⚡', color: '#ef4444', width: 80, height: 40, terminalCount: 2, category: 'common', group: 'active' },
  { type: 'npn',         label: 'NPN Transistor', defaultValue: 100,  unit: '',   icon: '🔺', color: '#3b82f6', width: 80, height: 60, terminalCount: 3, category: 'common', group: 'active' },
  { type: 'pnp',         label: 'PNP Transistor', defaultValue: 100,  unit: '',   icon: '🔻', color: '#ef4444', width: 80, height: 60, terminalCount: 3, category: 'common', group: 'active' },
  { type: 'opamp',       label: 'OP-Amp',        defaultValue: 100000, unit: '',  icon: '📐', color: '#10b981', width: 100, height: 60, terminalCount: 3, category: 'common', group: 'active' },
  { type: 'thermistor',  label: 'Thermistor',    defaultValue: 10000, unit: 'Ω',  icon: '🌡️', color: '#f97316', width: 80, height: 40, terminalCount: 2, category: 'common', group: 'passive' },
  { type: 'buzzer',      label: 'Buzzer',        defaultValue: 50,    unit: 'Ω',  icon: '🔔', color: '#eab308', width: 60, height: 60, terminalCount: 2, category: 'dc',     group: 'active' },
  { type: 'solarcell',   label: 'Solar Cell',    defaultValue: 5,     unit: 'V',  icon: '☀️', color: '#f59e0b', width: 80, height: 40, terminalCount: 2, category: 'dc',     group: 'source' },
]

export function getDef(type: ComponentType): ComponentDef | undefined {
  return componentDefs.find(d => d.type === type)
}

export function getComponentsByCategory(category: string): ComponentDef[] {
  return componentDefs.filter(d => d.category === category || d.category === 'common')
}
