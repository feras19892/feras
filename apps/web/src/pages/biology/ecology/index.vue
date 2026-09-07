<script setup lang="ts">
import BiologyBranchIndex from '../../../modules/biology/components/BiologyBranchIndex.vue';
import { ecologyTopics } from '../../../services/ecology-topics';
</script>

<template>
  <BiologyBranchIndex
    :topics="ecologyTopics"
    title-key="biology.ecologySectionTitle"
    subtitle-key="biology.ecologySectionSubtitle"
  />
</template>