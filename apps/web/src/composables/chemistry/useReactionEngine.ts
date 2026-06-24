import { liquidMap } from './useChemistryLab';
import type { LiquidState } from './chemLabTypes';
import { findEquation } from './chemEquations';
import { mixColor } from './chemColorUtils';
import { isAcid, isBase, isIndicator } from './chemTypeChecks';
// ================== ADVANCED REACTION ENGINE ==================

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
    // Base excess
    const oh = excess / totalVol;
    if (oh < 0.001) return 7.0 + oh * 2000;
    if (oh < 0.01) return 9.0 + oh * 300;
    if (oh < 0.1) return 11.0 + oh * 20;
    return 13.0;
  } else {
    // Acid excess
    const h = Math.abs(excess) / totalVol;
    if (h < 0.001) return 7.0 - h * 2000;
    if (h < 0.01) return 5.0 - h * 300;
    if (h < 0.1) return 3.0 - h * 20;
    return 1.0;
  }
}

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
  if (!liq.indicators || liq.indicators.length === 0) {
    console.log('[applyIndicatorsToContainer] no indicators, skipping');
    return;
  }
  const currentPh = liq.ph ?? 7;
  const base = liq.baseColor || liq.color;
  console.log('[applyIndicatorsToContainer] indicators:', liq.indicators, 'pH:', currentPh, 'baseColor:', base);
  for (const indId of liq.indicators) {
    const indColor = getIndicatorColor(indId, currentPh);
    console.log('[applyIndicatorsToContainer] indicator:', indId, '→ color:', indColor);
    // Indicators are highly visible even in tiny amounts — give 50% visual weight
    liq.color = mixColor(base, liq.volume, indColor, liq.volume);
    console.log('[applyIndicatorsToContainer] new color:', liq.color);
  }
}

export function applyIndicator(indicatorId: string, containerUid: string): void {
  const liq = liquidMap[containerUid];
  if (!liq || liq.volume <= 0) return;

  const currentPh = liq.ph || 7;
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
    if (!target.reactants[tgt]) target.reactants[tgt] = target.volume - event.dropVolume;
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
    target.label = `محلول متفاعل: ${eq.equation}`;
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
