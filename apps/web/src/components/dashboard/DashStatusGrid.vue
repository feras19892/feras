<template>
  <div class="dash-status-grid" role="group" aria-label="فلاتر الحالة">
    <button
      v-for="item in items"
      :key="item.status"
      class="dash-status-grid__item"
      :class="`dash-status-grid__item--${item.color}`"
      :aria-pressed="item.active"
      @click="handleClick(item)"
    >
      <span class="dash-status-grid__icon" aria-hidden="true">{{ item.icon }}</span>
      <span class="dash-status-grid__count">{{ item.count }}</span>
      <span class="dash-status-grid__label">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
export interface StatusGridItem {
  status: string
  label: string
  count: number
  icon: string
  color: 'success' | 'warning' | 'danger' | 'info'
  active?: boolean
}

interface Props {
  items: StatusGridItem[]
}

const props = defineProps<Props>()
const emits = defineEmits<{ select: [status: string] }>()

function handleClick(item: StatusGridItem) {
  emits('select', item.status)
}
</script>

<style scoped>
.dash-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.dash-status-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 8px;
  min-height: 90px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.dash-status-grid__item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.dash-status-grid__item[aria-pressed="true"] {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.dash-status-grid__icon {
  font-size: 20px;
}

.dash-status-grid__count {
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.dash-status-grid__label {
  font-size: 12px;
  font-weight: 600;
}

.dash-status-grid__item--success {
  border-color: var(--success);
  background: var(--success-light);
  color: var(--success-text);
}

.dash-status-grid__item--warning {
  border-color: var(--warning);
  background: var(--warning-light);
  color: var(--warning-text);
}

.dash-status-grid__item--danger {
  border-color: var(--danger);
  background: var(--danger-light);
  color: var(--danger-text);
}

.dash-status-grid__item--info {
  border-color: var(--info);
  background: var(--info-light);
  color: var(--info-text);
}
</style>