<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
withDefaults(defineProps<{
  rows?: number;
  avatar?: boolean;
}>(), {
  rows: 3,
  avatar: false,
});
</script>

<template>
  <div class="skeleton-list">
    <div v-for="i in rows" :key="i" class="skeleton-row">
      <div v-if="avatar" class="skeleton-avatar shimmer" />
      <div class="skeleton-content">
        <div class="skeleton-line shimmer" style="width: 60%" />
        <div class="skeleton-line shimmer" style="width: 40%; margin-top: 0.4rem" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0;
}
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
}
.skeleton-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}
.skeleton-content { flex: 1; }
.skeleton-line {
  height: 0.7rem;
  border-radius: 0.3rem;
}
.shimmer {
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>