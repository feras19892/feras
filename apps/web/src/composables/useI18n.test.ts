import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useI18n } from './useI18n';

describe('useI18n', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    localStorage.clear();
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    const { bootstrap } = useI18n();
    await bootstrap();
  });

  it('defaults to ar locale', () => {
    const { locale } = useI18n();
    expect(locale.value).toBe('ar');
  });

  it('supports ar, en, es', () => {
    const { supported } = useI18n();
    expect(supported.value).toEqual(['ar', 'en', 'es']);
  });

  it('direction is rtl for ar and ltr for en', async () => {
    const { setLocale, direction } = useI18n();
    expect(direction.value).toBe('rtl');
    await setLocale('en');
    expect(direction.value).toBe('ltr');
  });

  it('t() returns translated string', () => {
    const { t } = useI18n();
    expect(t('landing.tagline')).toBe('مختبر العلوم التفاعلي');
  });

  it('t() returns fallback when key missing', () => {
    const { t } = useI18n();
    expect(t('missing.key', 'fallback')).toBe('fallback');
  });

  it('setLocale changes locale and persists to localStorage', async () => {
    const { locale, setLocale } = useI18n();
    await setLocale('en');
    expect(locale.value).toBe('en');
    expect(localStorage.getItem('physicslab.locale')).toBe('en');
  });

  it('setLocale updates html lang and dir attributes', async () => {
    const { setLocale } = useI18n();
    await setLocale('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
