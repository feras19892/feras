<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { eyeParts } from '../../../services/eye-glb-parts';
import { enhanceEyeModel } from '../../../services/eye-texture-enhancer';
</script>

<template>
  <GLBExperiment
    model-path="/models/eye-hubmap-realistic.glb"
    title-key="biology.anatomy.eye.title"
    subtitle-key="biology.anatomy.eye.subtitle"
    back-route="/biology/anatomy"
    back-label-key="biology.backToAnatomySection"
    :parts="eyeParts"
    :model-enhancer="enhanceEyeModel"
  />
</template>
