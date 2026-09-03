import { adminEnA } from './admin-en/A'
import { adminEnB } from './admin-en/B'
import { adminEnC } from './admin-en/C'
import { adminEnD } from './admin-en/D'

export const adminEn = {
  ...adminEnA,
  ...adminEnB,
  ...adminEnC,
  ...adminEnD,
} as const
