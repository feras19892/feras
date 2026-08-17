import type { ModelPart } from '../composables/biology/useGLBModel';

export const lungsParts: ModelPart[] = [
  {
    id: 'trachea',
    nameKey: 'biology.lungs.trachea.name',
    descriptionKey: 'biology.lungs.trachea.description',
    longDescriptionKey: 'biology.lungs.trachea.longDescription',
    factsKeys: [
      'biology.lungs.trachea.fact1',
      'biology.lungs.trachea.fact2',
      'biology.lungs.trachea.fact3',
    ],
    position: [0, 0.4, 0],
    groupNames: ['VH_F_cartilage_of_tracheobronchial_tree'],
    meshNames: ['VH_F_trachea'],
  },
  {
    id: 'bronchi',
    nameKey: 'biology.lungs.bronchi.name',
    descriptionKey: 'biology.lungs.bronchi.description',
    longDescriptionKey: 'biology.lungs.bronchi.longDescription',
    factsKeys: [
      'biology.lungs.bronchi.fact1',
      'biology.lungs.bronchi.fact2',
      'biology.lungs.bronchi.fact3',
    ],
    position: [0, -0.1, 0],
    groupNames: ['VH_F_bronchi'],
  },
  {
    id: 'leftLung',
    nameKey: 'biology.lungs.leftLung.name',
    descriptionKey: 'biology.lungs.leftLung.description',
    longDescriptionKey: 'biology.lungs.leftLung.longDescription',
    factsKeys: [
      'biology.lungs.leftLung.fact1',
      'biology.lungs.leftLung.fact2',
      'biology.lungs.leftLung.fact3',
    ],
    position: [-0.05, 0, 0],
    groupNames: ['VH_F_left_lungs_L'],
  },
  {
    id: 'rightLung',
    nameKey: 'biology.lungs.rightLung.name',
    descriptionKey: 'biology.lungs.rightLung.description',
    longDescriptionKey: 'biology.lungs.rightLung.longDescription',
    factsKeys: [
      'biology.lungs.rightLung.fact1',
      'biology.lungs.rightLung.fact2',
      'biology.lungs.rightLung.fact3',
    ],
    position: [0.05, 0, 0],
    groupNames: ['VH_F_lungs_R'],
  },
];
