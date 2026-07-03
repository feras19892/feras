import { liquidMap } from './useChemistryLab';
import type { LiquidState } from '@my-modern-app/chemistry-engine';
import { findEquation, isAcid, isBase, isIndicator, mixColor, calculateTitrationPh } from '@my-modern-app/chemistry-engine';

// Re-export the engine's calculateTitrationPh so existing imports keep working
export { calculateTitrationPh } from '@my-modern-app/chemistry-engine';

// ================== INDICATOR COLOR SYSTEM ==================

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
  if (!liq.indicators || liq.indicators.length === 0) return;
  const currentPh = liq.ph ?? 7;
  const base = liq.baseColor || liq.color;
  for (const indId of liq.indicators) {
    const indColor = getIndicatorColor(indId, currentPh);
    // Indicators are highly visible even in tiny amounts — give 50% visual weight
    liq.color = mixColor(base, liq.volume, indColor, liq.volume);
  }
}

export function applyIndicator(indicatorId: string, containerUid: string): void {
  const liq = liquidMap[containerUid];
  if (!liq || liq.volume <= 0) return;

  const currentPh = liq.ph ?? 7;
  const indicatorColor = getIndicatorColor(indicatorId, currentPh);
  const base = liq.baseColor || liq.color;

  // Indicator visual weight: 50% regardless of actual drop volume
  liq.color = mixColor(base, liq.volume, indicatorColor, liq.volume);
  liq.opacity = Math.min(1, liq.opacity + 0.15);
}

// ================== DROP MIXING ==================

export interface MixEvent {
  sourceUid: string;
  targetUid: string;
  sourceChemicalId: string;
  targetChemicalId: string;
  dropVolume: number;
}

export function handleDropMix(event: MixEvent): void {
  const target = liquidMap[event.targetUid];
  if (!target) return;

  const src = event.sourceChemicalId;
  const tgt = target.chemicalId || '';

  // ===== INDICATOR DROPS: don't react chemically, just add to indicators =====
  if (isIndicator(src)) {
    if (!target.indicators) target.indicators = [];
    if (!target.indicators.includes(src)) {
      target.indicators.push(src);
    }
    applyIndicator(src, event.targetUid);
    return;
  }

  // ===== TITRATION: acid-base neutralization with proper pH calculation =====
  if ((isBase(src) && isAcid(tgt)) || (isAcid(src) && isBase(tgt))) {
    // Track reactants for stoichiometric calculation
    if (!target.reactants) target.reactants = {};
    if (!target.reactants[tgt]) {
      const trackedVol = Object.values(target.reactants).reduce((s, v) => s + v, 0);
      target.reactants[tgt] = Math.max(0, target.volume - event.dropVolume - trackedVol);
    }
    target.reactants[src] = (target.reactants[src] || 0) + event.dropVolume;

    // Calculate pH from excess reagent
    let acidVol = 0, baseVol = 0;
    let acidId = '', baseId = '';

    for (const [chemId, vol] of Object.entries(target.reactants)) {
      if (isAcid(chemId)) { acidVol += vol; acidId = chemId; }
      if (isBase(chemId)) { baseVol += vol; baseId = chemId; }
    }

    const newPh = calculateTitrationPh(acidVol, acidId, baseVol, baseId);
    target.ph = newPh;
    target.temperature = Math.min(100, target.temperature + 0.5);

    // Find and store the reaction equation
    const eq = findEquation([acidId, baseId].filter(Boolean));
    if (eq) {
      target.equation = eq.equation;
      target.precipitate = eq.precipitate || false;
      target.gasEvolution = eq.gasEvolution || false;
    }

    // Apply indicators based on new pH
    applyIndicatorsToContainer(target);
    return;
  }

  // ===== OTHER CHEMICAL REACTIONS (precipitation, redox, etc.) =====
  const allReactants = [src, tgt].filter(Boolean);
  const eq = findEquation(allReactants);

  if (eq) {
    // Store equation on container
    target.equation = eq.equation;

    // Update reactants tracking
    if (!target.reactants) target.reactants = {};
    target.reactants[src] = (target.reactants[src] || 0) + event.dropVolume;
    target.reactants[tgt] = (target.reactants[tgt] || 0) + (target.volume - event.dropVolume);

    // Apply reaction results
    if (eq.resultPh !== undefined) target.ph = eq.resultPh;
    target.color = eq.color;
    target.opacity = eq.opacity;
    target.label = `REACTION:${eq.equation}`;
    target.temperature = Math.min(100, target.temperature + eq.temperatureRise);
    target.precipitate = eq.precipitate || false;
    target.gasEvolution = eq.gasEvolution || false;

    if (eq.precipitate) {
      target.opacity = Math.min(1, target.opacity + 0.2);
    }

    // Re-apply indicators after reaction
    applyIndicatorsToContainer(target);
    return;
  }

  // ===== NO REACTION: simple mixing =====
  // Just add the new chemical to reactants without visual change
  if (!target.reactants) target.reactants = {};
  target.reactants[src] = (target.reactants[src] || 0) + event.dropVolume;
}
