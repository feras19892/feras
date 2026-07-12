import type { ExperimentDefinition } from '../types';
import { registerExperiment } from '../registry';

// ================== HCl + NaOH Titration ==================
// Migrated from useExperiments.ts — same logic, declarative rules.

const definition: ExperimentDefinition = {
  id: 'neutralization-hcl-naoh',
  level: 'high',
  category: 'titration',
  nameKey: 'chemistryExperiments.expTitrationHClNaOH',
  descKey: 'chemistryExperiments.descTitrationHClNaOH',
  icon: '🧪',
  steps: [
    {
      id: 1,
      textKey: 'chemistryExperiments.step1',
      rules: [
        { type: 'hasTool', toolId: 'burette' },
        { type: 'hasAnyTool', toolPrefix: 'beaker' },
        { type: 'any', rules: [
          { type: 'hasTool', toolId: 'pipette' },
          { type: 'hasTool', toolId: 'volumetric-pipette' },
        ]},
      ],
    },
    {
      id: 2,
      textKey: 'chemistryExperiments.step2',
      rules: [{ type: 'hasChemicalIn', chemicalId: 'naoh', container: 'burette' }],
    },
    {
      id: 3,
      textKey: 'chemistryExperiments.step3',
      rules: [{ type: 'hasChemicalIn', chemicalId: 'hcl', container: 'any' }],
    },
    {
      id: 4,
      textKey: 'chemistryExperiments.step4',
      rules: [{ type: 'hasPipetteWith', chemicalId: 'phenolphthalein' }],
    },
    {
      id: 5,
      textKey: 'chemistryExperiments.step5',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'hcl', container: 'reactionVessel' },
        { type: 'indicatorPresent', indicator: 'phenolphthalein', container: 'reactionVessel' },
      ],
    },
    {
      id: 6,
      textKey: 'chemistryExperiments.step6',
      rules: [
        { type: 'any', rules: [
          { type: 'valveOpen', chemicalId: 'naoh' },
          { type: 'buretteDispensed', chemicalId: 'naoh' },
        ]},
      ],
    },
    {
      id: 7,
      textKey: 'chemistryExperiments.step7',
      rules: [
        { type: 'pHCondition', op: '>', value: 8.2, container: 'reactionVessel', indicator: 'phenolphthalein' },
        { type: 'stoichiometricCompletion', analyteId: 'hcl', titrantId: 'naoh', ratio: 1, threshold: 0.8 },
      ],
    },
    {
      id: 8,
      textKey: 'chemistryExperiments.step8',
      rules: [
        { type: 'pHCondition', op: '>', value: 8.2, container: 'reactionVessel', indicator: 'phenolphthalein' },
        { type: 'stoichiometricCompletion', analyteId: 'hcl', titrantId: 'naoh', ratio: 1, threshold: 0.9 },
      ],
    },
  ],
  theory: {
    titleKey: 'chemistryExperiments.theory1Title',
    sections: [
      { headingKey: 'chemistryExperiments.theory1S1Heading', contentKey: 'chemistryExperiments.theory1S1Content' },
      { headingKey: 'chemistryExperiments.theory1S2Heading', contentKey: 'chemistryExperiments.theory1S2Content' },
      { headingKey: 'chemistryExperiments.theory1S3Heading', contentKey: 'chemistryExperiments.theory1S3Content' },
      { headingKey: 'chemistryExperiments.theory1S4Heading', contentKey: 'chemistryExperiments.theory1S4Content' },
      { headingKey: 'chemistryExperiments.theory1S5Heading', contentKey: 'chemistryExperiments.theory1S5Content' },
      { headingKey: 'chemistryExperiments.theory1S6Heading', contentKey: 'chemistryExperiments.theory1S6Content' },
      { headingKey: 'chemistryExperiments.theory1S7Heading', contentKey: 'chemistryExperiments.theory1S7Content' },
    ],
  },
  reportTemplate: {
    type: 'titration',
    defaults: { acidVolume: 50, baseMolarity: 0.1 },
    fields: [
      { key: 'experimentName', labelKey: 'chemistry.reportExperimentName', source: 'custom',
        customFn: () => 'HCl + NaOH Titration' },
      { key: 'consumedVolume', labelKey: 'chemistry.reportConsumedVolume', source: 'consumedVolume' },
      { key: 'acidVolume', labelKey: 'chemistry.reportAcidVolume', source: 'acidVolume' },
      { key: 'baseMolarity', labelKey: 'chemistry.reportBaseMolarity', source: 'baseMolarity' },
      { key: 'calculatedAcidMolarity', labelKey: 'chemistry.reportCalculatedAcidMolarity', source: 'calculatedAcidMolarity' },
      { key: 'phAtEquivalence', labelKey: 'chemistry.reportPhAtEquivalence', source: 'phAtEquivalence' },
      { key: 'colorAtEquivalence', labelKey: 'chemistry.reportColorAtEquivalence', source: 'colorAtEquivalence' },
      { key: 'readingsCount', labelKey: 'chemistry.reportReadingsCount', source: 'readingsCount' },
    ],
  },
};

registerExperiment(definition);
export default definition;
