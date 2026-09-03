<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { useToast } from '../../composables/useToast'
import type { ToastType } from '../../stores/toast.store'


const { toasts, dismiss } = useToast()

const iconMap: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
}

const colorMap: Record<ToastType, string> = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#6366f1',
  warning: '#fbbf24',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast-anim">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :style="{ borderInlineStartColor: colorMap[toast.type] }"
          @click="dismiss(toast.id)"
        >
          <span class="toast-icon">{{ iconMap[toast.type] }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  inset-inline: 1.5rem;
  z-index: 10001;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  pointer-events: none;
  align-items: center;
}
.toast-item {
  min-width: 240px;
  max-width: 420px;
  padding: 0.65rem 0.9rem;
  border-radius: 0.55rem;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-inline-start: 3px solid #6366f1;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 0.2s;
}
.toast-item:hover { opacity: 0.88; }
.toast-icon { font-size: 1rem; flex-shrink: 0; }
.toast-message {
  font-size: 0.82rem;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.4;
}

.toast-anim-enter-active, .toast-anim-leave-active { transition: all 0.3s ease; }
.toast-anim-enter-from { opacity: 0; transform: translateY(16px); }
.toast-anim-leave-to { opacity: 0; transform: translateY(16px); }
</style>
