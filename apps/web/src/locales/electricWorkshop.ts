import { ew_ar } from './electricWorkshop_ar_a'
import { ew_ar_b } from './electricWorkshop_ar_b'
import { ew_en } from './electricWorkshop_en_a'
import { ew_en_b } from './electricWorkshop_en_b'
import { ew_es } from './electricWorkshop_es_a'
import { ew_es_b } from './electricWorkshop_es_b'

export const ew = {
  ar: { ...ew_ar, ...ew_ar_b },
  en: { ...ew_en, ...ew_en_b },
  es: { ...ew_es, ...ew_es_b },
} as const
