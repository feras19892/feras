import type { ExperimentDefinition } from '../types';
import { registerExperiment } from '../registry';

// ================== Middle School: Metal + Acid → H₂ Gas ==================
// Zn + 2HCl → ZnCl₂ + H₂↑
// Students add zinc metal to HCl in a test tube and observe gas evolution.
// Tools: test tube + Zn (solid) + HCl

const definition: ExperimentDefinition = {
  id: 'middle-metal-acid-gas',
  level: 'middle',
  category: 'gas',
  nameKey: 'chemistryExperiments.expMiddleMetalAcid',
  descKey: 'chemistryExperiments.descMiddleMetalAcid',
  icon: '⚡',
  steps: [
    {
      id: 1,
      textKey: 'chemistryExperiments.middleMetalStep1',
      rules: [
        { type: 'hasAnyTool', toolPrefix: 'test-tube' },
        { type: 'any', rules: [
          { type: 'hasTool', toolId: 'pipette' },
          { type: 'hasTool', toolId: 'volumetric-pipette' },
        ]},
      ],
    },
    {
      id: 2,
      textKey: 'chemistryExperiments.middleMetalStep2',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'hcl', container: 'any' },
      ],
    },
    {
      id: 3,
      textKey: 'chemistryExperiments.middleMetalStep3',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'zn', container: 'any' },
      ],
    },
    {
      id: 4,
      textKey: 'chemistryExperiments.middleMetalStep4',
      rules: [
        { type: 'gasEvolved', container: 'any' },
      ],
    },
    {
      id: 5,
      textKey: 'chemistryExperiments.middleMetalStep5',
      rules: [
        { type: 'gasEvolved', container: 'any' },
        { type: 'temperatureAbove', value: 30, container: 'any' },
      ],
    },
  ],
  theory: {
    titleKey: 'chemistryExperiments.theoryMiddleMetalTitle',
    sections: [
      { headingKey: 'chemistryExperiments.theoryMiddleMetalS1Heading', contentKey: 'chemistryExperiments.theoryMiddleMetalS1Content' },
      { headingKey: 'chemistryExperiments.theoryMiddleMetalS2Heading', contentKey: 'chemistryExperiments.theoryMiddleMetalS2Content' },
      { headingKey: 'chemistryExperiments.theoryMiddleMetalS3Heading', contentKey: 'chemistryExperiments.theoryMiddleMetalS3Content' },
    ],
  },
  reportTemplate: {
    type: 'gas',
    fields: [
      { key: 'experimentName', labelKey: 'chemistry.reportExperimentName', source: 'custom',
        customFn: () => 'Metal + Acid Gas Evolution' },
      { key: 'gasType', labelKey: 'chemistry.reportGasType', source: 'gasType' },
      { key: 'temperatureMax', labelKey: 'chemistry.reportTemperatureMax', source: 'temperatureMax' },
    ],
  },
};

registerExperiment(definition);
export default definition;
