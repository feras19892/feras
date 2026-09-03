<template>
  <section class="dash-section" :aria-label="title">
    <header v-if="title" class="dash-section__header">
      <h3 class="dash-section__title">
        <span v-if="icon" class="dash-section__icon" aria-hidden="true">{{ icon }}</span>
        {{ title }}
      </h3>
      <div v-if="$slots.action" class="dash-section__action">
        <slot name="action" />
      </div>
    </header>

    <div v-if="loading" class="dash-section__body dash-section__body--loading">
      <SkeletonLoader type="cards" :count="1" />
    </div>
    <div v-else-if="empty" class="dash-section__empty">
      {{ emptyText }}
    </div>
    <div v-else class="dash-section__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'

interface Props {
  title?: string
  icon?: string
  loading?: boolean
  empty?: boolean
  emptyText?: string
}

withDefaults(defineProps<Props>(), {
  emptyText: 'لا توجد بيانات'
})
</script>

<style scoped>
.dash-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.dash-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-muted);
  border-bottom: 1px solid var(--border-color);
}

.dash-section__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dash-section__icon {
  font-size: 18px;
  line-height: 1;
}

.dash-section__action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dash-section__body {
  padding: 16px;
}

.dash-section__body--loading {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dash-section__empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
