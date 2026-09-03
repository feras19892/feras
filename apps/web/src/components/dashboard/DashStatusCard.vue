<template>
  <article
    class="dash-status-card"
    :class="`dash-status-card--${color}`"
    @click="emits('click')"
  >
    <div class="dash-status-card__main">
      <h4 class="dash-status-card__title">{{ title }}</h4>
      <p v-if="meta" class="dash-status-card__meta">{{ meta }}</p>
    </div>
    <span class="dash-status-card__badge" :class="`dash-status-card__badge--${color}`">
      {{ statusLabel }}
    </span>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
interface Props {
  title: string
  meta?: string
  statusLabel: string
  color: 'success' | 'warning' | 'danger' | 'info'
}

defineProps<Props>()
const emits = defineEmits<{ click: [] }>()
</script>

<style scoped>
.dash-status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  border-right: 4px solid var(--border-color);
}

.dash-status-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.dash-status-card__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.dash-status-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-status-card__meta {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-status-card__badge {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.dash-status-card--success { border-right-color: var(--success); }
.dash-status-card--warning { border-right-color: var(--warning); }
.dash-status-card--danger { border-right-color: var(--danger); }
.dash-status-card--info { border-right-color: var(--info); }

.dash-status-card__badge--success { background: var(--success-light); color: var(--success-text); }
.dash-status-card__badge--warning { background: var(--warning-light); color: var(--warning-text); }
.dash-status-card__badge--danger { background: var(--danger-light); color: var(--danger-text); }
.dash-status-card__badge--info { background: var(--info-light); color: var(--info-text); }
</style>