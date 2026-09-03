<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import type { ModelPart } from '../../../composables/biology/useGLBModel';

const dnaParts: ModelPart[] = [
  {
    id: 'nitrogenousBases',
    nameKey: 'biology.dna.nitrogenousBases.name',
    descriptionKey: 'biology.dna.nitrogenousBases.description',
    longDescriptionKey: 'biology.dna.nitrogenousBases.longDescription',
    factsKeys: [
      'biology.dna.nitrogenousBases.fact1',
      'biology.dna.nitrogenousBases.fact2',
      'biology.dna.nitrogenousBases.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['Object_2', 'Object_3'],
  },
  {
    id: 'hydrogenBonds',
    nameKey: 'biology.dna.hydrogenBonds.name',
    descriptionKey: 'biology.dna.hydrogenBonds.description',
    longDescriptionKey: 'biology.dna.hydrogenBonds.longDescription',
    factsKeys: [
      'biology.dna.hydrogenBonds.fact1',
      'biology.dna.hydrogenBonds.fact2',
      'biology.dna.hydrogenBonds.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['Object_11'],
  },
  {
    id: 'carbonAtoms',
    nameKey: 'biology.dna.carbonAtoms.name',
    descriptionKey: 'biology.dna.carbonAtoms.description',
    longDescriptionKey: 'biology.dna.carbonAtoms.longDescription',
    factsKeys: [
      'biology.dna.carbonAtoms.fact1',
      'biology.dna.carbonAtoms.fact2',
      'biology.dna.carbonAtoms.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['Object_7', 'Object_8', 'Object_9', 'Object_10'],
  },
  {
    id: 'nitrogenAtoms',
    nameKey: 'biology.dna.nitrogenAtoms.name',
    descriptionKey: 'biology.dna.nitrogenAtoms.description',
    longDescriptionKey: 'biology.dna.nitrogenAtoms.longDescription',
    factsKeys: [
      'biology.dna.nitrogenAtoms.fact1',
      'biology.dna.nitrogenAtoms.fact2',
      'biology.dna.nitrogenAtoms.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['Object_4', 'Object_5'],
  },
  {
    id: 'oxygenAtoms',
    nameKey: 'biology.dna.oxygenAtoms.name',
    descriptionKey: 'biology.dna.oxygenAtoms.description',
    longDescriptionKey: 'biology.dna.oxygenAtoms.longDescription',
    factsKeys: [
      'biology.dna.oxygenAtoms.fact1',
      'biology.dna.oxygenAtoms.fact2',
      'biology.dna.oxygenAtoms.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['Object_6'],
  },
  {
    id: 'hydrogenAtoms',
    nameKey: 'biology.dna.hydrogenAtoms.name',
    descriptionKey: 'biology.dna.hydrogenAtoms.description',
    longDescriptionKey: 'biology.dna.hydrogenAtoms.longDescription',
    factsKeys: [
      'biology.dna.hydrogenAtoms.fact1',
      'biology.dna.hydrogenAtoms.fact2',
      'biology.dna.hydrogenAtoms.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['Object_12', 'Object_13'],
  },
];
</script>

<template>
  <GLBExperiment
    model-path="/models/dna.glb"
    title-key="biology.dnaStructureTitle"
    subtitle-key="biology.dnaStructureSubtitle"
    back-route="/biology/cell"
    back-label-key="biology.backToCellSection"
    :parts="dnaParts"
  />
</template>
