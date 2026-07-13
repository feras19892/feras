<script setup lang="ts">
import BiologyExperiment from '../../../modules/biology/components/BiologyExperiment.vue';
import { dnaStructureExperiment } from '../../../services/dna-data';
</script>

<template>
  <BiologyExperiment :experiment="dnaStructureExperiment" back-route="/biology/cell" />
</template>
