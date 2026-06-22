import { analysisAr } from './ar'
import { analysisEn } from './en'
import { analysisEs } from './es'

export const analysis = {
  ar: analysisAr,
  en: analysisEn,
  es: analysisEs,
} as const
