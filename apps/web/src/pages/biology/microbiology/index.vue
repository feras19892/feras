<script setup lang="ts">
import BiologyBranchIndex from '../../../modules/biology/components/BiologyBranchIndex.vue';
import { microbiologyTopics } from '../../../services/microbiology-topics';
</script>

<template>
  <BiologyBranchIndex
    :topics="microbiologyTopics"
    title-key="biology.microbiologySectionTitle"
    subtitle-key="biology.microbiologySectionSubtitle"
  />
</template>