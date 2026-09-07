export interface PcrStage {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  factsKeys: string[];
  temperature: number;
  icon: string;
}

export const pcrStages: PcrStage[] = [
  {
    id: 'denaturation',
    titleKey: 'biology.pcrStage.denaturation.title',
    descriptionKey: 'biology.pcrStage.denaturation.description',
    longDescriptionKey: 'biology.pcrStage.denaturation.longDescription',
    factsKeys: [
      'biology.pcrStage.denaturation.fact1',
      'biology.pcrStage.denaturation.fact2',
      'biology.pcrStage.denaturation.fact3',
    ],
    temperature: 95,
    icon: '🔥',
  },
  {
    id: 'annealing',
    titleKey: 'biology.pcrStage.annealing.title',
    descriptionKey: 'biology.pcrStage.annealing.description',
    longDescriptionKey: 'biology.pcrStage.annealing.longDescription',
    factsKeys: [
      'biology.pcrStage.annealing.fact1',
      'biology.pcrStage.annealing.fact2',
      'biology.pcrStage.annealing.fact3',
    ],
    temperature: 55,
    icon: '🧲',
  },
  {
    id: 'extension',
    titleKey: 'biology.pcrStage.extension.title',
    descriptionKey: 'biology.pcrStage.extension.description',
    longDescriptionKey: 'biology.pcrStage.extension.longDescription',
    factsKeys: [
      'biology.pcrStage.extension.fact1',
      'biology.pcrStage.extension.fact2',
      'biology.pcrStage.extension.fact3',
    ],
    temperature: 72,
    icon: '🏗️',
  },
];

export const pcrExperiment = {
  titleKey: 'biology.pcrTitle',
  subtitleKey: 'biology.pcrSubtitle',
  stageLabelKey: 'biology.pcrStageLabel',
};
