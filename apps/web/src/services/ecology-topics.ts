import type { BiologyTopic } from '../types/biology.types';

export const ecologyTopics: BiologyTopic[] = [
  {
    id: 'food-chain',
    titleKey: 'biology.topic.foodChain.title',
    descriptionKey: 'biology.topic.foodChain.description',
    icon: '🦗',
    route: '/biology/ecology/food-chain',
    available: true,
  },
  {
    id: 'water-cycle',
    titleKey: 'biology.topic.waterCycle.title',
    descriptionKey: 'biology.topic.waterCycle.description',
    icon: '💧',
    route: '/biology/ecology/water-cycle',
    available: true,
  },
  {
    id: 'ecosystem-balance',
    titleKey: 'biology.topic.ecosystemBalance.title',
    descriptionKey: 'biology.topic.ecosystemBalance.description',
    icon: '⚖️',
    route: '/biology/ecology/ecosystem-balance',
    available: true,
  },
];
