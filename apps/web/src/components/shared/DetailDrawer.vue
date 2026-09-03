<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
defineProps<{
  open: boolean
  title?: string
  width?: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="open" class="drawer-overlay" @click.self="emit('close')">
        <div class="drawer-panel" :style="{ width: width || '480px' }">
          <div class="drawer-header">
            <h3>{{ title || '' }}</h3>
            <button class="drawer-close" @click="emit('close')">✕</button>
          </div>
          <div class="drawer-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="drawer-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: flex-end;
}
.drawer-panel {
  background: var(--bg-card, #ffffff);
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  max-width: 90vw;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  flex-shrink: 0;
}
.drawer-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary, #1a2332);
}
.drawer-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-secondary, #6b7280);
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.drawer-close:hover {
  background: var(--bg-hover, #f8fafc);
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-shrink: 0;
}
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-active .drawer-panel,
.drawer-fade-leave-active .drawer-panel {
  transition: transform 0.25s ease;
}
.drawer-fade-enter-from .drawer-panel,
.drawer-fade-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>