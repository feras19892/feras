<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
const props = defineProps<{ title: string }>()
</script>

<template>
  <div class="lab-card">
    <div class="card-header">
      <h4>{{ props.title }}</h4>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.lab-card { background: #1E2530; border-radius: 8px; padding: .6rem; border: 1px solid #2D3645; display: flex; flex-direction: column; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin: 0 0 .3rem; flex-shrink: 0; }
.card-header h4 { margin: 0; font-size: .82rem; color: #D1D7E0; font-weight: 700; }
</style>