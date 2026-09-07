export interface PhotosynthesisStage {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  factsKeys: string[];
}

export const photosynthesisStages: PhotosynthesisStage[] = [
  {
    id: 'light-absorption',
    titleKey: 'biology.photosynthesis.lightAbsorption.title',
    descriptionKey: 'biology.photosynthesis.lightAbsorption.description',
    longDescriptionKey: 'biology.photosynthesis.lightAbsorption.longDescription',
    factsKeys: [
      'biology.photosynthesis.lightAbsorption.fact1',
      'biology.photosynthesis.lightAbsorption.fact2',
      'biology.photosynthesis.lightAbsorption.fact3',
    ],
  },
  {
    id: 'water-splitting',
    titleKey: 'biology.photosynthesis.waterSplitting.title',
    descriptionKey: 'biology.photosynthesis.waterSplitting.description',
    longDescriptionKey: 'biology.photosynthesis.waterSplitting.longDescription',
    factsKeys: [
      'biology.photosynthesis.waterSplitting.fact1',
      'biology.photosynthesis.waterSplitting.fact2',
      'biology.photosynthesis.waterSplitting.fact3',
    ],
  },
  {
    id: 'carbon-fixation',
    titleKey: 'biology.photosynthesis.carbonFixation.title',
    descriptionKey: 'biology.photosynthesis.carbonFixation.description',
    longDescriptionKey: 'biology.photosynthesis.carbonFixation.longDescription',
    factsKeys: [
      'biology.photosynthesis.carbonFixation.fact1',
      'biology.photosynthesis.carbonFixation.fact2',
      'biology.photosynthesis.carbonFixation.fact3',
    ],
  },
  {
    id: 'calvin-cycle',
    titleKey: 'biology.photosynthesis.calvinCycle.title',
    descriptionKey: 'biology.photosynthesis.calvinCycle.description',
    longDescriptionKey: 'biology.photosynthesis.calvinCycle.longDescription',
    factsKeys: [
      'biology.photosynthesis.calvinCycle.fact1',
      'biology.photosynthesis.calvinCycle.fact2',
      'biology.photosynthesis.calvinCycle.fact3',
    ],
  },
];

export const photosynthesisExperiment = {
  id: 'photosynthesis',
  titleKey: 'biology.photosynthesisTitle',
  subtitleKey: 'biology.photosynthesisSubtitle',
  icon: '🌿',
  stages: photosynthesisStages,
};
