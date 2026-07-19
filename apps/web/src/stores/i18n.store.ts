import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Locale, TranslationDict } from '../locales/types';
import { loadLocaleMessages, supportedLocales } from '../locales';
import { loadExperimentMessages } from '../locales/experiments/index';

const STORAGE_KEY = 'physicslab.locale';

const prismOverrides: Record<Locale, Record<string, string>> = {
  ar: {
    title: 'تحلل الضوء بالمنشور',
    emptyResults: 'سجل قراءتين على الأقل لعرض النتائج',
    dragLaserSource: '⊹ اسحب مصدر الليزر ↕ لتغيير θ₁',
    dragA: 'اسحب A لتغيير زاوية المنشور',
    dragPrism: '✥ اسحب المنشور لتحريكه على الشاشة',
    selectTool: 'تحديد (افتراضي)',
    moveMode: 'وضع النقل',
    normalLines: 'خطوط عمودية',
    showSpectrum: 'إظهار الطيف',
    angleArcs: 'أقواس الزوايا',
    virtualScreen: 'شاشة افتراضية',
    grid: 'شبكة',
    resetView: 'إعادة ضبط العرض',
  },
  en: {
    title: 'Light Dispersion by Prism',
    emptyResults: 'Record at least 2 trials to see results',
    dragLaserSource: '⊹ Drag the laser source ↕ to change θ₁',
    dragA: 'Drag A to change prism angle',
    dragPrism: '✥ Drag the prism to move it on screen',
    selectTool: 'Select (default)',
    moveMode: 'Move mode',
    normalLines: 'Normal Lines',
    showSpectrum: 'Show Spectrum',
    angleArcs: 'Angle Arcs',
    virtualScreen: 'Virtual Screen',
    grid: 'Grid',
    resetView: 'Reset view',
  },
  es: {
    title: 'Dispersión de Luz por Prisma',
    emptyResults: 'Registra al menos 2 lecturas para ver resultados',
    dragLaserSource: '⊹ Arrastra la fuente láser ↕ para cambiar θ₁',
    dragA: 'Arrastra A para cambiar el ángulo del prisma',
    dragPrism: '✥ Arrastra el prisma para moverlo en la pantalla',
    selectTool: 'Seleccionar (predeterminado)',
    moveMode: 'Modo mover',
    normalLines: 'Líneas Normales',
    showSpectrum: 'Mostrar Espectro',
    angleArcs: 'Arcos de Ángulo',
    virtualScreen: 'Pantalla Virtual',
    grid: 'Cuadrícula',
    resetView: 'Restablecer vista',
  },
};

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
    const [base, exp] = await Promise.all([
      loadLocaleMessages(next),
      loadExperimentMessages(next),
    ]);
    messages.value = {
      ...base,
      ...exp,
      experiments: exp,
      prism: { ...exp, ...prismOverrides[next] },
    } as TranslationDict;
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

  const tArray = (key: string): string[] => {
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
    return Array.isArray(node) ? (node as string[]) : [];
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
    tArray,
  };
});
