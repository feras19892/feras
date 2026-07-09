import type { CircuitComponent, ComponentType } from './types'

export interface PresetDef {
  id: string
  name: string
  nameAr: string
  level: string
  instructions: string[]
  build: (components: CircuitComponent[], reset: () => void) => void
}

let presetIdCounter = 0

export function makeComp(
  type: ComponentType,
  x: number,
  y: number,
  label: string,
  value: number,
  unit: string,
): CircuitComponent {
  return { id: ++presetIdCounter, type, x, y, label, value, unit }
}
