<script setup lang="ts">
import GeneticsStageExperiment from '../../../modules/biology/components/GeneticsStageExperiment.vue';
import { useDNAReplication3D } from '../../../composables/biology/useDNAReplication3D';
import { dnaReplicationStages, dnaReplicationExperiment } from '../../../services/genetics-stages-data';
</script>

<template>
  <GeneticsStageExperiment
    :engine-factory="useDNAReplication3D"
    :stages="dnaReplicationStages"
    :experiment-meta="dnaReplicationExperiment"
    stage-label-key="biology.dnaReplicationStageLabel"
    back-route="/biology/genetics"
  />
</template>
