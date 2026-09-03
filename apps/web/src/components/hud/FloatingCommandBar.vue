<template>
  <nav class="hud-dock" role="tablist" :aria-label="t('dashboard.dashNew.navigation')">
    <button
      v-for="item in items"
      :key="item.id"
      class="hud-dock-item"
      :class="{ active: item.id === activeId }"
      :aria-selected="item.id === activeId"
      @click="emits('select', item.id)"
    >
      <span class="hud-dock-icon" aria-hidden="true">{{ item.icon }}</span>
      <span class="hud-dock-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import type { FloatingCommandItem } from '@/composables/hud/useFloatingCommandBar'

interface Props {
  items: FloatingCommandItem[]
  activeId: string
}

defineProps<Props>()
const emits = defineEmits<{ select: [tabId: string] }>()

</script>

<style scoped>
.hud-dock {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid var(--hud-border);
  background: var(--hud-surface);
  backdrop-filter: blur(var(--hud-glass-blur));
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: auto;
  min-width: 260px;
  max-width: min(900px, calc(100% - 48px));
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hud-dock::-webkit-scrollbar {
  display: none;
}

.hud-dock-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--hud-text-muted);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.hud-dock-item:hover,
.hud-dock-item.active {
  background: var(--hud-surface-solid);
  color: var(--hud-text);
}

.hud-dock-item.active {
  color: var(--hud-accent);
  box-shadow: 0 0 0 1px var(--hud-accent-glow), 0 0 16px var(--hud-accent-glow);
}

.hud-dock-icon {
  font-size: 16px;
  line-height: 1;
}

.hud-dock-label {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .hud-dock {
    top: 72px;
    padding: 4px;
    gap: 2px;
    min-width: auto;
    max-width: calc(100% - 24px);
  }
  .hud-dock-item {
    padding: 8px 10px;
  }
  .hud-dock-icon {
    font-size: 14px;
  }
  .hud-dock-label {
    font-size: 11px;
  }
}
</style>
