import type { ExperimentDefinition } from '../types';
import { registerExperiment } from '../registry';

// ================== Middle School: CaCO₃ + HCl → CO₂ Gas ==================
// CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O
// Students add calcium carbonate (marble chips) to HCl and observe CO₂ gas.
// Tools: test tube + CaCO₃ (solid) + HCl

const definition: ExperimentDefinition = {
  id: 'middle-carbonate-gas',
  level: 'middle',
  category: 'gas',
  nameKey: 'chemistryExperiments.expMiddleCarbonate',
  descKey: 'chemistryExperiments.descMiddleCarbonate',
  icon: '🫧',
  steps: [
    {
      id: 1,
      textKey: 'chemistryExperiments.middleCarbonateStep1',
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
      textKey: 'chemistryExperiments.middleCarbonateStep2',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'hcl', container: 'any' },
      ],
    },
    {
      id: 3,
      textKey: 'chemistryExperiments.middleCarbonateStep3',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'caco3', container: 'any' },
      ],
    },
    {
      id: 4,
      textKey: 'chemistryExperiments.middleCarbonateStep4',
      rules: [
        { type: 'gasEvolved', container: 'any' },
      ],
    },
    {
      id: 5,
      textKey: 'chemistryExperiments.middleCarbonateStep5',
      rules: [
        { type: 'gasEvolved', container: 'any' },
        { type: 'temperatureAbove', value: 26, container: 'any' },
      ],
    },
  ],
  theory: {
    titleKey: 'chemistryExperiments.theoryMiddleCarbonateTitle',
    sections: [
      { headingKey: 'chemistryExperiments.theoryMiddleCarbonateS1Heading', contentKey: 'chemistryExperiments.theoryMiddleCarbonateS1Content' },
      { headingKey: 'chemistryExperiments.theoryMiddleCarbonateS2Heading', contentKey: 'chemistryExperiments.theoryMiddleCarbonateS2Content' },
      { headingKey: 'chemistryExperiments.theoryMiddleCarbonateS3Heading', contentKey: 'chemistryExperiments.theoryMiddleCarbonateS3Content' },
    ],
  },
  reportTemplate: {
    type: 'gas',
    fields: [
      { key: 'experimentName', labelKey: 'chemistry.reportExperimentName', source: 'custom',
        customFn: () => 'Carbonate + Acid CO₂ Evolution' },
      { key: 'gasType', labelKey: 'chemistry.reportGasType', source: 'gasType' },
    ],
  },
};

registerExperiment(definition);
export default definition;
