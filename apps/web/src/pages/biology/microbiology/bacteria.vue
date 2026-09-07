<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { buildBacteriaModel } from '../../../services/bacteria-model-builder';
import type { ModelPart } from '../../../composables/biology/useGLBModel';

const bacteriaParts: ModelPart[] = [
  {
    id: 'capsule',
    nameKey: 'biology.bacteriaPart.capsule.name',
    descriptionKey: 'biology.bacteriaPart.capsule.description',
    longDescriptionKey: 'biology.bacteriaPart.capsule.longDescription',
    factsKeys: [
      'biology.bacteriaPart.capsule.fact1',
      'biology.bacteriaPart.capsule.fact2',
      'biology.bacteriaPart.capsule.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['capsule'],
    dimOpacity: 0.08,
  },
  {
    id: 'cellWall',
    nameKey: 'biology.bacteriaPart.cellWall.name',
    descriptionKey: 'biology.bacteriaPart.cellWall.description',
    longDescriptionKey: 'biology.bacteriaPart.cellWall.longDescription',
    factsKeys: [
      'biology.bacteriaPart.cellWall.fact1',
      'biology.bacteriaPart.cellWall.fact2',
      'biology.bacteriaPart.cellWall.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['cellWall'],
    dimOpacity: 0.08,
  },
  {
    id: 'membrane',
    nameKey: 'biology.bacteriaPart.membrane.name',
    descriptionKey: 'biology.bacteriaPart.membrane.description',
    longDescriptionKey: 'biology.bacteriaPart.membrane.longDescription',
    factsKeys: [
      'biology.bacteriaPart.membrane.fact1',
      'biology.bacteriaPart.membrane.fact2',
      'biology.bacteriaPart.membrane.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['membrane'],
    dimOpacity: 0.08,
  },
  {
    id: 'cytoplasm',
    nameKey: 'biology.bacteriaPart.cytoplasm.name',
    descriptionKey: 'biology.bacteriaPart.cytoplasm.description',
    longDescriptionKey: 'biology.bacteriaPart.cytoplasm.longDescription',
    factsKeys: [
      'biology.bacteriaPart.cytoplasm.fact1',
      'biology.bacteriaPart.cytoplasm.fact2',
      'biology.bacteriaPart.cytoplasm.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['cytoplasm'],
    dimOpacity: 0.08,
  },
  {
    id: 'dna',
    nameKey: 'biology.bacteriaPart.dna.name',
    descriptionKey: 'biology.bacteriaPart.dna.description',
    longDescriptionKey: 'biology.bacteriaPart.dna.longDescription',
    factsKeys: [
      'biology.bacteriaPart.dna.fact1',
      'biology.bacteriaPart.dna.fact2',
      'biology.bacteriaPart.dna.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['dna'],
  },
  {
    id: 'ribosomes',
    nameKey: 'biology.bacteriaPart.ribosomes.name',
    descriptionKey: 'biology.bacteriaPart.ribosomes.description',
    longDescriptionKey: 'biology.bacteriaPart.ribosomes.longDescription',
    factsKeys: [
      'biology.bacteriaPart.ribosomes.fact1',
      'biology.bacteriaPart.ribosomes.fact2',
      'biology.bacteriaPart.ribosomes.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['ribosomes'],
  },
  {
    id: 'flagellum',
    nameKey: 'biology.bacteriaPart.flagellum.name',
    descriptionKey: 'biology.bacteriaPart.flagellum.description',
    longDescriptionKey: 'biology.bacteriaPart.flagellum.longDescription',
    factsKeys: [
      'biology.bacteriaPart.flagellum.fact1',
      'biology.bacteriaPart.flagellum.fact2',
      'biology.bacteriaPart.flagellum.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['flagellum'],
  },
  {
    id: 'pili',
    nameKey: 'biology.bacteriaPart.pili.name',
    descriptionKey: 'biology.bacteriaPart.pili.description',
    longDescriptionKey: 'biology.bacteriaPart.pili.longDescription',
    factsKeys: [
      'biology.bacteriaPart.pili.fact1',
      'biology.bacteriaPart.pili.fact2',
      'biology.bacteriaPart.pili.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['pili'],
  },
];
</script>

<template>
  <GLBExperiment
    model-path=""
    title-key="biology.bacteriaTitle"
    subtitle-key="biology.bacteriaSubtitle"
    back-route="/biology/microbiology"
    back-label-key="biology.backToMicrobiologySection"
    :parts="bacteriaParts"
    :model-generator="buildBacteriaModel"
  />
</template>
