<script setup lang="ts">
import GeneticsStageExperiment from '../../../modules/biology/components/GeneticsStageExperiment.vue';
import { useMitosis3D } from '../../../composables/biology/useMitosis3D';
import { mitosisStages, mitosisExperiment } from '../../../services/genetics-stages-data';
</script>

<template>
  <GeneticsStageExperiment
    :engine-factory="useMitosis3D"
    :stages="mitosisStages"
    :experiment-meta="mitosisExperiment"
    stage-label-key="biology.mitosisStageLabel"
    back-route="/biology/genetics"
  />
</template>
