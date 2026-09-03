<script setup lang="ts">
defineProps<{
  stats: Array<{ icon?: string; value: string | number; label: string }>
}>()
</script>

<template>
  <div class="compact-stats">
    <div v-for="(s, i) in stats" :key="i" class="cs-item">
      <span v-if="s.icon" class="cs-icon">{{ s.icon }}</span>
      <span class="cs-value">{{ s.value }}</span>
      <span class="cs-label">{{ s.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.compact-stats {
  display: flex; flex-wrap: wrap; gap: 0; align-items: center;
  padding: 10px 16px; background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e7eb); border-radius: 10px;
  margin-bottom: 16px;
}
.cs-item {
  display: flex; align-items: center; gap: 6px;
  padding: 0 16px; border-right: 1px solid var(--border-light, #f1f3f4);
}
.cs-item:last-child { border-right: none; }
.cs-icon { font-size: 16px; }
.cs-value { font-size: 18px; font-weight: 700; color: var(--text-primary, #1a2332); }
.cs-label { font-size: 12px; color: var(--text-secondary, #6b7280); }
@media (max-width: 640px) {
  .cs-item { padding: 4px 10px; border-right: none; }
}
</style>
