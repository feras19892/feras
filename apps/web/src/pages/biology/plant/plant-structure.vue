<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { buildPlantStructureModel } from '../../../services/plant-model-builder';
import type { ModelPart } from '../../../composables/biology/useGLBModel';

const plantParts: ModelPart[] = [
  {
    id: 'root',
    nameKey: 'biology.plantPart.root.name',
    descriptionKey: 'biology.plantPart.root.description',
    longDescriptionKey: 'biology.plantPart.root.longDescription',
    factsKeys: [
      'biology.plantPart.root.fact1',
      'biology.plantPart.root.fact2',
      'biology.plantPart.root.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['root'],
  },
  {
    id: 'stem',
    nameKey: 'biology.plantPart.stem.name',
    descriptionKey: 'biology.plantPart.stem.description',
    longDescriptionKey: 'biology.plantPart.stem.longDescription',
    factsKeys: [
      'biology.plantPart.stem.fact1',
      'biology.plantPart.stem.fact2',
      'biology.plantPart.stem.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['stem'],
  },
  {
    id: 'leaves',
    nameKey: 'biology.plantPart.leaves.name',
    descriptionKey: 'biology.plantPart.leaves.description',
    longDescriptionKey: 'biology.plantPart.leaves.longDescription',
    factsKeys: [
      'biology.plantPart.leaves.fact1',
      'biology.plantPart.leaves.fact2',
      'biology.plantPart.leaves.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['leaves'],
  },
  {
    id: 'flower',
    nameKey: 'biology.plantPart.flower.name',
    descriptionKey: 'biology.plantPart.flower.description',
    longDescriptionKey: 'biology.plantPart.flower.longDescription',
    factsKeys: [
      'biology.plantPart.flower.fact1',
      'biology.plantPart.flower.fact2',
      'biology.plantPart.flower.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['flower'],
  },
  {
    id: 'bud',
    nameKey: 'biology.plantPart.bud.name',
    descriptionKey: 'biology.plantPart.bud.description',
    longDescriptionKey: 'biology.plantPart.bud.longDescription',
    factsKeys: [
      'biology.plantPart.bud.fact1',
      'biology.plantPart.bud.fact2',
      'biology.plantPart.bud.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['bud'],
  },
];
</script>

<template>
  <GLBExperiment
    model-path=""
    title-key="biology.plantStructureTitle"
    subtitle-key="biology.plantStructureSubtitle"
    back-route="/biology/plant"
    back-label-key="biology.backToPlantSection"
    :parts="plantParts"
    :model-generator="buildPlantStructureModel"
  />
</template>
