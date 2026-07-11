import type { Locale } from '../types';

export async function loadExperimentMessages(locale: Locale): Promise<Record<string, unknown>> {
  const [m1, m2, m3, m4] = await Promise.all([
    import(`./${locale}-1`),
    import(`./${locale}-2`),
    import(`./${locale}-3`),
    import(`./${locale}-4`),
  ]);
  const suffix1 = locale + '1';
  const suffix2 = locale + '2';
  const suffix3 = locale + '3';
  const suffix4 = locale + '4';
  return {
    ...m1[suffix1],
    ...m2[suffix2],
    ...m3[suffix3],
    ...m4[suffix4],
  };
}

