import type { ComponentType } from './types'
import type { ComponentSpec } from './componentSpecTypes'
import { basicSpecs } from './componentSpecsBasic'
import { advancedSpecs } from './componentSpecsAdvanced'

export type { ComponentSpec } from './componentSpecTypes'

export const componentSpecs: Record<string, ComponentSpec> = {
  ...basicSpecs,
  ...advancedSpecs,
}

export function getSpec(type: ComponentType): ComponentSpec | null {
  return componentSpecs[type] ?? null
}
