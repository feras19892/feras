import type { BiologyTopic } from '../types/biology.types';

export const cellBiologyTopics: BiologyTopic[] = [
  {
    id: 'dna-structure',
    titleKey: 'biology.dnaStructureTitle',
    descriptionKey: 'biology.dnaStructureSubtitle',
    icon: '🧬',
    route: '/biology/cell/dna-structure',
    available: true,
  },
  {
    id: 'plant-cell',
    titleKey: 'biology.plantCellTitle',
    descriptionKey: 'biology.plantCellSubtitle',
    icon: '🌱',
    route: '/biology/cell/plant-cell',
    available: true,
  },
  {
    id: 'protein-synthesis',
    titleKey: 'biology.topic.proteinSynthesis.title',
    descriptionKey: 'biology.topic.proteinSynthesis.description',
    icon: '🧫',
    route: '/biology/cell/protein-synthesis',
    available: true,
  },
];
