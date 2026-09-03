import { adminEsA } from './admin-es/A'
import { adminEsB } from './admin-es/B'
import { adminEsC } from './admin-es/C'
import { adminEsD } from './admin-es/D'

export const adminEs = {
  ...adminEsA,
  ...adminEsB,
  ...adminEsC,
  ...adminEsD,
} as const
