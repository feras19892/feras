import type { ModelPart } from '../composables/biology/useGLBModel';

export const mitosisGLBParts: ModelPart[] = [
  {
    id: 'cell',
    nameKey: 'biology.mitosis.cellModel.name',
    descriptionKey: 'biology.mitosis.cellModel.description',
    longDescriptionKey: 'biology.mitosis.cellModel.longDescription',
    factsKeys: [
      'biology.mitosis.cellModel.fact1',
      'biology.mitosis.cellModel.fact2',
      'biology.mitosis.cellModel.fact3',
    ],
    position: [0, 0, 0],
    meshNames: ['meshes[0]'],
  },
];
