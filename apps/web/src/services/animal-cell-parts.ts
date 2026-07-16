import type { ModelPart } from '../composables/biology/useGLBModel';

export const animalCellParts: ModelPart[] = [
  {
    id: 'cell-membrane',
    nameKey: 'biology.organelle.membrane.name',
    descriptionKey: 'biology.organelle.membrane.description',
    longDescriptionKey: 'biology.organelle.membrane.longDescription',
    factsKeys: ['biology.organelle.membrane.fact1', 'biology.organelle.membrane.fact2', 'biology.organelle.membrane.fact3'],
    position: [0, 2, 3.5],
  },
  {
    id: 'nucleus',
    nameKey: 'biology.organelle.nucleus.name',
    descriptionKey: 'biology.organelle.nucleus.description',
    longDescriptionKey: 'biology.organelle.nucleus.longDescription',
    factsKeys: ['biology.organelle.nucleus.fact1', 'biology.organelle.nucleus.fact2', 'biology.organelle.nucleus.fact3'],
    position: [0, 2, 0],
  },
  {
    id: 'mitochondrion',
    nameKey: 'biology.organelle.mitochondrion.name',
    descriptionKey: 'biology.organelle.mitochondrion.description',
    longDescriptionKey: 'biology.organelle.mitochondrion.longDescription',
    factsKeys: ['biology.organelle.mitochondrion.fact1', 'biology.organelle.mitochondrion.fact2', 'biology.organelle.mitochondrion.fact3'],
    position: [2.2, 1.5, 1.2],
  },
  {
    id: 'endoplasmic-reticulum',
    nameKey: 'biology.organelle.endoplasmicReticulum.name',
    descriptionKey: 'biology.organelle.endoplasmicReticulum.description',
    longDescriptionKey: 'biology.organelle.endoplasmicReticulum.longDescription',
    factsKeys: ['biology.organelle.endoplasmicReticulum.fact1', 'biology.organelle.endoplasmicReticulum.fact2', 'biology.organelle.endoplasmicReticulum.fact3'],
    position: [1.5, 3.2, -1.2],
  },
  {
    id: 'ribosomes',
    nameKey: 'biology.organelle.ribosomes.name',
    descriptionKey: 'biology.organelle.ribosomes.description',
    longDescriptionKey: 'biology.organelle.ribosomes.longDescription',
    factsKeys: ['biology.organelle.ribosomes.fact1', 'biology.organelle.ribosomes.fact2', 'biology.organelle.ribosomes.fact3'],
    position: [-1.5, 2.5, 1.8],
  },
];
