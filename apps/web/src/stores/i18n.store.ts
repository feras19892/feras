import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Locale, TranslationDict } from '../locales/types';
import { loadLocaleMessages, supportedLocales } from '../locales';

const STORAGE_KEY = 'physicslab.locale';

function getSavedLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY);
  return (saved as Locale) || 'ar';
}

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref<Locale>(getSavedLocale());
  const supported = ref<Locale[]>(supportedLocales);
  const loading = ref(false);
  const messages = ref<TranslationDict>({});

  const isRtl = computed(() => locale.value === 'ar');
  const direction = computed<'rtl' | 'ltr'>(() => (isRtl.value ? 'rtl' : 'ltr'));

  async function bootstrap() {
    await setLocale(locale.value, false);
  }

  async function setLocale(next: Locale, persist = true) {
    loading.value = true;
    locale.value = next;
    if (persist) {
      localStorage.setItem(STORAGE_KEY, next);
    }
    document.documentElement.lang = next;
    document.documentElement.dir = isRtl.value ? 'rtl' : 'ltr';
    messages.value = await loadLocaleMessages(next);
    loading.value = false;
  }

  const t = (
    key: string,
    fallbackOrVars: string | Record<string, string | number> = '',
    vars?: Record<string, string | number>
  ): string => {
    const isFallbackString = typeof fallbackOrVars === 'string';
    const fallback = isFallbackString ? fallbackOrVars : '';
    const variables = isFallbackString ? vars : fallbackOrVars;

    const segments = key.split('.').filter(Boolean);
    let node: unknown = messages.value;
    for (const segment of segments) {
      if (node && typeof node === 'object') {
        node = (node as Record<string, unknown>)[segment];
      } else {
        node = undefined;
        break;
      }
    }
    let value = typeof node === 'string' ? node : undefined;
    if (!value) return fallback || key;
    if (variables) {
      value = value.replace(/\{([^}]+)\}/g, (match, name) => {
        const replacement = variables[name.trim()];
        return replacement !== undefined ? String(replacement) : match;
      });
    }
    return value;
  };

  return {
    locale,
    supported,
    messages,
    loading,
    direction,
    bootstrap,
    setLocale,
    t,
  };
});
