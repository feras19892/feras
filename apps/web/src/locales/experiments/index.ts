import type { Locale } from '../types';

export async function loadExperimentMessages(locale: Locale): Promise<Record<string, unknown>> {
  switch (locale) {
    case 'ar': {
      const [a1, a2, a3, a4] = await Promise.all([import('./ar-1'), import('./ar-2'), import('./ar-3'), import('./ar-4')]);
      return { ...a1.ar1, ...a2.ar2, ...a3.ar3, ...a4.ar4 };
    }
    case 'en': {
      const [e1, e2, e3, e4] = await Promise.all([import('./en-1'), import('./en-2'), import('./en-3'), import('./en-4')]);
      return { ...e1.en1, ...e2.en2, ...e3.en3, ...e4.en4 };
    }
    case 'es': {
      const [s1, s2, s3, s4] = await Promise.all([import('./es-1'), import('./es-2'), import('./es-3'), import('./es-4')]);
      return { ...s1.es1, ...s2.es2, ...s3.es3, ...s4.es4 };
    }
  }
}

