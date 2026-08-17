<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
</script>

<template>
  <GLBExperiment
    model-path="/models/plant-cell.glb"
    title-key="biology.plantCellTitle"
    subtitle-key="biology.plantCellSubtitle"
    back-route="/biology/cell"
    back-label-key="biology.backToCellSection"
  />
</template>
