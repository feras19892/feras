<script setup lang="ts">
import AnatomyViewerExperiment from '../../../modules/biology/components/AnatomyViewerExperiment.vue';
import { skeletonData } from '../../../services/anatomy-viewer-data';
</script>

<template>
  <AnatomyViewerExperiment :organ-data="skeletonData" />
</template>
