<script setup lang="ts">
defineProps<{
  icon?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon || '📭' }}</div>
    <div class="empty-title">{{ title }}</div>
    <div v-if="description" class="empty-desc">{{ description }}</div>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  text-align: center;
}
.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.6rem;
  opacity: 0.6;
}
.empty-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #cbd5e1;
}
.empty-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.3rem;
  max-width: 320px;
}
</style>
