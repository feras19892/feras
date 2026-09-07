import type { BiologyTopic } from '../types/biology.types';

export const microbiologyTopics: BiologyTopic[] = [
  {
    id: 'bacteria',
    titleKey: 'biology.topic.bacteria.title',
    descriptionKey: 'biology.topic.bacteria.description',
    icon: '🦠',
    route: '/biology/microbiology/bacteria',
    available: true,
  },
  {
    id: 'virus',
    titleKey: 'biology.topic.virus.title',
    descriptionKey: 'biology.topic.virus.description',
    icon: '🧫',
    route: '/biology/microbiology/virus',
    available: true,
  },
  {
    id: 'fungi',
    titleKey: 'biology.topic.fungi.title',
    descriptionKey: 'biology.topic.fungi.description',
    icon: '🍄',
    route: '/biology/microbiology/fungi',
    available: true,
  },
  {
    id: 'blood-cells',
    titleKey: 'biology.topic.bloodCells.title',
    descriptionKey: 'biology.topic.bloodCells.description',
    icon: '🩸',
    route: '/biology/microbiology/blood-cells',
    available: true,
  },
];
