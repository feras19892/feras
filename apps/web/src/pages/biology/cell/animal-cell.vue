<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import type { ModelPart } from '../../../composables/biology/useGLBModel';
import { buildAnimalCellModel } from '../../../services/animal-cell-model-builder';

const animalCellParts: ModelPart[] = [
  {
    id: 'membrane',
    nameKey: 'biology.organelle.membrane.name',
    descriptionKey: 'biology.organelle.membrane.description',
    longDescriptionKey: 'biology.organelle.membrane.longDescription',
    factsKeys: ['biology.organelle.membrane.fact1', 'biology.organelle.membrane.fact2', 'biology.organelle.membrane.fact3'],
    position: [0, 0, 0],
    groupNames: ['membrane'],
    dimOpacity: 0.08,
  },
  {
    id: 'cytoplasm',
    nameKey: 'biology.organelle.cytoplasm.name',
    descriptionKey: 'biology.organelle.cytoplasm.description',
    longDescriptionKey: 'biology.organelle.cytoplasm.longDescription',
    factsKeys: ['biology.organelle.cytoplasm.fact1', 'biology.organelle.cytoplasm.fact2', 'biology.organelle.cytoplasm.fact3'],
    position: [0, 0, 0],
    groupNames: ['cytoplasm'],
    dimOpacity: 0.08,
  },
  {
    id: 'nucleus',
    nameKey: 'biology.organelle.nucleus.name',
    descriptionKey: 'biology.organelle.nucleus.description',
    longDescriptionKey: 'biology.organelle.nucleus.longDescription',
    factsKeys: ['biology.organelle.nucleus.fact1', 'biology.organelle.nucleus.fact2', 'biology.organelle.nucleus.fact3'],
    position: [0, 0, 0],
    groupNames: ['nucleus'],
    dimOpacity: 0.08,
  },
  {
    id: 'mitochondria',
    nameKey: 'biology.organelle.mitochondrion.name',
    descriptionKey: 'biology.organelle.mitochondrion.description',
    longDescriptionKey: 'biology.organelle.mitochondrion.longDescription',
    factsKeys: ['biology.organelle.mitochondrion.fact1', 'biology.organelle.mitochondrion.fact2', 'biology.organelle.mitochondrion.fact3'],
    position: [0, 0, 0],
    groupNames: ['mitochondria'],
    dimOpacity: 0.08,
  },
  {
    id: 'endoplasmicReticulum',
    nameKey: 'biology.organelle.endoplasmicReticulum.name',
    descriptionKey: 'biology.organelle.endoplasmicReticulum.description',
    longDescriptionKey: 'biology.organelle.endoplasmicReticulum.longDescription',
    factsKeys: ['biology.organelle.endoplasmicReticulum.fact1', 'biology.organelle.endoplasmicReticulum.fact2', 'biology.organelle.endoplasmicReticulum.fact3'],
    position: [0, 0, 0],
    groupNames: ['endoplasmicReticulum'],
    dimOpacity: 0.08,
  },
  {
    id: 'golgi',
    nameKey: 'biology.organelle.golgi.name',
    descriptionKey: 'biology.organelle.golgi.description',
    longDescriptionKey: 'biology.organelle.golgi.longDescription',
    factsKeys: ['biology.organelle.golgi.fact1', 'biology.organelle.golgi.fact2', 'biology.organelle.golgi.fact3'],
    position: [0, 0, 0],
    groupNames: ['golgi'],
    dimOpacity: 0.08,
  },
  {
    id: 'lysosomes',
    nameKey: 'biology.organelle.lysosome.name',
    descriptionKey: 'biology.organelle.lysosome.description',
    longDescriptionKey: 'biology.organelle.lysosome.longDescription',
    factsKeys: ['biology.organelle.lysosome.fact1', 'biology.organelle.lysosome.fact2', 'biology.organelle.lysosome.fact3'],
    position: [0, 0, 0],
    groupNames: ['lysosomes'],
    dimOpacity: 0.08,
  },
  {
    id: 'centrosome',
    nameKey: 'biology.organelle.centrosome.name',
    descriptionKey: 'biology.organelle.centrosome.description',
    longDescriptionKey: 'biology.organelle.centrosome.longDescription',
    factsKeys: ['biology.organelle.centrosome.fact1', 'biology.organelle.centrosome.fact2', 'biology.organelle.centrosome.fact3'],
    position: [0, 0, 0],
    groupNames: ['centrosome'],
    dimOpacity: 0.08,
  },
  {
    id: 'ribosomes',
    nameKey: 'biology.organelle.ribosomes.name',
    descriptionKey: 'biology.organelle.ribosomes.description',
    longDescriptionKey: 'biology.organelle.ribosomes.longDescription',
    factsKeys: ['biology.organelle.ribosomes.fact1', 'biology.organelle.ribosomes.fact2', 'biology.organelle.ribosomes.fact3'],
    position: [0, 0, 0],
    groupNames: ['ribosomes'],
    dimOpacity: 0.08,
  },
];
</script>

<template>
  <GLBExperiment
    model-path=""
    title-key="biology.animalCellTitle"
    subtitle-key="biology.animalCellSubtitle"
    back-route="/biology/cell"
    back-label-key="biology.backToCellSection"
    :parts="animalCellParts"
    :model-generator="buildAnimalCellModel"
  />
</template>
