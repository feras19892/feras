<script setup lang="ts">
import BiologyBranchIndex from '../../../modules/biology/components/BiologyBranchIndex.vue';
import { biotechnologyTopics } from '../../../services/biotechnology-topics';
</script>

<template>
  <BiologyBranchIndex
    :topics="biotechnologyTopics"
    title-key="biology.biotechnologySectionTitle"
    subtitle-key="biology.biotechnologySectionSubtitle"
  />
</template>