<script setup lang="ts">
import GeneticsStageExperiment from '../../../modules/biology/components/GeneticsStageExperiment.vue';
import { useMeiosis3D } from '../../../composables/biology/useMeiosis3D';
import { meiosisStages, meiosisExperiment } from '../../../services/genetics-stages-data';
</script>

<template>
  <GeneticsStageExperiment
    :engine-factory="useMeiosis3D"
    :stages="meiosisStages"
    :experiment-meta="meiosisExperiment"
    stage-label-key="biology.meiosisStageLabel"
    back-route="/biology/genetics"
  />
</template>
