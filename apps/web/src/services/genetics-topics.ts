import type { BiologyTopic } from '../types/biology.types';

export const geneticsTopics: BiologyTopic[] = [
  {
    id: 'punnett-square',
    titleKey: 'biology.topic.punnettSquare.title',
    descriptionKey: 'biology.topic.punnettSquare.description',
    icon: '🧮',
    route: '/biology/genetics/punnett-square',
    available: true,
  },
  {
    id: 'mitosis',
    titleKey: 'biology.topic.mitosis.title',
    descriptionKey: 'biology.topic.mitosis.description',
    icon: '🔢',
    route: '/biology/genetics/mitosis',
    available: true,
  },
  {
    id: 'meiosis',
    titleKey: 'biology.topic.meiosis.title',
    descriptionKey: 'biology.topic.meiosis.description',
    icon: '➗',
    route: '/biology/genetics/meiosis',
    available: true,
  },
  {
    id: 'dna-replication',
    titleKey: 'biology.topic.dnaReplication.title',
    descriptionKey: 'biology.topic.dnaReplication.description',
    icon: '🧬',
    route: '/biology/genetics/dna-replication',
    available: true,
  },
];
