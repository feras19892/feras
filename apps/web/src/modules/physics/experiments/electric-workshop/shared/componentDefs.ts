import type { ComponentDef, ComponentType } from './types'

export const componentDefs: ComponentDef[] = [
  { type: 'battery',   label: 'Battery',      labelAr: 'بطارية',      defaultValue: 6,    unit: 'V',  icon: '🔋', color: '#f59e0b', width: 80, height: 40, terminalCount: 2, category: 'dc' },
  { type: 'resistor',  label: 'Resistor',     labelAr: 'مقاومة',      defaultValue: 100,  unit: 'Ω',  icon: '🔲', color: '#6366f1', width: 80, height: 40, terminalCount: 2, category: 'common' },
  { type: 'capacitor', label: 'Capacitor',    labelAr: 'مكثف',        defaultValue: 100,  unit: 'µF', icon: '🟦', color: '#06b6d4', width: 80, height: 40, terminalCount: 2, category: 'dc' },
  { type: 'inductor',  label: 'Inductor',     labelAr: 'ملف',         defaultValue: 100,  unit: 'mH', icon: '🟪', color: '#a855f7', width: 80, height: 40, terminalCount: 2, category: 'dc' },
  { type: 'diode',     label: 'Diode',        labelAr: 'دايود',       defaultValue: 0.7,  unit: 'V',  icon: '🔺', color: '#ef4444', width: 80, height: 40, terminalCount: 2, category: 'dc' },
  { type: 'switch',    label: 'Switch',       labelAr: 'مفتاح',       defaultValue: 0,    unit: '',   icon: '🔀', color: '#22c55e', width: 80, height: 40, terminalCount: 2, category: 'common' },
  { type: 'lamp',      label: 'Lamp',         labelAr: 'مصباح',       defaultValue: 6,    unit: 'V',  icon: '💡', color: '#fbbf24', width: 60, height: 60, terminalCount: 2, category: 'common' },
  { type: 'ammeter',   label: 'Ammeter',      labelAr: 'أميتر',       defaultValue: 0,    unit: 'A',  icon: '📊', color: '#22c55e', width: 50, height: 50, terminalCount: 2, category: 'common' },
  { type: 'voltmeter', label: 'Voltmeter',    labelAr: 'فولتميتر',    defaultValue: 0,    unit: 'V',  icon: '📡', color: '#8b5cf6', width: 50, height: 50, terminalCount: 2, category: 'common' },
  { type: 'relay',     label: 'Relay (SPDT)', labelAr: 'ريليه',       defaultValue: 10,   unit: 'mA', icon: '🔄', color: '#92400e', width: 100, height: 60, terminalCount: 4, category: 'dc' },
  { type: 'breaker',   label: 'MCB Breaker',  labelAr: 'قاطع MCB',    defaultValue: 10,   unit: 'A',  icon: '⚡', color: '#475569', width: 80, height: 40, terminalCount: 2, category: 'dc' },
  { type: 'fuse',      label: 'Fuse',         labelAr: 'مصهر',        defaultValue: 5,    unit: 'A',  icon: '🧷', color: '#94a3b8', width: 80, height: 40, terminalCount: 2, category: 'dc' },
  { type: 'ground',    label: 'Ground',       labelAr: 'أرضي',        defaultValue: 0,    unit: '',   icon: '⚫', color: '#22c55e', width: 40, height: 40, terminalCount: 2, category: 'common' },
  { type: 'multimeter', label: 'Multimeter',  labelAr: 'مولتيميتر',    defaultValue: 0,    unit: '',   icon: '📟', color: '#0ea5e9', width: 70, height: 90, terminalCount: 2, category: 'common' },
]

export function getDef(type: ComponentType): ComponentDef | undefined {
  return componentDefs.find(d => d.type === type)
}

export function getComponentsByCategory(category: string): ComponentDef[] {
  return componentDefs.filter(d => d.category === category || d.category === 'common')
}
