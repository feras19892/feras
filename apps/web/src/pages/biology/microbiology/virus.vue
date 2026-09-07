<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { buildVirusModel } from '../../../services/virus-model-builder';
import type { ModelPart } from '../../../composables/biology/useGLBModel';

const virusParts: ModelPart[] = [
  {
    id: 'headCapsid',
    nameKey: 'biology.virusPart.headCapsid.name',
    descriptionKey: 'biology.virusPart.headCapsid.description',
    longDescriptionKey: 'biology.virusPart.headCapsid.longDescription',
    factsKeys: [
      'biology.virusPart.headCapsid.fact1',
      'biology.virusPart.headCapsid.fact2',
      'biology.virusPart.headCapsid.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['headCapsid'],
  },
  {
    id: 'dna',
    nameKey: 'biology.virusPart.dna.name',
    descriptionKey: 'biology.virusPart.dna.description',
    longDescriptionKey: 'biology.virusPart.dna.longDescription',
    factsKeys: [
      'biology.virusPart.dna.fact1',
      'biology.virusPart.dna.fact2',
      'biology.virusPart.dna.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['dna'],
  },
  {
    id: 'tailSheath',
    nameKey: 'biology.virusPart.tailSheath.name',
    descriptionKey: 'biology.virusPart.tailSheath.description',
    longDescriptionKey: 'biology.virusPart.tailSheath.longDescription',
    factsKeys: [
      'biology.virusPart.tailSheath.fact1',
      'biology.virusPart.tailSheath.fact2',
      'biology.virusPart.tailSheath.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['tailSheath'],
  },
  {
    id: 'basePlate',
    nameKey: 'biology.virusPart.basePlate.name',
    descriptionKey: 'biology.virusPart.basePlate.description',
    longDescriptionKey: 'biology.virusPart.basePlate.longDescription',
    factsKeys: [
      'biology.virusPart.basePlate.fact1',
      'biology.virusPart.basePlate.fact2',
      'biology.virusPart.basePlate.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['basePlate'],
  },
  {
    id: 'tailFibers',
    nameKey: 'biology.virusPart.tailFibers.name',
    descriptionKey: 'biology.virusPart.tailFibers.description',
    longDescriptionKey: 'biology.virusPart.tailFibers.longDescription',
    factsKeys: [
      'biology.virusPart.tailFibers.fact1',
      'biology.virusPart.tailFibers.fact2',
      'biology.virusPart.tailFibers.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['tailFibers'],
  },
];
</script>

<template>
  <GLBExperiment
    model-path=""
    title-key="biology.virusTitle"
    subtitle-key="biology.virusSubtitle"
    back-route="/biology/microbiology"
    back-label-key="biology.backToMicrobiologySection"
    :parts="virusParts"
    :model-generator="buildVirusModel"
  />
</template>
