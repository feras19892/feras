import { buretteWarning } from './useLabSimulation';

const INDICATOR_THRESHOLDS: Record<string, { approaching: number; equivalence: number; exceeded: number }> = {
  'phenolphthalein': { approaching: 7.5, equivalence: 8.0, exceeded: 9.0 },
  'methyl-orange': { approaching: 3.0, equivalence: 3.7, exceeded: 4.4 },
  'bromothymol-blue': { approaching: 6.0, equivalence: 6.8, exceeded: 7.6 },
  'universal-indicator': { approaching: 6.5, equivalence: 7.0, exceeded: 7.5 },
};

const DEFAULT_THRESHOLDS = { approaching: 7.0, equivalence: 7.5, exceeded: 8.5 };

function getThresholds(indicators?: string[]) {
  if (!indicators || indicators.length === 0) return DEFAULT_THRESHOLDS;
  for (const ind of indicators) {
    if (INDICATOR_THRESHOLDS[ind]) return INDICATOR_THRESHOLDS[ind];
  }
  return DEFAULT_THRESHOLDS;
}

export function updateBuretteWarning(ph: number | null | undefined, indicators?: string[]): void {
  if (ph === null || ph === undefined) {
    buretteWarning.value = null;
    return;
  }
  const th = getThresholds(indicators);
  if (ph >= th.exceeded) buretteWarning.value = 'exceeded';
  else if (ph >= th.equivalence) buretteWarning.value = 'equivalence';
  else if (ph >= th.approaching) buretteWarning.value = 'approaching';
  else buretteWarning.value = null;
}

export function getBuretteWarningThresholds(indicators?: string[]) {
  return { ...getThresholds(indicators) };
}
