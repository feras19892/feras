import type { ExperimentDefinition } from '../types';
import { registerExperiment } from '../registry';

// ================== Middle School: Acid-Base Identification ==================
// Students use universal indicator to identify acids vs bases by color.
// Tools: beaker + universal indicator (no burette needed)

const definition: ExperimentDefinition = {
  id: 'middle-acid-base-id',
  level: 'middle',
  category: 'custom',
  nameKey: 'chemistryExperiments.expMiddleAcidBaseId',
  descKey: 'chemistryExperiments.descMiddleAcidBaseId',
  icon: '🌈',
  steps: [
    {
      id: 1,
      textKey: 'chemistryExperiments.middleAcidBaseStep1',
      rules: [
        { type: 'hasAnyTool', toolPrefix: 'beaker' },
        { type: 'any', rules: [
          { type: 'hasTool', toolId: 'pipette' },
          { type: 'hasTool', toolId: 'volumetric-pipette' },
        ]},
      ],
    },
    {
      id: 2,
      textKey: 'chemistryExperiments.middleAcidBaseStep2',
      rules: [
        { type: 'any', rules: [
          { type: 'hasChemicalIn', chemicalId: 'hcl', container: 'any' },
          { type: 'hasChemicalIn', chemicalId: 'ch3cooh', container: 'any' },
        ]},
      ],
    },
    {
      id: 3,
      textKey: 'chemistryExperiments.middleAcidBaseStep3',
      rules: [
        { type: 'indicatorPresent', indicator: 'universal-indicator', container: 'any' },
      ],
    },
    {
      id: 4,
      textKey: 'chemistryExperiments.middleAcidBaseStep4',
      rules: [
        { type: 'pHCondition', op: '<', value: 6, container: 'any', indicator: 'universal-indicator' },
      ],
    },
    {
      id: 5,
      textKey: 'chemistryExperiments.middleAcidBaseStep5',
      rules: [
        { type: 'any', rules: [
          { type: 'hasChemicalIn', chemicalId: 'naoh', container: 'any' },
          { type: 'hasChemicalIn', chemicalId: 'koh', container: 'any' },
        ]},
        { type: 'indicatorPresent', indicator: 'universal-indicator', container: 'any' },
        { type: 'pHCondition', op: '>', value: 8, container: 'any', indicator: 'universal-indicator' },
      ],
    },
  ],
  theory: {
    titleKey: 'chemistryExperiments.theoryMiddleAcidBaseTitle',
    sections: [
      { headingKey: 'chemistryExperiments.theoryMiddleAcidBaseS1Heading', contentKey: 'chemistryExperiments.theoryMiddleAcidBaseS1Content' },
      { headingKey: 'chemistryExperiments.theoryMiddleAcidBaseS2Heading', contentKey: 'chemistryExperiments.theoryMiddleAcidBaseS2Content' },
      { headingKey: 'chemistryExperiments.theoryMiddleAcidBaseS3Heading', contentKey: 'chemistryExperiments.theoryMiddleAcidBaseS3Content' },
    ],
  },
  reportTemplate: {
    type: 'generic',
    fields: [
      { key: 'experimentName', labelKey: 'chemistry.reportExperimentName', source: 'custom',
        customFn: () => 'Acid-Base Identification' },
      { key: 'phAtEquivalence', labelKey: 'chemistry.reportPhValue', source: 'phAtEquivalence' },
    ],
  },
};

registerExperiment(definition);
export default definition;
