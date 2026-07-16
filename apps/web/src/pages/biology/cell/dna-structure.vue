<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import { dnaGLBParts } from '../../../services/dna-glb-parts';
</script>

<template>
  <GLBExperiment
    model-path="/models/dna.glb"
    title-key="biology.dnaStructureTitle"
    subtitle-key="biology.dnaStructureSubtitle"
    back-route="/biology/cell"
    back-label-key="biology.backToCellSection"
    :parts="dnaGLBParts"
  />
</template>
