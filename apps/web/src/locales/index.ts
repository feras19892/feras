import type { Locale, TranslationDict } from './types'

export type { Locale, TranslationDict }

export const supportedLocales: Locale[] = ['ar', 'en', 'es']

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
  es: 'Español',
}

export async function loadLocaleMessages(locale: Locale): Promise<TranslationDict> {
  switch (locale) {
    case 'ar': return (await import('./ar')).default as TranslationDict;
    case 'en': return (await import('./en')).default as TranslationDict;
    case 'es': return (await import('./es')).default as TranslationDict;
  }
}
