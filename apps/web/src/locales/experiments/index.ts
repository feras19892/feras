import type { Locale } from '../types';

export async function loadExperimentMessages(locale: Locale): Promise<Record<string, unknown>> {
  switch (locale) {
    case 'ar': {
      const [a1, a2, a3, a4a, a4b] = await Promise.all([import('./ar-1'), import('./ar-2'), import('./ar-3'), import('./ar-4a'), import('./ar-4b')]);
      return { ...a1.ar1, ...a2.ar2, ...a3.ar3, ...a4a.ar4, ...a4b.ar4b };
    }
    case 'en': {
      const [e1, e2, e3, e4a, e4b] = await Promise.all([import('./en-1'), import('./en-2'), import('./en-3'), import('./en-4a'), import('./en-4b')]);
      return { ...e1.en1, ...e2.en2, ...e3.en3, ...e4a.en4, ...e4b.en4b };
    }
    case 'es': {
      const [s1, s2, s3, s4a, s4b] = await Promise.all([import('./es-1'), import('./es-2'), import('./es-3'), import('./es-4a'), import('./es-4b')]);
      return { ...s1.es1, ...s2.es2, ...s3.es3, ...s4a.es4, ...s4b.es4b };
    }
  }
}

