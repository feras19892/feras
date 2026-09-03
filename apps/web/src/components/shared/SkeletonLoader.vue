<template>
  <div class="skeleton-wrapper">
    <div v-if="type === 'cards'" class="skeleton-cards">
      <div v-for="i in count" :key="i" class="skeleton-card">
        <div class="skeleton-line wide" />
        <div class="skeleton-line" />
        <div class="skeleton-line short" />
      </div>
    </div>
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div v-for="i in count" :key="i" class="skeleton-row">
        <div class="skeleton-cell" />
        <div class="skeleton-cell" />
        <div class="skeleton-cell" />
        <div class="skeleton-cell" />
        <div class="skeleton-cell" />
      </div>
    </div>
    <div v-else class="skeleton-list">
      <div v-for="i in count" :key="i" class="skeleton-item">
        <div class="skeleton-line wide" />
        <div class="skeleton-line" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
withDefaults(defineProps<{
  type?: 'cards' | 'table' | 'list'
  count?: number
}>(), {
  type: 'list',
  count: 5,
})
</script>

<style scoped>
.skeleton-wrapper { padding: 8px; }
.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.skeleton-card {
  background: white; padding: 20px; border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.skeleton-table { display: flex; flex-direction: column; gap: 8px; }
.skeleton-row {
  display: flex; gap: 16px; background: white;
  padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;
}
.skeleton-cell { flex: 1; height: 16px; border-radius: 4px; background: #e5e7eb; }
.skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.skeleton-item {
  background: white; padding: 16px 20px; border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.skeleton-line {
  height: 14px; border-radius: 4px; background: #e5e7eb;
  animation: pulse 1.5s ease-in-out infinite;
}
.skeleton-line.wide { width: 60%; margin-bottom: 8px; }
.skeleton-line.short { width: 40%; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>