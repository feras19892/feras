export interface MitosisStage {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  factsKeys: string[];
}

export const mitosisStages: MitosisStage[] = [
  {
    id: 'prophase',
    titleKey: 'biology.mitosis.prophase.title',
    descriptionKey: 'biology.mitosis.prophase.description',
    longDescriptionKey: 'biology.mitosis.prophase.longDescription',
    factsKeys: [
      'biology.mitosis.prophase.fact1',
      'biology.mitosis.prophase.fact2',
      'biology.mitosis.prophase.fact3',
    ],
  },
  {
    id: 'metaphase',
    titleKey: 'biology.mitosis.metaphase.title',
    descriptionKey: 'biology.mitosis.metaphase.description',
    longDescriptionKey: 'biology.mitosis.metaphase.longDescription',
    factsKeys: [
      'biology.mitosis.metaphase.fact1',
      'biology.mitosis.metaphase.fact2',
      'biology.mitosis.metaphase.fact3',
    ],
  },
  {
    id: 'anaphase',
    titleKey: 'biology.mitosis.anaphase.title',
    descriptionKey: 'biology.mitosis.anaphase.description',
    longDescriptionKey: 'biology.mitosis.anaphase.longDescription',
    factsKeys: [
      'biology.mitosis.anaphase.fact1',
      'biology.mitosis.anaphase.fact2',
      'biology.mitosis.anaphase.fact3',
    ],
  },
  {
    id: 'telophase',
    titleKey: 'biology.mitosis.telophase.title',
    descriptionKey: 'biology.mitosis.telophase.description',
    longDescriptionKey: 'biology.mitosis.telophase.longDescription',
    factsKeys: [
      'biology.mitosis.telophase.fact1',
      'biology.mitosis.telophase.fact2',
      'biology.mitosis.telophase.fact3',
    ],
  },
];

export const mitosisExperiment = {
  id: 'mitosis',
  titleKey: 'biology.mitosisTitle',
  subtitleKey: 'biology.mitosisSubtitle',
  icon: '🔬',
  stages: mitosisStages,
};
