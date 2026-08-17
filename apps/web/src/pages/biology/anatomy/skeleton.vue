<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { skeletonParts } from '../../../services/skeleton-glb-parts';
</script>

<template>
  <GLBExperiment
    model-path="/models/skeleton.glb"
    title-key="biology.anatomy.skeleton.title"
    subtitle-key="biology.anatomy.skeleton.subtitle"
    back-route="/biology/anatomy"
    back-label-key="biology.backToAnatomySection"
    :parts="skeletonParts"
  />
</template>
