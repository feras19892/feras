import type { BiologyTopic } from '../types/biology.types';

export const biotechnologyTopics: BiologyTopic[] = [
  {
    id: 'pcr',
    titleKey: 'biology.topic.pcr.title',
    descriptionKey: 'biology.topic.pcr.description',
    icon: '🌡️',
    route: '/biology/biotechnology/pcr',
    available: true,
  },
  {
    id: 'crispr',
    titleKey: 'biology.topic.crispr.title',
    descriptionKey: 'biology.topic.crispr.description',
    icon: '✂️',
    route: '/biology/biotechnology/crispr',
    available: true,
  },
  {
    id: 'gel-electrophoresis',
    titleKey: 'biology.topic.gelElectrophoresis.title',
    descriptionKey: 'biology.topic.gelElectrophoresis.description',
    icon: '📊',
    route: '/biology/biotechnology/gel-electrophoresis',
    available: true,
  },
];
