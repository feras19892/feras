import type { ExperimentDefinition } from '../types';
import { registerExperiment } from '../registry';

// ================== University: Precipitation — Pb(NO₃)₂ + KI → PbI₂↓ ==================
// Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃
// Students mix lead nitrate with potassium iodide and observe
// a bright yellow precipitate of lead iodide.
// Tools: beaker + pipette + Pb(NO₃)₂ + KI

const definition: ExperimentDefinition = {
  id: 'uni-precip-pbi2',
  level: 'university',
  category: 'precipitation',
  nameKey: 'chemistryExperiments.expUniPbI2',
  descKey: 'chemistryExperiments.descUniPbI2',
  icon: '🟡',
  steps: [
    {
      id: 1,
      textKey: 'chemistryExperiments.uniPbI2Step1',
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
      textKey: 'chemistryExperiments.uniPbI2Step2',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'pbno3', container: 'any' },
      ],
    },
    {
      id: 3,
      textKey: 'chemistryExperiments.uniPbI2Step3',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'ki', container: 'any' },
      ],
    },
    {
      id: 4,
      textKey: 'chemistryExperiments.uniPbI2Step4',
      rules: [
        { type: 'precipitateFormed', container: 'any' },
      ],
    },
    {
      id: 5,
      textKey: 'chemistryExperiments.uniPbI2Step5',
      rules: [
        { type: 'precipitateFormed', container: 'any' },
        { type: 'colorChanged', container: 'any' },
      ],
    },
  ],
  theory: {
    titleKey: 'chemistryExperiments.theoryUniPbI2Title',
    sections: [
      { headingKey: 'chemistryExperiments.theoryUniPbI2S1Heading', contentKey: 'chemistryExperiments.theoryUniPbI2S1Content' },
      { headingKey: 'chemistryExperiments.theoryUniPbI2S2Heading', contentKey: 'chemistryExperiments.theoryUniPbI2S2Content' },
      { headingKey: 'chemistryExperiments.theoryUniPbI2S3Heading', contentKey: 'chemistryExperiments.theoryUniPbI2S3Content' },
    ],
  },
  reportTemplate: {
    type: 'precipitation',
    fields: [
      { key: 'experimentName', labelKey: 'chemistry.reportExperimentName', source: 'custom',
        customFn: () => 'Precipitation: PbI₂' },
      { key: 'precipitateColor', labelKey: 'chemistry.reportPrecipitateColor', source: 'precipitateColor' },
    ],
  },
};

registerExperiment(definition);
export default definition;
