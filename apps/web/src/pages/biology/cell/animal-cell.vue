<script setup lang="ts">
import AnimalCellExperiment from '../../../modules/biology/components/AnimalCellExperiment.vue';
import { animalCellParts } from '../../../services/animal-cell-data';
</script>

<template>
  <AnimalCellExperiment :parts="animalCellParts" />
</template>
