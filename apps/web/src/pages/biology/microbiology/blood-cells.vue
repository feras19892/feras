<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { buildBloodModel } from '../../../services/blood-model-builder';
import type { ModelPart } from '../../../composables/biology/useGLBModel';

const bloodParts: ModelPart[] = [
  {
    id: 'redCells',
    nameKey: 'biology.bloodPart.redCells.name',
    descriptionKey: 'biology.bloodPart.redCells.description',
    longDescriptionKey: 'biology.bloodPart.redCells.longDescription',
    factsKeys: [
      'biology.bloodPart.redCells.fact1',
      'biology.bloodPart.redCells.fact2',
      'biology.bloodPart.redCells.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['redCells'],
  },
  {
    id: 'whiteCells',
    nameKey: 'biology.bloodPart.whiteCells.name',
    descriptionKey: 'biology.bloodPart.whiteCells.description',
    longDescriptionKey: 'biology.bloodPart.whiteCells.longDescription',
    factsKeys: [
      'biology.bloodPart.whiteCells.fact1',
      'biology.bloodPart.whiteCells.fact2',
      'biology.bloodPart.whiteCells.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['whiteCells'],
  },
  {
    id: 'platelets',
    nameKey: 'biology.bloodPart.platelets.name',
    descriptionKey: 'biology.bloodPart.platelets.description',
    longDescriptionKey: 'biology.bloodPart.platelets.longDescription',
    factsKeys: [
      'biology.bloodPart.platelets.fact1',
      'biology.bloodPart.platelets.fact2',
      'biology.bloodPart.platelets.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['platelets'],
  },
];
</script>

<template>
  <GLBExperiment
    model-path=""
    title-key="biology.bloodCellsTitle"
    subtitle-key="biology.bloodCellsSubtitle"
    back-route="/biology/microbiology"
    back-label-key="biology.backToMicrobiologySection"
    :parts="bloodParts"
    :model-generator="buildBloodModel"
  />
</template>
