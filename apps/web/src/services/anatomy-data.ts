import type { HeartPart } from '../composables/biology/useHeartGLB';

export const heartParts: HeartPart[] = [
  {
    id: 'leftAtrium',
    nameKey: 'biology.heart.leftAtrium.name',
    descriptionKey: 'biology.heart.leftAtrium.description',
    longDescriptionKey: 'biology.heart.leftAtrium.longDescription',
    factsKeys: [
      'biology.heart.leftAtrium.fact1',
      'biology.heart.leftAtrium.fact2',
      'biology.heart.leftAtrium.fact3',
    ],
    position: [-1.2, 3.8, 0.8],
  },
  {
    id: 'rightAtrium',
    nameKey: 'biology.heart.rightAtrium.name',
    descriptionKey: 'biology.heart.rightAtrium.description',
    longDescriptionKey: 'biology.heart.rightAtrium.longDescription',
    factsKeys: [
      'biology.heart.rightAtrium.fact1',
      'biology.heart.rightAtrium.fact2',
      'biology.heart.rightAtrium.fact3',
    ],
    position: [1.2, 3.8, 0.8],
  },
  {
    id: 'leftVentricle',
    nameKey: 'biology.heart.leftVentricle.name',
    descriptionKey: 'biology.heart.leftVentricle.description',
    longDescriptionKey: 'biology.heart.leftVentricle.longDescription',
    factsKeys: [
      'biology.heart.leftVentricle.fact1',
      'biology.heart.leftVentricle.fact2',
      'biology.heart.leftVentricle.fact3',
    ],
    position: [-1.3, 0.5, 0.6],
  },
  {
    id: 'rightVentricle',
    nameKey: 'biology.heart.rightVentricle.name',
    descriptionKey: 'biology.heart.rightVentricle.description',
    longDescriptionKey: 'biology.heart.rightVentricle.longDescription',
    factsKeys: [
      'biology.heart.rightVentricle.fact1',
      'biology.heart.rightVentricle.fact2',
      'biology.heart.rightVentricle.fact3',
    ],
    position: [1.3, 0.5, 0.6],
  },
  {
    id: 'septum',
    nameKey: 'biology.heart.septum.name',
    descriptionKey: 'biology.heart.septum.description',
    longDescriptionKey: 'biology.heart.septum.longDescription',
    factsKeys: [
      'biology.heart.septum.fact1',
      'biology.heart.septum.fact2',
      'biology.heart.septum.fact3',
    ],
    position: [0, 2.2, 0.8],
  },
  {
    id: 'aorticValve',
    nameKey: 'biology.heart.aorticValve.name',
    descriptionKey: 'biology.heart.aorticValve.description',
    longDescriptionKey: 'biology.heart.aorticValve.longDescription',
    factsKeys: [
      'biology.heart.aorticValve.fact1',
      'biology.heart.aorticValve.fact2',
      'biology.heart.aorticValve.fact3',
    ],
    position: [-0.5, 2.6, 0.3],
  },
  {
    id: 'mitralValve',
    nameKey: 'biology.heart.mitralValve.name',
    descriptionKey: 'biology.heart.mitralValve.description',
    longDescriptionKey: 'biology.heart.mitralValve.longDescription',
    factsKeys: [
      'biology.heart.mitralValve.fact1',
      'biology.heart.mitralValve.fact2',
      'biology.heart.mitralValve.fact3',
    ],
    position: [-1.1, 1.3, 0.4],
  },
  {
    id: 'pulmonaryValve',
    nameKey: 'biology.heart.pulmonaryValve.name',
    descriptionKey: 'biology.heart.pulmonaryValve.description',
    longDescriptionKey: 'biology.heart.pulmonaryValve.longDescription',
    factsKeys: [
      'biology.heart.pulmonaryValve.fact1',
      'biology.heart.pulmonaryValve.fact2',
      'biology.heart.pulmonaryValve.fact3',
    ],
    position: [0.5, 2.4, 0.3],
  },
  {
    id: 'tricuspidValve',
    nameKey: 'biology.heart.tricuspidValve.name',
    descriptionKey: 'biology.heart.tricuspidValve.description',
    longDescriptionKey: 'biology.heart.tricuspidValve.longDescription',
    factsKeys: [
      'biology.heart.tricuspidValve.fact1',
      'biology.heart.tricuspidValve.fact2',
      'biology.heart.tricuspidValve.fact3',
    ],
    position: [1.1, 1.3, 0.4],
  },
];
