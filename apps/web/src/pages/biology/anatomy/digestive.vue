<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { digestiveParts } from '../../../services/digestive-glb-parts';
</script>

<template>
  <GLBExperiment
    model-path="/models/digestive.glb"
    title-key="biology.anatomy.digestive.title"
    subtitle-key="biology.anatomy.digestive.subtitle"
    back-route="/biology/anatomy"
    back-label-key="biology.backToAnatomySection"
    :parts="digestiveParts"
  />
</template>
