<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
defineProps<{
  type?: 'info' | 'warning' | 'danger' | 'success'
  icon?: string
  title?: string
  dismissible?: boolean
}>()

const emit = defineEmits<{
  dismiss: []
}>()
</script>

<template>
  <div :class="['alert-banner', type || 'info']">
    <span class="alert-icon">{{ icon || (type === 'danger' ? '🚨' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️') }}</span>
    <div class="alert-content">
      <span v-if="title" class="alert-title">{{ title }}</span>
      <div class="alert-message"><slot /></div>
    </div>
    <button v-if="dismissible" class="alert-dismiss" @click="emit('dismiss')">✕</button>
  </div>
</template>

<style scoped>
.alert-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md, 8px);
  margin-bottom: 16px;
  border: 1px solid;
}
.alert-banner.info {
  background: var(--info-light, #dbeafe);
  border-color: var(--info, #3b82f6);
  color: var(--info-text, #2563eb);
}
.alert-banner.warning {
  background: var(--warning-light, #fef3c7);
  border-color: var(--warning, #f59e0b);
  color: var(--warning-text, #d97706);
}
.alert-banner.danger {
  background: var(--danger-light, #fee2e2);
  border-color: var(--danger, #ef4444);
  color: var(--danger-text, #dc2626);
}
.alert-banner.success {
  background: var(--success-light, #dcfce7);
  border-color: var(--success, #22c55e);
  color: var(--success-text, #16a34a);
}
.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.alert-title {
  font-weight: 700;
  font-size: 14px;
}
.alert-message {
  font-size: 13px;
  line-height: 1.5;
}
.alert-dismiss {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  padding: 2px 6px;
  border-radius: 4px;
  transition: opacity 0.15s;
}
.alert-dismiss:hover { opacity: 1; }
</style>