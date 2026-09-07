<script setup lang="ts">
import BiologyBranchIndex from '../../../modules/biology/components/BiologyBranchIndex.vue';
import { anatomyTopics } from '../../../services/anatomy-topics';
</script>

<template>
  <BiologyBranchIndex
    :topics="anatomyTopics"
    title-key="biology.humanAnatomySectionTitle"
    subtitle-key="biology.humanAnatomySectionSubtitle"
  />
</template>