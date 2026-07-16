import type { Locale, TranslationDict } from './types'
import arMessages from './ar'
import enMessages from './en'
import esMessages from './es'

export type { Locale, TranslationDict }

export const supportedLocales: Locale[] = ['ar', 'en', 'es']

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
  es: 'Español',
}

const localeModules: Record<Locale, TranslationDict> = {
  ar: arMessages as TranslationDict,
  en: enMessages as TranslationDict,
  es: esMessages as TranslationDict,
}

export async function loadLocaleMessages(locale: Locale): Promise<TranslationDict> {
  return localeModules[locale]
}
