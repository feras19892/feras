import type { HeartPart } from '../composables/biology/useHeartGLB';

export interface AnimalCellPart extends HeartPart {}

export const animalCellParts: AnimalCellPart[] = [
  {
    id: 'cellMembrane',
    nameKey: 'biology.animalCell.cellMembrane.name',
    descriptionKey: 'biology.animalCell.cellMembrane.description',
    longDescriptionKey: 'biology.animalCell.cellMembrane.longDescription',
    factsKeys: [
      'biology.animalCell.cellMembrane.fact1',
      'biology.animalCell.cellMembrane.fact2',
      'biology.animalCell.cellMembrane.fact3',
    ],
    position: [0, 1.6, 2.2],
  },
  {
    id: 'nucleus',
    nameKey: 'biology.animalCell.nucleus.name',
    descriptionKey: 'biology.animalCell.nucleus.description',
    longDescriptionKey: 'biology.animalCell.nucleus.longDescription',
    factsKeys: [
      'biology.animalCell.nucleus.fact1',
      'biology.animalCell.nucleus.fact2',
      'biology.animalCell.nucleus.fact3',
    ],
    position: [0, 0.2, 0.4],
  },
  {
    id: 'mitochondrion',
    nameKey: 'biology.animalCell.mitochondrion.name',
    descriptionKey: 'biology.animalCell.mitochondrion.description',
    longDescriptionKey: 'biology.animalCell.mitochondrion.longDescription',
    factsKeys: [
      'biology.animalCell.mitochondrion.fact1',
      'biology.animalCell.mitochondrion.fact2',
      'biology.animalCell.mitochondrion.fact3',
    ],
    position: [1.8, -0.8, 0.8],
  },
  {
    id: 'endoplasmicReticulum',
    nameKey: 'biology.animalCell.endoplasmicReticulum.name',
    descriptionKey: 'biology.animalCell.endoplasmicReticulum.description',
    longDescriptionKey: 'biology.animalCell.endoplasmicReticulum.longDescription',
    factsKeys: [
      'biology.animalCell.endoplasmicReticulum.fact1',
      'biology.animalCell.endoplasmicReticulum.fact2',
      'biology.animalCell.endoplasmicReticulum.fact3',
    ],
    position: [-1.6, 0.6, -0.2],
  },
  {
    id: 'golgiApparatus',
    nameKey: 'biology.animalCell.golgiApparatus.name',
    descriptionKey: 'biology.animalCell.golgiApparatus.description',
    longDescriptionKey: 'biology.animalCell.golgiApparatus.longDescription',
    factsKeys: [
      'biology.animalCell.golgiApparatus.fact1',
      'biology.animalCell.golgiApparatus.fact2',
      'biology.animalCell.golgiApparatus.fact3',
    ],
    position: [-1.0, -1.4, 1.0],
  },
  {
    id: 'cytoplasm',
    nameKey: 'biology.animalCell.cytoplasm.name',
    descriptionKey: 'biology.animalCell.cytoplasm.description',
    longDescriptionKey: 'biology.animalCell.cytoplasm.longDescription',
    factsKeys: [
      'biology.animalCell.cytoplasm.fact1',
      'biology.animalCell.cytoplasm.fact2',
      'biology.animalCell.cytoplasm.fact3',
    ],
    position: [2.2, 0.2, -0.6],
  },
];
