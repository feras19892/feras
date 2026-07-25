<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { brainGLBParts } from '../../../services/brain-glb-parts';
</script>

<template>
  <GLBExperiment
    model-path="/models/brain.glb"
    title-key="biology.brainTitle"
    subtitle-key="biology.brainSubtitle"
    back-route="/biology/anatomy"
    back-label-key="biology.backToAnatomySection"
    :parts="brainGLBParts"
  />
</template>
