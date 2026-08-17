<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { kidneyParts } from '../../../services/kidney-glb-parts';
</script>

<template>
  <GLBExperiment
    model-path="/models/kidney.glb"
    title-key="biology.anatomy.kidney.title"
    subtitle-key="biology.anatomy.kidney.subtitle"
    back-route="/biology/anatomy"
    back-label-key="biology.backToAnatomySection"
    :parts="kidneyParts"
  />
</template>
