import type { BiologyTopic } from '../types/biology.types';

export const cellBiologyTopics: BiologyTopic[] = [
  {
    id: 'dna-structure',
    titleKey: 'biology.topic.dnaStructure.title',
    descriptionKey: 'biology.topic.dnaStructure.description',
    icon: '🧪',
    route: '/biology/cell/dna-structure',
    available: true,
  },
  {
    id: 'mitosis',
    titleKey: 'biology.topic.mitosis.title',
    descriptionKey: 'biology.topic.mitosis.description',
    icon: '🔬',
    route: '/biology/cell/mitosis',
    available: true,
  },
  {
    id: 'plant-cell',
    titleKey: 'biology.topic.plantCell.title',
    descriptionKey: 'biology.topic.plantCell.description',
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
  {
    id: 'animal-cell',
    titleKey: 'biology.topic.animalCell.title',
    descriptionKey: 'biology.topic.animalCell.description',
    icon: '🐇',
    route: '/biology/cell/animal-cell',
    available: true,
  },
];
