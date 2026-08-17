import { liquidMap, solidMap } from './useChemistryLab';
import { findEquation, isAcid, isBase, isIndicator, mixColor, calculateTitrationPh, getIndicatorColor, applyIndicatorsToContainer as engineApplyIndicators } from '@my-modern-app/chemistry-engine';
import { chemicals } from './chemDatabase';

// Re-export engine functions so existing imports keep working
export { calculateTitrationPh } from '@my-modern-app/chemistry-engine';
export { getIndicatorColor } from '@my-modern-app/chemistry-engine';
export { applyIndicatorsToContainer } from '@my-modern-app/chemistry-engine';

// ================== INDICATOR COLOR SYSTEM ==================

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
  const solidType = solidMap[event.targetUid]?.type || '';

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
      if (chemId.startsWith('_')) continue;
      if (isAcid(chemId)) { acidVol += vol; acidId = chemId; }
      if (isBase(chemId)) { baseVol += vol; baseId = chemId; }
    }

    const acidConc = chemicals.find(c => c.id === acidId)?.concentration ?? 0.1;
    const baseConc = chemicals.find(c => c.id === baseId)?.concentration ?? 0.1;
    const acidMoles = acidVol * acidConc;
    const baseMoles = baseVol * baseConc;
    const newPh = calculateTitrationPh(acidVol, acidId, baseVol, baseId, acidConc, baseConc, target.volume);
    target.ph = newPh;

    // Find and store the reaction equation
    const eq = findEquation([acidId, baseId].filter(Boolean));

    // Non-cumulative temperature: based on reaction progress
    if (target.reactionBaseTemp === undefined) target.reactionBaseTemp = target.temperature;
    const tempRise = eq ? eq.temperatureRise : 5;
    const heatFraction = acidMoles > 0 ? Math.min(1, baseMoles / acidMoles) : 0;
    target.temperature = Math.min(100, target.reactionBaseTemp + tempRise * heatFraction);

    if (eq) {
      target.equation = eq.equation;
      target.precipitate = eq.precipitate || false;
      target.precipitateColor = eq.precipitate ? (eq.precipitateColor || '#c0c0c0') : undefined;
      target.gasEvolution = eq.gasEvolution || false;
      if (eq.gasType) target.gasType = eq.gasType;
    }

    // Apply indicators based on new pH
    engineApplyIndicators(target);
    return;
  }

  // ===== OTHER CHEMICAL REACTIONS (precipitation, redox, gas, etc.) =====
  // Include solid from solidMap if target has no liquid chemicalId
  const effectiveTarget = tgt || solidType || '';
  const allReactants = [src, effectiveTarget].filter(Boolean);
  const eq = findEquation(allReactants);

  if (eq) {
    // Store equation on container
    target.equation = eq.equation;

    // Update reactants tracking
    if (!target.reactants) target.reactants = {};
    target.reactants[src] = (target.reactants[src] || 0) + event.dropVolume;
    if (!target.reactants[effectiveTarget]) {
      const trackedVol = Object.values(target.reactants).reduce((s, v) => s + v, 0) - target.reactants[src];
      target.reactants[effectiveTarget] = Math.max(0, target.volume - event.dropVolume - trackedVol);
    }

    // Calculate stoichiometric ratio for gradual color transition
    // ratio = moles of src added / moles of src required for complete reaction
    const srcConc = chemicals.find(c => c.id === src)?.concentration || 0.1;
    const tgtConc = chemicals.find(c => c.id === effectiveTarget)?.concentration || 0.1;
    const srcMoles = target.reactants[src] * srcConc;
    const tgtMoles = target.reactants[effectiveTarget] * tgtConc;
    // For precipitation: src is titrant (naoh), tgt is analyte (cuso4)
    // Equation: CuSO4 + 2NaOH → ... so ratio is 2:1 (naoh:cuso4)
    // Determine ratio from equation products
    let stoichRatio = 1;
    if (eq.reactants.length === 2) {
      const srcIdx = eq.reactants.indexOf(src);
      const tgtIdx = eq.reactants.indexOf(effectiveTarget);
      if (srcIdx >= 0 && tgtIdx >= 0 && eq.coefficients) {
        const srcCoeff = eq.coefficients[src] ?? 1;
        const tgtCoeff = eq.coefficients[effectiveTarget] ?? 1;
        stoichRatio = srcCoeff / tgtCoeff;
      }
    }
    const requiredSrcMoles = tgtMoles * stoichRatio;
    const reactionFraction = requiredSrcMoles > 0 ? Math.min(1, srcMoles / requiredSrcMoles) : 0;

    // Apply reaction results gradually
    if (eq.resultPh !== undefined) target.ph = eq.resultPh;

    // Gradual color: mix original color with reaction color based on fraction
    const originalColor = target.baseColor || target.color;
    target.color = mixColor(originalColor, target.volume, eq.color, target.volume * reactionFraction);
    // Gradual opacity transition
    const originalOpacity = target.opacity;
    target.opacity = originalOpacity + (eq.opacity - originalOpacity) * reactionFraction;
    // Non-cumulative temperature: based on reaction progress from base temp
    if (target.reactionBaseTemp === undefined) target.reactionBaseTemp = target.temperature;
    target.temperature = Math.min(100, target.reactionBaseTemp + eq.temperatureRise * reactionFraction);

    // Precipitate only starts forming after 10% reaction, increases gradually
    if (eq.precipitate && reactionFraction > 0.1) {
      target.precipitate = true;
      target.precipitateColor = eq.precipitateColor || '#c0c0c0';
      target.opacity = Math.min(1, target.opacity + 0.2 * reactionFraction);
    } else if (reactionFraction <= 0.1) {
      target.precipitate = false;
    }
    target.gasEvolution = eq.gasEvolution || false;
    if (eq.gasType) target.gasType = eq.gasType;

    // Re-apply indicators after reaction
    engineApplyIndicators(target);
    return;
  }

  // ===== NO REACTION: simple mixing =====
  if (!target.reactants) target.reactants = {};
  target.reactants[src] = (target.reactants[src] || 0) + event.dropVolume;
  // If target had no chemical, adopt source chemical properties
  if (!target.chemicalId) {
    target.chemicalId = src;
    const srcChem = chemicals.find(c => c.id === src);
    if (srcChem) {
      target.color = srcChem.color;
      target.opacity = srcChem.opacity;
      target.baseColor = srcChem.color;
      target.ph = srcChem.ph ?? null;
    }
    if (!target.label || target.label === 'water') target.label = src;
  }
}
