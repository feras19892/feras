import { ar1 } from './ar-1'
import { ar2 } from './ar-2'
import { ar3 } from './ar-3'
import { ar4 } from './ar-4'
import { arChemistry } from './ar-chemistry'
import { en1 } from './en-1'
import { en2 } from './en-2'
import { en3 } from './en-3'
import { en4 } from './en-4'
import { es1 } from './es-1'
import { es2 } from './es-2'
import { es3 } from './es-3'
import { es4 } from './es-4'

export const experiments = {
  ar: { ...ar1, ...ar2, ...ar3, ...ar4, ...arChemistry },
  en: { ...en1, ...en2, ...en3, ...en4 },
  es: { ...es1, ...es2, ...es3, ...es4 }
} as const
