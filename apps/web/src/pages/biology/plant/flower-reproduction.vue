<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { buildFlowerModel } from '../../../services/flower-model-builder';
import type { ModelPart } from '../../../composables/biology/useGLBModel';

const flowerParts: ModelPart[] = [
  {
    id: 'petals',
    nameKey: 'biology.flowerPart.petals.name',
    descriptionKey: 'biology.flowerPart.petals.description',
    longDescriptionKey: 'biology.flowerPart.petals.longDescription',
    factsKeys: [
      'biology.flowerPart.petals.fact1',
      'biology.flowerPart.petals.fact2',
      'biology.flowerPart.petals.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['petals'],
  },
  {
    id: 'sepals',
    nameKey: 'biology.flowerPart.sepals.name',
    descriptionKey: 'biology.flowerPart.sepals.description',
    longDescriptionKey: 'biology.flowerPart.sepals.longDescription',
    factsKeys: [
      'biology.flowerPart.sepals.fact1',
      'biology.flowerPart.sepals.fact2',
      'biology.flowerPart.sepals.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['sepals'],
  },
  {
    id: 'stamens',
    nameKey: 'biology.flowerPart.stamens.name',
    descriptionKey: 'biology.flowerPart.stamens.description',
    longDescriptionKey: 'biology.flowerPart.stamens.longDescription',
    factsKeys: [
      'biology.flowerPart.stamens.fact1',
      'biology.flowerPart.stamens.fact2',
      'biology.flowerPart.stamens.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['stamens'],
  },
  {
    id: 'pistil',
    nameKey: 'biology.flowerPart.pistil.name',
    descriptionKey: 'biology.flowerPart.pistil.description',
    longDescriptionKey: 'biology.flowerPart.pistil.longDescription',
    factsKeys: [
      'biology.flowerPart.pistil.fact1',
      'biology.flowerPart.pistil.fact2',
      'biology.flowerPart.pistil.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['pistil'],
  },
  {
    id: 'ovary',
    nameKey: 'biology.flowerPart.ovary.name',
    descriptionKey: 'biology.flowerPart.ovary.description',
    longDescriptionKey: 'biology.flowerPart.ovary.longDescription',
    factsKeys: [
      'biology.flowerPart.ovary.fact1',
      'biology.flowerPart.ovary.fact2',
      'biology.flowerPart.ovary.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['ovary'],
  },
  {
    id: 'pollen',
    nameKey: 'biology.flowerPart.pollen.name',
    descriptionKey: 'biology.flowerPart.pollen.description',
    longDescriptionKey: 'biology.flowerPart.pollen.longDescription',
    factsKeys: [
      'biology.flowerPart.pollen.fact1',
      'biology.flowerPart.pollen.fact2',
      'biology.flowerPart.pollen.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['pollen'],
  },
];
</script>

<template>
  <GLBExperiment
    model-path=""
    title-key="biology.flowerTitle"
    subtitle-key="biology.flowerSubtitle"
    back-route="/biology/plant"
    back-label-key="biology.backToPlantSection"
    :parts="flowerParts"
    :model-generator="buildFlowerModel"
  />
</template>
