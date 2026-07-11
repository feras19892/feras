import type { StepRule } from '../types';
import {
  items, liquidMap, buretteMap, buretteTotalConsumedMap, buretteConsumedThisRefill, pipetteMap,
} from '../../useChemistryLab';
import {
  isContainer, isReactionVessel, isBurette,
} from '../../chemLabIds';
import { chemicals } from '../../chemDatabase';

// ================== RULE EVALUATORS ==================
// Each rule type maps to a predicate function that checks workspace state.

type ContainerFilter = 'burette' | 'any' | 'reactionVessel';

function matchesContainer(itemId: string, filter: ContainerFilter): boolean {
  switch (filter) {
    case 'burette': return isBurette(itemId);
    case 'any': return isContainer(itemId);
    case 'reactionVessel': return isReactionVessel(itemId);
  }
}

function hasTool(toolId: string): boolean {
  return items.value.some((i) => i.id === toolId);
}

function hasAnyTool(toolPrefix: string): boolean {
  return items.value.some((i) => i.id === toolPrefix || i.id.startsWith(toolPrefix + '-'));
}

function hasChemicalIn(chemicalId: string, container: ContainerFilter): boolean {
  return items.value.some((item) => {
    if (!matchesContainer(item.id, container)) return false;
    if (isBurette(item.id)) {
      const b = buretteMap[item.uid];
      return b && b.chemicalId === chemicalId && b.volume > 0;
    }
    const liq = liquidMap[item.uid];
    return liq && liq.chemicalId === chemicalId && liq.volume > 0;
  });
}

function hasPipetteWith(chemicalId: string): boolean {
  return Object.values(pipetteMap).some((p) => p.chemicalId === chemicalId && p.volume > 0);
}

function valveOpen(chemicalId: string): boolean {
  return Object.values(buretteMap).some((b) => b.valveOpen && b.chemicalId === chemicalId && b.volume > 0);
}

function buretteDispensed(chemicalId: string): boolean {
  for (const bItem of items.value) {
    if (!isBurette(bItem.id)) continue;
    const b = buretteMap[bItem.uid];
    if (b.chemicalId !== chemicalId) continue;
    const total = (buretteTotalConsumedMap[bItem.uid] || 0) + (buretteConsumedThisRefill[bItem.uid] || 0);
    if (total > 0) return true;
  }
  return false;
}

function indicatorPresent(indicator: string, container: ContainerFilter): boolean {
  return items.value.some((item) => {
    if (!matchesContainer(item.id, container)) return false;
    const liq = liquidMap[item.uid];
    return liq && liq.indicators && liq.indicators.includes(indicator);
  });
}

function pHCondition(
  op: '>' | '<' | '>=' | '<=',
  value: number,
  container: ContainerFilter,
  indicator?: string,
): boolean {
  return items.value.some((item) => {
    if (!matchesContainer(item.id, container)) return false;
    const liq = liquidMap[item.uid];
    if (!liq || liq.ph === null || liq.ph === undefined) return false;
    if (indicator && (!liq.indicators || !liq.indicators.includes(indicator))) return false;
    switch (op) {
      case '>': return liq.ph > value;
      case '<': return liq.ph < value;
      case '>=': return liq.ph >= value;
      case '<=': return liq.ph <= value;
    }
  });
}

function consumedAbove(minMl: number): boolean {
  let total = 0;
  for (const bItem of items.value) {
    if (!isBurette(bItem.id)) continue;
    total += (buretteTotalConsumedMap[bItem.uid] || 0) + (buretteConsumedThisRefill[bItem.uid] || 0);
  }
  return total >= minMl;
}

/**
 * Smart stoichiometric completion check.
 * Dynamically calculates the required titrant volume based on:
 *   - actual analyte volume & concentration in the reaction vessel
 *   - actual titrant concentration in the burette
 *   - molar ratio (titrant:analyte) from the balanced equation
 *   - threshold fraction (0–1) of stoichiometric amount needed
 *
 * required_mL = (analyte_mL × analyte_M × ratio) / titrant_M
 * passes when consumed >= required_mL × threshold
 */
