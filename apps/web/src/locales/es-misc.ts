import { analysis } from './analysis/index'
import { ai } from './ai'
import { sharedLocaleEs } from './shared-locale-es'

export default {
  analysis: analysis.es,
  ai: ai.es,
  shared: sharedLocaleEs,
} as const
