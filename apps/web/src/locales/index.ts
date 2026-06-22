import type { Locale, TranslationDict } from './types'

export type { Locale, TranslationDict }

export const supportedLocales: Locale[] = ['ar', 'en', 'es']

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
  es: 'Español',
}

export async function loadLocaleMessages(locale: Locale): Promise<TranslationDict> {
  const module = await import(`./${locale}.ts`)
  return module.default as TranslationDict
}
