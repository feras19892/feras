<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
</script>

<template>
  <GLBExperiment
    model-path="/models/dna.glb"
    title-key="biology.dnaStructureTitle"
    subtitle-key="biology.dnaStructureSubtitle"
    back-route="/biology/cell"
    back-label-key="biology.backToCellSection"
  />
</template>
