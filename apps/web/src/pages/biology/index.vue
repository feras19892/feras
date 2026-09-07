<script setup lang="ts">
import BiologyBranchIndex from '../../modules/biology/components/BiologyBranchIndex.vue';
import { biologySections } from '../../services/biology-sections';
</script>

<template>
  <BiologyBranchIndex
    :topics="biologySections"
    title-key="biology.title"
    subtitle-key="biology.subtitle"
    back-route="/home"
    back-label-key="biology.backToHome"
  />
</template>
