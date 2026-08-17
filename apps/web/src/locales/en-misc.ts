import { analysis } from './analysis/index'
import { ai } from './ai'
import { sharedLocaleEn } from './shared-locale-en'

export default {
  analysis: analysis.en,
  ai: ai.en,
  shared: sharedLocaleEn,
} as const
