import type { BiologyTopic } from '../types/biology.types';

export const anatomyTopics: BiologyTopic[] = [
  {
    id: 'heart',
    titleKey: 'biology.topic.heart.title',
    descriptionKey: 'biology.topic.heart.description',
    icon: '🫀',
    route: '/biology/anatomy/heart',
    available: true,
  },
  {
    id: 'lungs',
    titleKey: 'biology.topic.lungs.title',
    descriptionKey: 'biology.topic.lungs.description',
    icon: '🫁',
    route: '/biology/anatomy/lungs',
    available: true,
  },
  {
    id: 'skeleton',
    titleKey: 'biology.topic.skeleton.title',
    descriptionKey: 'biology.topic.skeleton.description',
    icon: '🦴',
    route: '/biology/anatomy/skeleton',
    available: true,
  },
  {
    id: 'digestive',
    titleKey: 'biology.topic.digestive.title',
    descriptionKey: 'biology.topic.digestive.description',
    icon: '🍽️',
    route: '/biology/anatomy/digestive',
    available: true,
  },
  {
    id: 'kidney',
    titleKey: 'biology.topic.kidney.title',
    descriptionKey: 'biology.topic.kidney.description',
    icon: '🫘',
    route: '/biology/anatomy/kidney',
    available: true,
  },
  {
    id: 'eye',
    titleKey: 'biology.topic.eye.title',
    descriptionKey: 'biology.topic.eye.description',
    icon: '👁️',
    route: '/biology/anatomy/eye',
    available: true,
  },
];
