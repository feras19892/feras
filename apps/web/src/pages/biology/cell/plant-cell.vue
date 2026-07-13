<script setup lang="ts">
import BiologyExperiment from '../../../modules/biology/components/BiologyExperiment.vue';
import { plantCellExperiment } from '../../../services/plant-cell-data';
</script>

<template>
  <BiologyExperiment :experiment="plantCellExperiment" back-route="/biology/cell" />
</template>
