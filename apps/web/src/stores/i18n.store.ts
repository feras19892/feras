import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type Locale = 'ar' | 'en' | 'es';

export interface TranslationDict {
  landing?: Record<string, string>;
  auth?: Record<string, string>;
}

const STORAGE_KEY = 'physicslab.locale';

const DEFAULT_MESSAGES: Record<Locale, TranslationDict> = {
  ar: {
    landing: {
      tagline: 'مختبر العلوم التفاعلي',
      descLine1: 'منصة تعليمية متكاملة للتجارب العلمية',
    },
    auth: {
      email: 'البريد الإلكتروني',
      password: 'كلمة السر',
      login: 'دخول',
      register: 'إنشاء حساب',
      or: 'أو',
      enterAsGuest: 'دخول سريع كضيف',
      loading: 'جارٍ...',
    },
  },
  en: {
    landing: {
      tagline: 'Interactive Science Lab',
      descLine1: 'An integrated educational platform for scientific experiments',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      login: 'Login',
      register: 'Register',
      or: 'or',
      enterAsGuest: 'Enter as Guest',
      loading: 'Loading...',
    },
  },
  es: {
    landing: {
      tagline: 'Laboratorio de Ciencias Interactivo',
      descLine1: 'Plataforma educativa integrada para experimentos científicos',
    },
    auth: {
      email: 'Correo electrónico',
      password: 'Contraseña',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      or: 'o',
      enterAsGuest: 'Entrar como invitado',
      loading: 'Cargando...',
    },
  },
};

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref<Locale>((localStorage.getItem(STORAGE_KEY) as Locale) || 'ar');
  const supported = ref<Locale[]>(['ar', 'en', 'es']);
  const loading = ref(false);

  const messages = ref<TranslationDict>(DEFAULT_MESSAGES[locale.value]);

  const isRtl = computed(() => locale.value === 'ar');
  const direction = computed<'rtl' | 'ltr'>(() => (isRtl.value ? 'rtl' : 'ltr'));

  const setLocale = async (next: Locale) => {
    locale.value = next;
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    document.documentElement.dir = isRtl.value ? 'rtl' : 'ltr';
    messages.value = DEFAULT_MESSAGES[next];
  };

  const t = (key: string, fallbackOrVars: string | Record<string, string | number> = '', vars?: Record<string, string | number>): string => {
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
    setLocale,
    t,
  };
});
