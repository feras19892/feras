<template>
  <div v-if="items.length" class="action-dock" ref="root">
    <button
      class="action-dock-trigger"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <span class="action-dock-plus">+</span>
      <span class="action-dock-label">{{ t('dashboard.dashNew.newAction', 'إجراء جديد') }}</span>
    </button>
    <Transition name="dock-pop">
      <div v-if="open" class="action-dock-menu">
        <button
          v-for="action in items"
          :key="action.id"
          class="action-dock-item"
          @click.stop="handle(action.id)"
        >
          <span class="action-dock-icon" aria-hidden="true">{{ action.icon }}</span>
          <span>{{ action.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, onMounted, onUnmounted } from 'vue'
import type { DockAction } from '@/composables/hud/useActionDock'

interface Props {
  items: DockAction[]
}

defineProps<Props>()
const emits = defineEmits<{ action: [id: string] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle() { open.value = !open.value }
function close() { open.value = false }
function handle(id: string) { emits('action', id); close() }

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.action-dock {
  position: fixed;
  top: 140px;
  inset-inline-start: 24px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.action-dock-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--hud-border);
  border-radius: 999px;
  background: var(--hud-surface);
  color: var(--hud-text);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(var(--hud-glass-blur));
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;
}

.action-dock-trigger:hover {
  background: var(--hud-accent-glow);
  border-color: var(--hud-accent);
  box-shadow: 0 0 20px var(--hud-accent-glow);
}

.action-dock-plus {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--hud-accent);
  color: #fff;
  font-size: 18px;
  line-height: 1;
}

.action-dock-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  min-width: 180px;
  border: 1px solid var(--hud-border);
  border-radius: 14px;
  background: var(--hud-surface);
  backdrop-filter: blur(var(--hud-glass-blur));
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transform-origin: top start;
}

.action-dock-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--hud-text);
  font-family: inherit;
  font-size: 13px;
  text-align: start;
  cursor: pointer;
  transition: background 0.15s ease;
}

.action-dock-item:hover {
  background: var(--hud-surface-solid);
}

.action-dock-icon {
  font-size: 16px;
}

.dock-pop-enter-active,
.dock-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dock-pop-enter-from,
.dock-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}

@media (max-width: 640px) {
  .action-dock {
    top: 80px;
    inset-inline-start: 12px;
  }

  .action-dock-label {
    display: none;
  }

  .action-dock-trigger {
    padding: 10px;
  }

  .action-dock-menu {
    min-width: 150px;
  }
}
</style>
