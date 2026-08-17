import { analysis } from './analysis/index'
import { ai } from './ai'
import { sharedLocaleAr } from './shared-locale-ar'

export default {
  analysis: analysis.ar,
  ai: ai.ar,
  shared: sharedLocaleAr,
} as const
