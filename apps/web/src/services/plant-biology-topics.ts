import type { BiologyTopic } from '../types/biology.types';

export const plantBiologyTopics: BiologyTopic[] = [
  {
    id: 'photosynthesis',
    titleKey: 'biology.topic.photosynthesis.title',
    descriptionKey: 'biology.topic.photosynthesis.description',
    icon: '🌿',
    route: '/biology/plant/photosynthesis',
    available: true,
  },
  {
    id: 'plant-structure',
    titleKey: 'biology.topic.plantStructure.title',
    descriptionKey: 'biology.topic.plantStructure.description',
    icon: '🌱',
    route: '/biology/plant/plant-structure',
    available: true,
  },
  {
    id: 'transpiration',
    titleKey: 'biology.topic.transpiration.title',
    descriptionKey: 'biology.topic.transpiration.description',
    icon: '💧',
    route: '/biology/plant/transpiration',
    available: true,
  },
  {
    id: 'flower-reproduction',
    titleKey: 'biology.topic.flowerReproduction.title',
    descriptionKey: 'biology.topic.flowerReproduction.description',
    icon: '🌸',
    route: '/biology/plant/flower-reproduction',
    available: true,
  },
];
