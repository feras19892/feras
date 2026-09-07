<script setup lang="ts">
import BiologyBranchIndex from '../../../modules/biology/components/BiologyBranchIndex.vue';
import { plantBiologyTopics } from '../../../services/plant-biology-topics';
</script>

<template>
  <BiologyBranchIndex
    :topics="plantBiologyTopics"
    title-key="biology.plantBiologySectionTitle"
    subtitle-key="biology.plantBiologySectionSubtitle"
  />
</template>