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
    case 'ar': {
      const [c, a, s, m] = await Promise.all([import('./ar-core'), import('./ar-admin'), import('./ar-science'), import('./ar-misc')]);
      return { ...c.default, ...a.default, ...s.default, ...m.default } as TranslationDict;
    }
    case 'en': {
      const [c, a, s, m] = await Promise.all([import('./en-core'), import('./en-admin'), import('./en-science'), import('./en-misc')]);
      return { ...c.default, ...a.default, ...s.default, ...m.default } as TranslationDict;
    }
    case 'es': {
      const [c, a, s, m] = await Promise.all([import('./es-core'), import('./es-admin'), import('./es-science'), import('./es-misc')]);
      return { ...c.default, ...a.default, ...s.default, ...m.default } as TranslationDict;
    }
  }
}
