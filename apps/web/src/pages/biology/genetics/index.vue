<script setup lang="ts">
import BiologyBranchIndex from '../../../modules/biology/components/BiologyBranchIndex.vue';
import { geneticsTopics } from '../../../services/genetics-topics';
</script>

<template>
  <BiologyBranchIndex
    :topics="geneticsTopics"
    title-key="biology.geneticsSectionTitle"
    subtitle-key="biology.geneticsSectionSubtitle"
  />
</template>