export interface TranspirationStage {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  factsKeys: string[];
}

export const transpirationStages: TranspirationStage[] = [
  {
    id: 'root-absorption',
    titleKey: 'biology.transpiration.rootAbsorption.title',
    descriptionKey: 'biology.transpiration.rootAbsorption.description',
    longDescriptionKey: 'biology.transpiration.rootAbsorption.longDescription',
    factsKeys: [
      'biology.transpiration.rootAbsorption.fact1',
      'biology.transpiration.rootAbsorption.fact2',
      'biology.transpiration.rootAbsorption.fact3',
    ],
  },
  {
    id: 'xylem-ascent',
    titleKey: 'biology.transpiration.xylemAscent.title',
    descriptionKey: 'biology.transpiration.xylemAscent.description',
    longDescriptionKey: 'biology.transpiration.xylemAscent.longDescription',
    factsKeys: [
      'biology.transpiration.xylemAscent.fact1',
      'biology.transpiration.xylemAscent.fact2',
      'biology.transpiration.xylemAscent.fact3',
    ],
  },
  {
    id: 'leaf-arrival',
    titleKey: 'biology.transpiration.leafArrival.title',
    descriptionKey: 'biology.transpiration.leafArrival.description',
    longDescriptionKey: 'biology.transpiration.leafArrival.longDescription',
    factsKeys: [
      'biology.transpiration.leafArrival.fact1',
      'biology.transpiration.leafArrival.fact2',
      'biology.transpiration.leafArrival.fact3',
    ],
  },
  {
    id: 'stomata-release',
    titleKey: 'biology.transpiration.stomataRelease.title',
    descriptionKey: 'biology.transpiration.stomataRelease.description',
    longDescriptionKey: 'biology.transpiration.stomataRelease.longDescription',
    factsKeys: [
      'biology.transpiration.stomataRelease.fact1',
      'biology.transpiration.stomataRelease.fact2',
      'biology.transpiration.stomataRelease.fact3',
    ],
  },
];

export const transpirationExperiment = {
  id: 'transpiration',
  titleKey: 'biology.transpirationTitle',
  subtitleKey: 'biology.transpirationSubtitle',
  icon: '💧',
  stages: transpirationStages,
};
