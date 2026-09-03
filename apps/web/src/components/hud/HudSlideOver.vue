<template>
  <Teleport to="body">
    <Transition name="hud-slide">
      <div v-if="open" class="hud-slide-over" @click.self="emits('close')">
        <aside class="hud-slide-panel" role="dialog" :aria-label="title" @keydown.esc="emits('close')">
          <header class="hud-slide-header">
            <h3 class="hud-slide-title">{{ title }}</h3>
            <button class="hud-slide-close" @click="emits('close')" aria-label="إغلاق">×</button>
          </header>
          <div class="hud-slide-body">
            <slot />
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
interface Props {
  open: boolean
  title: string
}

defineProps<Props>()
const emits = defineEmits<{ close: [] }>()
</script>

<style scoped>
.hud-slide-over {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
}

.hud-slide-panel {
  width: 33vw;
  min-width: 320px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--hud-border);
  border-radius: 0 24px 24px 0;
  background: var(--hud-surface);
  backdrop-filter: blur(var(--hud-glass-blur));
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.4);
}

.hud-slide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--hud-border);
}

.hud-slide-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--hud-text);
}

.hud-slide-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--hud-border);
  border-radius: 10px;
  background: var(--hud-surface-solid);
  color: var(--hud-text);
  font-size: 22px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.hud-slide-close:hover {
  background: var(--hud-accent-glow);
  border-color: var(--hud-accent);
  color: var(--hud-accent);
}

.hud-slide-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.hud-slide-enter-active,
.hud-slide-leave-active {
  transition: opacity 0.2s ease;
}

.hud-slide-enter-from,
.hud-slide-leave-to {
  opacity: 0;
}

.hud-slide-enter-active .hud-slide-panel,
.hud-slide-leave-active .hud-slide-panel {
  transition: transform 0.2s ease;
}

.hud-slide-enter-from .hud-slide-panel,
.hud-slide-leave-to .hud-slide-panel {
  transform: translateX(-60px);
}

@media (max-width: 640px) {
  .hud-slide-panel {
    width: 88vw;
    min-width: auto;
    border-radius: 0 16px 16px 0;
  }

  .hud-slide-header {
    padding: 14px 18px;
  }

  .hud-slide-body {
    padding: 18px;
  }
}
</style>