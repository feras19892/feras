import { mixColor } from './color.js';
import { isAcid, isBase, isIndicator } from './type-checks.js';
import type { LiquidState } from './types.js';

// pKa values for acids (lower = stronger)
const acidPKa: Record<string, number> = {
  hcl: -7, h2so4: -3, hno3: -1.4, ch3cooh: 4.76,
};
// pKb values for bases (lower = stronger)
const basePKb: Record<string, number> = {
  naoh: -0.5, koh: -0.5, nh4oh: 4.75, nh3: 4.75,
};

const isWeakAcid = (id: string) => (acidPKa[id] ?? -7) > 2;
const isWeakBase = (id: string) => (basePKb[id] ?? -0.5) > 2;

// Calculate pH from acid/base volumes and concentrations
export function calculateTitrationPh(
  acidVol: number,
  acidId: string,
  baseVol: number,
  baseId: string,
  acidConc?: number,
  baseConc?: number,
  totalVolume?: number,
): number {
  const aConc = acidConc ?? 0.1;
  const bConc = baseConc ?? 0.1;

  // Total moles (neutralization consumes ALL acid/base, not just dissociated part)
  const acidMoles = acidVol * aConc;
  const baseMoles = baseVol * bConc;

  const totalVol = totalVolume ?? (acidVol + baseVol);
  if (totalVol <= 0) return 7.0;

  const excess = baseMoles - acidMoles;
  const weakAcid = isWeakAcid(acidId);
  const weakBase = isWeakBase(baseId);

  // ===== AT OR NEAR EQUIVALENCE =====
  if (Math.abs(excess) < 0.0001 * Math.max(acidMoles, baseMoles, 0.001)) {
    if (weakAcid && !weakBase) {
      // Weak acid + strong base: pH > 7 from conjugate base hydrolysis
      // pH ≈ 7 + 0.5*(pKa + log(C_equivalence))
      const cEq = acidMoles / totalVol;
      return 7 + 0.5 * (acidPKa[acidId] + Math.log10(Math.max(cEq, 0.0001)));
    }
    if (weakBase && !weakAcid) {
      // Strong acid + weak base: pH < 7 from conjugate acid
      const cEq = baseMoles / totalVol;
      return 7 - 0.5 * (basePKb[baseId] + Math.log10(Math.max(cEq, 0.0001)));
    }
    // Strong + strong
    return 7.0;
  }

  if (excess > 0) {
    // ===== AFTER EQUIVALENCE: excess base =====
    const ohConc = excess / totalVol;
    if (weakBase) {
      // Weak base excess: [OH-] = sqrt(Kb * C)
      const kb = Math.pow(10, -basePKb[baseId]);
      const oh = Math.sqrt(kb * ohConc);
      return Math.min(13, 14 + Math.log10(Math.max(oh, 1e-14)));
    }
    // Strong base excess: pOH = -log[OH-], pH = 14 - pOH
    return Math.min(13, 14 + Math.log10(Math.max(ohConc, 1e-14)));
  } else {
    // ===== BEFORE EQUIVALENCE: excess acid =====
    const remainingAcid = Math.abs(excess);
    const baseAdded = baseMoles; // moles of base added = moles of conjugate formed

    if (weakAcid && baseAdded > 0) {
      // Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])
      const conjugateConc = baseAdded / totalVol;
      const acidConcRemaining = remainingAcid / totalVol;
      if (acidConcRemaining <= 0) return 7.0;
      const pKa = acidPKa[acidId];
      return pKa + Math.log10(conjugateConc / acidConcRemaining);
    }

    // Strong acid (or weak acid with no base added yet)
    if (weakAcid && baseAdded <= 0) {
      // Weak acid alone: [H+] = sqrt(Ka * C)
      const ka = Math.pow(10, -acidPKa[acidId]);
      const h = Math.sqrt(ka * (acidMoles / totalVol));
      return Math.max(0, -Math.log10(Math.max(h, 1e-14)));
    }

    // Strong acid excess: pH = -log[H+]
    const hConc = remainingAcid / totalVol;
    return Math.max(0, -Math.log10(Math.max(hConc, 1e-14)));
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
      return '#fefce8';
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
