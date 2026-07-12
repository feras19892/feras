import type { ExperimentDefinition } from '../types';
import { registerExperiment } from '../registry';

// ================== University: Redox — KMnO₄ + H₂O₂ ==================
// 2KMnO₄ + 3H₂O₂ → 2MnO₂ + 3O₂↑ + 2KOH + 2H₂O
// Students mix potassium permanganate with hydrogen peroxide and observe
// color change (purple → colorless/brown) and oxygen gas evolution.
// Tools: beaker + KMnO₄ + H₂O₂

const definition: ExperimentDefinition = {
  id: 'uni-redox-kmno4-h2o2',
  level: 'university',
  category: 'redox',
  nameKey: 'chemistryExperiments.expUniRedoxKmno4',
  descKey: 'chemistryExperiments.descUniRedoxKmno4',
  icon: '🟣',
  steps: [
    {
      id: 1,
      textKey: 'chemistryExperiments.uniRedoxStep1',
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
      textKey: 'chemistryExperiments.uniRedoxStep2',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'kmno4', container: 'any' },
      ],
    },
    {
      id: 3,
      textKey: 'chemistryExperiments.uniRedoxStep3',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'h2o2', container: 'any' },
      ],
    },
    {
      id: 4,
      textKey: 'chemistryExperiments.uniRedoxStep4',
      rules: [
        { type: 'gasEvolved', container: 'any' },
      ],
    },
    {
      id: 5,
      textKey: 'chemistryExperiments.uniRedoxStep5',
      rules: [
        { type: 'gasEvolved', container: 'any' },
        { type: 'colorChanged', container: 'any' },
        { type: 'temperatureAbove', value: 30, container: 'any' },
      ],
    },
  ],
  theory: {
    titleKey: 'chemistryExperiments.theoryUniRedoxTitle',
    sections: [
      { headingKey: 'chemistryExperiments.theoryUniRedoxS1Heading', contentKey: 'chemistryExperiments.theoryUniRedoxS1Content' },
      { headingKey: 'chemistryExperiments.theoryUniRedoxS2Heading', contentKey: 'chemistryExperiments.theoryUniRedoxS2Content' },
      { headingKey: 'chemistryExperiments.theoryUniRedoxS3Heading', contentKey: 'chemistryExperiments.theoryUniRedoxS3Content' },
      { headingKey: 'chemistryExperiments.theoryUniRedoxS4Heading', contentKey: 'chemistryExperiments.theoryUniRedoxS4Content' },
    ],
  },
  reportTemplate: {
    type: 'generic',
    fields: [
      { key: 'experimentName', labelKey: 'chemistry.reportExperimentName', source: 'custom',
        customFn: () => 'Redox: KMnO₄ + H₂O₂' },
      { key: 'gasType', labelKey: 'chemistry.reportGasType', source: 'gasType' },
      { key: 'temperatureMax', labelKey: 'chemistry.reportTemperatureMax', source: 'temperatureMax' },
    ],
  },
};

registerExperiment(definition);
export default definition;
