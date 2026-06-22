export type Locale = 'ar' | 'en' | 'es'

export interface TranslationDict {
  landing?: Record<string, unknown>
  auth?: Record<string, unknown>
  dashboard?: Record<string, unknown>
  admin?: Record<string, unknown>
  teacher?: Record<string, unknown>
  experiments?: Record<string, unknown>
  prism?: Record<string, unknown>
  nav?: Record<string, unknown>
  common?: Record<string, unknown>
  [key: string]: Record<string, unknown> | undefined
}
