import type { ExperimentDefinition } from '../types';
import { registerExperiment } from '../registry';

// ================== Precipitation: CuSO₄ + NaOH → Cu(OH)₂↓ ==================
// A precipitation experiment using the new declarative system.
// CuSO₄ (blue solution) + NaOH (clear) → Cu(OH)₂ (blue-green precipitate) + Na₂SO₄

const definition: ExperimentDefinition = {
  id: 'precipitation-cuso4-naoh',
  category: 'precipitation',
  nameKey: 'chemistryExperiments.expPrecipitationCuSO4NaOH',
  descKey: 'chemistryExperiments.descPrecipitationCuSO4NaOH',
  icon: '🔵',
  steps: [
    {
      id: 1,
      textKey: 'chemistryExperiments.precipStep1',
      rules: [
        { type: 'hasTool', toolId: 'burette' },
        { type: 'hasAnyTool', toolPrefix: 'beaker' },
      ],
    },
    {
      id: 2,
      textKey: 'chemistryExperiments.precipStep2',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'naoh', container: 'burette' },
      ],
    },
    {
      id: 3,
      textKey: 'chemistryExperiments.precipStep3',
      rules: [
        { type: 'hasChemicalIn', chemicalId: 'cuso4', container: 'any' },
      ],
    },
    {
      id: 4,
      textKey: 'chemistryExperiments.precipStep4',
      rules: [
        { type: 'any', rules: [
          { type: 'valveOpen', chemicalId: 'naoh' },
          { type: 'buretteDispensed', chemicalId: 'naoh' },
        ]},
      ],
    },
    {
      id: 5,
      textKey: 'chemistryExperiments.precipStep5',
      rules: [
        { type: 'precipitateFormed', container: 'reactionVessel' },
        { type: 'stoichiometricCompletion', analyteId: 'cuso4', titrantId: 'naoh', ratio: 2, threshold: 0.1 },
      ],
    },
    {
      id: 6,
      textKey: 'chemistryExperiments.precipStep6',
      rules: [
        { type: 'precipitateFormed', container: 'reactionVessel' },
        { type: 'stoichiometricCompletion', analyteId: 'cuso4', titrantId: 'naoh', ratio: 2, threshold: 0.8 },
      ],
    },
  ],
  theory: {
    titleKey: 'chemistryExperiments.theory3Title',
    sections: [
      { headingKey: 'chemistryExperiments.theory3S1Heading', contentKey: 'chemistryExperiments.theory3S1Content' },
      { headingKey: 'chemistryExperiments.theory3S2Heading', contentKey: 'chemistryExperiments.theory3S2Content' },
      { headingKey: 'chemistryExperiments.theory3S3Heading', contentKey: 'chemistryExperiments.theory3S3Content' },
      { headingKey: 'chemistryExperiments.theory3S4Heading', contentKey: 'chemistryExperiments.theory3S4Content' },
      { headingKey: 'chemistryExperiments.theory3S5Heading', contentKey: 'chemistryExperiments.theory3S5Content' },
      { headingKey: 'chemistryExperiments.theory3S6Heading', contentKey: 'chemistryExperiments.theory3S6Content' },
    ],
  },
  reportTemplate: {
    type: 'precipitation',
    fields: [
      { key: 'experimentName', labelKey: 'chemistry.reportExperimentName', source: 'custom',
        customFn: () => 'CuSO₄ + NaOH Precipitation' },
      { key: 'precipitateColor', labelKey: 'chemistry.reportPrecipitateColor', source: 'precipitateColor' },
      { key: 'consumedVolume', labelKey: 'chemistry.reportConsumedVolume', source: 'consumedVolume' },
      { key: 'readingsCount', labelKey: 'chemistry.reportReadingsCount', source: 'readingsCount' },
    ],
  },
};

registerExperiment(definition);
export default definition;
