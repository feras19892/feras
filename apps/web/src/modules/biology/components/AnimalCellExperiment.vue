<script setup lang="ts">
import BiologyExperiment from './BiologyExperiment.vue';
import { animalCellExperiment } from '../../../services/biology-data';
</script>

<template>
  <BiologyExperiment :experiment="animalCellExperiment" back-route="/biology/cell" />
</template>
