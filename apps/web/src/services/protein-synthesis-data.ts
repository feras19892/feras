export interface ProteinSynthesisStage {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  factsKeys: string[];
}

export const proteinSynthesisStages: ProteinSynthesisStage[] = [
  {
    id: 'initiation',
    titleKey: 'biology.proteinSynthesis.initiation.title',
    descriptionKey: 'biology.proteinSynthesis.initiation.description',
    longDescriptionKey: 'biology.proteinSynthesis.initiation.longDescription',
    factsKeys: [
      'biology.proteinSynthesis.initiation.fact1',
      'biology.proteinSynthesis.initiation.fact2',
      'biology.proteinSynthesis.initiation.fact3',
    ],
  },
  {
    id: 'elongation-1',
    titleKey: 'biology.proteinSynthesis.elongation1.title',
    descriptionKey: 'biology.proteinSynthesis.elongation1.description',
    longDescriptionKey: 'biology.proteinSynthesis.elongation1.longDescription',
    factsKeys: [
      'biology.proteinSynthesis.elongation1.fact1',
      'biology.proteinSynthesis.elongation1.fact2',
      'biology.proteinSynthesis.elongation1.fact3',
    ],
  },
  {
    id: 'elongation-2',
    titleKey: 'biology.proteinSynthesis.elongation2.title',
    descriptionKey: 'biology.proteinSynthesis.elongation2.description',
    longDescriptionKey: 'biology.proteinSynthesis.elongation2.longDescription',
    factsKeys: [
      'biology.proteinSynthesis.elongation2.fact1',
      'biology.proteinSynthesis.elongation2.fact2',
      'biology.proteinSynthesis.elongation2.fact3',
    ],
  },
  {
    id: 'elongation-3',
    titleKey: 'biology.proteinSynthesis.elongation3.title',
    descriptionKey: 'biology.proteinSynthesis.elongation3.description',
    longDescriptionKey: 'biology.proteinSynthesis.elongation3.longDescription',
    factsKeys: [
      'biology.proteinSynthesis.elongation3.fact1',
      'biology.proteinSynthesis.elongation3.fact2',
      'biology.proteinSynthesis.elongation3.fact3',
    ],
  },
  {
    id: 'termination',
    titleKey: 'biology.proteinSynthesis.termination.title',
    descriptionKey: 'biology.proteinSynthesis.termination.description',
    longDescriptionKey: 'biology.proteinSynthesis.termination.longDescription',
    factsKeys: [
      'biology.proteinSynthesis.termination.fact1',
      'biology.proteinSynthesis.termination.fact2',
      'biology.proteinSynthesis.termination.fact3',
    ],
  },
];

export const proteinSynthesisExperiment = {
  id: 'protein-synthesis',
  titleKey: 'biology.proteinSynthesisTitle',
  subtitleKey: 'biology.proteinSynthesisSubtitle',
  icon: '🧫',
  stages: proteinSynthesisStages,
};
