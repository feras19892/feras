<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { lungsParts } from '../../../services/lungs-glb-parts';
</script>

<template>
  <GLBExperiment
    model-path="/models/lungs.glb"
    title-key="biology.lungsTitle"
    subtitle-key="biology.lungsSubtitle"
    back-route="/biology/anatomy"
    back-label-key="biology.backToAnatomySection"
    :parts="lungsParts"
  />
</template>
