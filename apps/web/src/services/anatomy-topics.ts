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
];
