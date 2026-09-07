<script setup lang="ts">
import BiologyBranchIndex from '../../../modules/biology/components/BiologyBranchIndex.vue';
import { cellBiologyTopics } from '../../../services/cell-biology-topics';
</script>

<template>
  <BiologyBranchIndex
    :topics="cellBiologyTopics"
    title-key="biology.cellBiologySectionTitle"
    subtitle-key="biology.cellBiologySectionSubtitle"
  />
</template>