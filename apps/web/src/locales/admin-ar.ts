import { adminArA } from './admin-ar/A'
import { adminArB } from './admin-ar/B'
import { adminArC } from './admin-ar/C'
import { adminArD } from './admin-ar/D'

export const adminAr = {
  ...adminArA,
  ...adminArB,
  ...adminArC,
  ...adminArD,
} as const
