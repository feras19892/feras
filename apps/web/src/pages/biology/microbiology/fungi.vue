<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { buildFungiModel } from '../../../services/fungi-model-builder';
import type { ModelPart } from '../../../composables/biology/useGLBModel';

const fungiParts: ModelPart[] = [
  {
    id: 'cap',
    nameKey: 'biology.fungiPart.cap.name',
    descriptionKey: 'biology.fungiPart.cap.description',
    longDescriptionKey: 'biology.fungiPart.cap.longDescription',
    factsKeys: [
      'biology.fungiPart.cap.fact1',
      'biology.fungiPart.cap.fact2',
      'biology.fungiPart.cap.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['cap'],
  },
  {
    id: 'gills',
    nameKey: 'biology.fungiPart.gills.name',
    descriptionKey: 'biology.fungiPart.gills.description',
    longDescriptionKey: 'biology.fungiPart.gills.longDescription',
    factsKeys: [
      'biology.fungiPart.gills.fact1',
      'biology.fungiPart.gills.fact2',
      'biology.fungiPart.gills.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['gills'],
  },
  {
    id: 'spores',
    nameKey: 'biology.fungiPart.spores.name',
    descriptionKey: 'biology.fungiPart.spores.description',
    longDescriptionKey: 'biology.fungiPart.spores.longDescription',
    factsKeys: [
      'biology.fungiPart.spores.fact1',
      'biology.fungiPart.spores.fact2',
      'biology.fungiPart.spores.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['spores'],
  },
  {
    id: 'ring',
    nameKey: 'biology.fungiPart.ring.name',
    descriptionKey: 'biology.fungiPart.ring.description',
    longDescriptionKey: 'biology.fungiPart.ring.longDescription',
    factsKeys: [
      'biology.fungiPart.ring.fact1',
      'biology.fungiPart.ring.fact2',
      'biology.fungiPart.ring.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['ring'],
  },
  {
    id: 'stem',
    nameKey: 'biology.fungiPart.stem.name',
    descriptionKey: 'biology.fungiPart.stem.description',
    longDescriptionKey: 'biology.fungiPart.stem.longDescription',
    factsKeys: [
      'biology.fungiPart.stem.fact1',
      'biology.fungiPart.stem.fact2',
      'biology.fungiPart.stem.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['stem'],
  },
  {
    id: 'mycelium',
    nameKey: 'biology.fungiPart.mycelium.name',
    descriptionKey: 'biology.fungiPart.mycelium.description',
    longDescriptionKey: 'biology.fungiPart.mycelium.longDescription',
    factsKeys: [
      'biology.fungiPart.mycelium.fact1',
      'biology.fungiPart.mycelium.fact2',
      'biology.fungiPart.mycelium.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['mycelium'],
  },
];
</script>

<template>
  <GLBExperiment
    model-path=""
    title-key="biology.fungiTitle"
    subtitle-key="biology.fungiSubtitle"
    back-route="/biology/microbiology"
    back-label-key="biology.backToMicrobiologySection"
    :parts="fungiParts"
    :model-generator="buildFungiModel"
  />
</template>