function stoichiometricCompletion(
  analyteId: string,
  titrantId: string,
  ratio: number,
  threshold: number,
): boolean {
  // 1. Find analyte in any reaction vessel — get volume + concentration
  let analyteVolumeMl = 0;
  let analyteMolarity = 0;
  for (const item of items.value) {
    if (!isReactionVessel(item.id) && !isContainer(item.id)) continue;
    const liq = liquidMap[item.uid];
    if (!liq || liq.chemicalId !== analyteId || liq.volume <= 0) continue;
    analyteVolumeMl = liq.volume;
    const chem = chemicals.find((c) => c.id === analyteId);
    analyteMolarity = chem?.concentration || 0;
    break;
  }
  if (analyteVolumeMl <= 0 || analyteMolarity <= 0) return false;

  // 2. Find titrant in burette — get concentration
  let titrantMolarity = 0;
  for (const bItem of items.value) {
    if (!isBurette(bItem.id)) continue;
    const b = buretteMap[bItem.uid];
    if (!b || b.chemicalId !== titrantId) continue;
    const chem = chemicals.find((c) => c.id === titrantId);
    titrantMolarity = chem?.concentration || 0;
    break;
  }
  if (titrantMolarity <= 0) return false;

  // 3. Calculate required volume: (mL × M × ratio) / M = mL
  const requiredMl = (analyteVolumeMl * analyteMolarity * ratio) / titrantMolarity;
  const neededMl = requiredMl * threshold;

  // 4. Get total consumed from all burettes
  let consumed = 0;
  for (const bItem of items.value) {
    if (!isBurette(bItem.id)) continue;
    consumed += (buretteTotalConsumedMap[bItem.uid] || 0) + (buretteConsumedThisRefill[bItem.uid] || 0);
  }

  return consumed >= neededMl;
}

function temperatureAbove(value: number, container: ContainerFilter): boolean {
  return items.value.some((item) => {
    if (!matchesContainer(item.id, container)) return false;
    const liq = liquidMap[item.uid];
    return liq && liq.temperature > value;
  });
}

function precipitateFormed(container: ContainerFilter): boolean {
  return items.value.some((item) => {
    if (!matchesContainer(item.id, container)) return false;
    const liq = liquidMap[item.uid];
    return liq && liq.precipitate;
  });
}

function gasEvolved(container: ContainerFilter): boolean {
  return items.value.some((item) => {
    if (!matchesContainer(item.id, container)) return false;
    const liq = liquidMap[item.uid];
    return liq && liq.gasEvolution;
  });
}

function colorChanged(container: ContainerFilter): boolean {
  return items.value.some((item) => {
    if (!matchesContainer(item.id, container)) return false;
    const liq = liquidMap[item.uid];
    if (!liq || !liq.chemicalId) return false;
    return liq.color !== liq.baseColor;
  });
}

// ================== MAIN EVALUATOR ==================

export function evaluateRule(rule: StepRule): boolean {
  switch (rule.type) {
    case 'hasTool': return hasTool(rule.toolId);
    case 'hasAnyTool': return hasAnyTool(rule.toolPrefix);
    case 'hasChemicalIn': return hasChemicalIn(rule.chemicalId, rule.container);
    case 'hasPipetteWith': return hasPipetteWith(rule.chemicalId);
    case 'valveOpen': return valveOpen(rule.chemicalId);
    case 'buretteDispensed': return buretteDispensed(rule.chemicalId);
    case 'indicatorPresent': return indicatorPresent(rule.indicator, rule.container);
    case 'pHCondition': return pHCondition(rule.op, rule.value, rule.container, rule.indicator);
    case 'consumedAbove': return consumedAbove(rule.minMl);
    case 'stoichiometricCompletion': return stoichiometricCompletion(rule.analyteId, rule.titrantId, rule.ratio, rule.threshold);
    case 'temperatureAbove': return temperatureAbove(rule.value, rule.container);
    case 'precipitateFormed': return precipitateFormed(rule.container);
    case 'gasEvolved': return gasEvolved(rule.container);
    case 'colorChanged': return colorChanged(rule.container);
    case 'all': return rule.rules.every(evaluateRule);
    case 'any': return rule.rules.some(evaluateRule);
  }
}
