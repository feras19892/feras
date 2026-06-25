import { mixColor } from './color.js';
import { isAcid, isBase, isIndicator } from './type-checks.js';
import type { LiquidState } from './types.js';

// Calculate pH from acid/base excess
export function calculateTitrationPh(
  acidVol: number,
  acidId: string,
  baseVol: number,
  baseId: string,
): number {
  const acidStrengths: Record<string, number> = {
    hcl: 1.0, h2so4: 2.0, hno3: 1.0, ch3cooh: 0.05,
  };
  const baseStrengths: Record<string, number> = {
    naoh: 1.0, koh: 1.0, nh4oh: 0.05,
  };

  const aStr = acidStrengths[acidId] || 1.0;
  const bStr = baseStrengths[baseId] || 1.0;

  const acidMoles = acidVol * aStr;
  const baseMoles = baseVol * bStr;

  const excess = baseMoles - acidMoles;
  const totalVol = acidVol + baseVol;

  if (Math.abs(excess) < 0.001 * totalVol) return 7.0;

  if (excess > 0) {
    const oh = excess / totalVol;
    if (oh < 0.001) return 7.0 + oh * 2000;
    if (oh < 0.01) return 9.0 + oh * 300;
    if (oh < 0.1) return 11.0 + oh * 20;
    return 13.0;
  } else {
    const h = Math.abs(excess) / totalVol;
    if (h < 0.001) return 7.0 - h * 2000;
    if (h < 0.01) return 5.0 - h * 300;
    if (h < 0.1) return 3.0 - h * 20;
    return 1.0;
  }
}

export function getIndicatorColor(indicatorId: string, ph: number): string {
  switch (indicatorId) {
    case 'phenolphthalein':
      return ph > 8.2 ? '#ec4899' : '#fdf4ff';
    case 'methyl-orange':
      return ph < 3.1 ? '#ef4444' : ph > 4.4 ? '#fbbf24' : '#fb923c';
    case 'bromothymol-blue':
      return ph > 7.6 ? '#3b82f6' : ph < 6.0 ? '#facc15' : '#22c55e';
    case 'universal-indicator': {
      if (ph < 3) return '#ef4444';
      if (ph < 6) return '#fb923c';
      if (ph < 7) return '#facc15';
      if (ph < 8) return '#22c55e';
      if (ph < 10) return '#3b82f6';
      return '#7c3aed';
    }
    case 'starch':
      return ph > 6 ? '#1e3a8a' : '#fefce8';
    default:
      return '#e0f2fe';
  }
}

export function applyIndicatorsToContainer(liq: LiquidState): void {
  if (!liq.indicators || liq.indicators.length === 0) {
    return;
  }
  const currentPh = liq.ph ?? 7;
  const base = liq.baseColor || liq.color;
  for (const indId of liq.indicators) {
    const indColor = getIndicatorColor(indId, currentPh);
    liq.color = mixColor(base, liq.volume, indColor, liq.volume);
  }
}
