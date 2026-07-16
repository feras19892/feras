<script setup lang="ts">
import HeartExperiment from '../../../modules/biology/components/HeartExperiment.vue';
import { heartParts } from '../../../services/anatomy-data';
</script>

<template>
  <HeartExperiment :parts="heartParts" />
</template>
