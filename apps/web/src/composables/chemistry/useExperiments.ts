import { items, liquidMap, buretteMap, buretteTotalConsumedMap } from './useChemistryLab';
import { isContainer, isReactionVessel, isBurette } from './chemLabIds';

export interface ExperimentStep {
  id: number;
  text: string;
  completed?: boolean;
}

export interface ExperimentTheory {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface Experiment {
  id: string;
  nameAr: string;
  description: string;
  icon: string;
  steps: ExperimentStep[];
  theory?: ExperimentTheory;
}

export interface TitrationReading {
  n: number;
  volume: number;
  ph: number | null;
  color: string;
}

export interface ReportData {
  experimentName: string;
  consumedVolume: number;
  acidVolume: number;
  baseMolarity: number;
  calculatedAcidMolarity: number;
  phAtEquivalence: number | null;
  colorAtEquivalence: string;
  readingsCount: number;
}

// Helper: does any item of type checker have chemicalId?
function hasChemicalIn(checker: (id: string) => boolean, chemicalId: string) {
  return items.value.some((item) => {
    if (!checker(item.id)) return false;
    if (isBurette(item.id)) {
      const b = buretteMap[item.uid];
      return b && b.chemicalId === chemicalId && b.volume > 0;
    }
    const liq = liquidMap[item.uid];
    return liq && liq.chemicalId === chemicalId && liq.volume > 0;
  });
}

function hasValveOpenBurette(chemicalId: string) {
  return Object.values(buretteMap).some((b) => b.valveOpen && b.chemicalId === chemicalId && b.volume > 0);
}

// Helper: check if specific tool exists
function hasTool(id: string): boolean {
  return items.value.some((i) => i.id === id);
}

// Helper: check if ANY tool matching prefix exists
function hasAnyTool(idPrefix: string): boolean {
  return items.value.some((i) => i.id === idPrefix || i.id.startsWith(idPrefix + '-'));
}

// Per-experiment validation
const validators: Record<string, (experiment: Experiment) => boolean[]> = {
  'neutralization-hcl-naoh': (exp) => validateTitration(exp, 'hcl', 'naoh'),
  'neutralization-ch3cooh-naoh': (exp) => validateTitration(exp, 'ch3cooh', 'naoh'),
};

function validateTitration(exp: Experiment, acidId: string, baseId: string): boolean[] {
  const c = new Array(exp.steps.length).fill(false);
  // Step 1: Check required tools exist in workspace (flexible: any beaker, any test-tube, any pipette)
  c[0] = hasTool('burette') && hasAnyTool('beaker') && hasAnyTool('test-tube') && (hasTool('pipette') || hasTool('volumetric-pipette'));
  // Step 2: Base in burette
  c[1] = hasChemicalIn(isBurette, baseId);
  // Step 3: Acid in any beaker/container
  c[2] = hasChemicalIn(isContainer, acidId);
  // Step 4: Phenolphthalein in test tube
  c[3] = hasChemicalIn(isContainer, 'phenolphthalein');
  // Step 5: Indicator transferred to reaction vessel (indicator + acid present in same vessel)
  c[4] = items.value.some((item) => {
    if (!isReactionVessel(item.id)) return false;
    const liq = liquidMap[item.uid];
    if (!liq || liq.volume <= 0) return false;
    const hasAcidAsBase = liq.chemicalId === acidId;
    const hasIndicatorInArray = liq.indicators && liq.indicators.includes('phenolphthalein');
    const hasAcidInReactants = liq.reactants && liq.reactants[acidId] > 0;
    const hasPhenInReactants = liq.reactants && liq.reactants['phenolphthalein'] > 0;
    return (hasAcidAsBase && hasIndicatorInArray) || (hasAcidInReactants && hasPhenInReactants);
  });
  // Step 6: Burette valve is open with base
  c[5] = hasValveOpenBurette(baseId);
  // Step 7: Color changed to pink in reaction vessel (pH > 8.2 with phenolphthalein)
  // Must have consumed enough base to be realistic (~30+ mL for 50 mL acid at same conc)
  c[6] = items.value.some((item) => {
    if (!isReactionVessel(item.id)) return false;
    const liq = liquidMap[item.uid];
    if (!liq || liq.ph === null || liq.ph <= 8.2) return false;
    if (!liq.indicators || !liq.indicators.includes('phenolphthalein')) return false;
    // Require at least 30 mL total consumed to prevent false positive on first drops
    let totalConsumed = 0;
    for (const bItem of items.value) {
      if (isBurette(bItem.id)) {
        totalConsumed += buretteTotalConsumedMap[bItem.uid] || 0;
      }
    }
    return totalConsumed >= 30;
  });
  // Step 8: Auto-completes when step 7 is done
  c[7] = c[6];
  return c;
}

// Validator: checks workspace state and returns which step indices (0-based) are completed
export function validateExperimentSteps(experiment: Experiment): boolean[] {
  if (!experiment.steps.length) return [];
  const validator = validators[experiment.id];
  if (validator) return validator(experiment);
  // Default: all false
  return new Array(experiment.steps.length).fill(false);
}

export const experiments: Experiment[] = [
  {
    id: 'neutralization-hcl-naoh',
    nameAr: 'chemistryExperiments.expTitrationHClNaOH',
    description: 'chemistryExperiments.descTitrationHClNaOH',
    icon: '🧪',
    steps: [
      { id: 1, text: 'chemistryExperiments.step1', completed: false },
      { id: 2, text: 'chemistryExperiments.step2', completed: false },
      { id: 3, text: 'chemistryExperiments.step3', completed: false },
      { id: 4, text: 'chemistryExperiments.step4', completed: false },
      { id: 5, text: 'chemistryExperiments.step5', completed: false },
      { id: 6, text: 'chemistryExperiments.step6', completed: false },
      { id: 7, text: 'chemistryExperiments.step7', completed: false },
      { id: 8, text: 'chemistryExperiments.step8', completed: false },
    ],
    theory: {
      title: 'chemistryExperiments.theory1Title',
      sections: [
        { heading: 'chemistryExperiments.theory1S1Heading', content: 'chemistryExperiments.theory1S1Content' },
        { heading: 'chemistryExperiments.theory1S2Heading', content: 'chemistryExperiments.theory1S2Content' },
        { heading: 'chemistryExperiments.theory1S3Heading', content: 'chemistryExperiments.theory1S3Content' },
        { heading: 'chemistryExperiments.theory1S4Heading', content: 'chemistryExperiments.theory1S4Content' },
        { heading: 'chemistryExperiments.theory1S5Heading', content: 'chemistryExperiments.theory1S5Content' },
        { heading: 'chemistryExperiments.theory1S6Heading', content: 'chemistryExperiments.theory1S6Content' },
        { heading: 'chemistryExperiments.theory1S7Heading', content: 'chemistryExperiments.theory1S7Content' },
      ]
    }
  },
  {
    id: 'neutralization-ch3cooh-naoh',
    nameAr: 'chemistryExperiments.expTitrationAceticNaOH',
    description: 'chemistryExperiments.descTitrationAceticNaOH',
    icon: '🍶',
    steps: [
      { id: 1, text: 'chemistryExperiments.step1', completed: false },
      { id: 2, text: 'chemistryExperiments.step2', completed: false },
      { id: 3, text: 'chemistryExperiments.step3Acetic', completed: false },
      { id: 4, text: 'chemistryExperiments.step4', completed: false },
      { id: 5, text: 'chemistryExperiments.step5', completed: false },
      { id: 6, text: 'chemistryExperiments.step6', completed: false },
      { id: 7, text: 'chemistryExperiments.step7', completed: false },
      { id: 8, text: 'chemistryExperiments.step8', completed: false },
    ],
    theory: {
      title: 'chemistryExperiments.theory2Title',
      sections: [
        { heading: 'chemistryExperiments.theory2S1Heading', content: 'chemistryExperiments.theory2S1Content' },
        { heading: 'chemistryExperiments.theory2S2Heading', content: 'chemistryExperiments.theory2S2Content' },
        { heading: 'chemistryExperiments.theory2S3Heading', content: 'chemistryExperiments.theory2S3Content' },
        { heading: 'chemistryExperiments.theory2S4Heading', content: 'chemistryExperiments.theory2S4Content' },
        { heading: 'chemistryExperiments.theory2S5Heading', content: 'chemistryExperiments.theory2S5Content' },
        { heading: 'chemistryExperiments.theory2S6Heading', content: 'chemistryExperiments.theory2S6Content' },
        { heading: 'chemistryExperiments.theory2S7Heading', content: 'chemistryExperiments.theory2S7Content' },
      ]
    }
  },
];
