<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface ActionItem {
  label: string
  icon?: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
  emit: string
}

defineProps<{
  items: ActionItem[]
}>()

const emit = defineEmits<{ action: [key: string] }>()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle() { open.value = !open.value }
function close() { open.value = false }
function handle(key: string) { emit('action', key); close() }

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close()
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div class="action-menu" ref="root">
    <button class="action-trigger" @click.stop="toggle">⋮</button>
    <Transition name="menu-pop">
      <div v-if="open" class="action-dropdown">
        <button
          v-for="item in items"
          :key="item.emit"
          class="action-item"
          :class="item.variant || 'default'"
          @click.stop="handle(item.emit)"
        >
          <span v-if="item.icon" class="ai-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.action-menu { position: relative; display: inline-block; }
.action-trigger {
  background: none; border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px; padding: 4px 10px; cursor: pointer;
  font-size: 16px; color: var(--text-secondary, #6b7280);
  transition: all 0.15s; line-height: 1;
}
.action-trigger:hover { background: var(--bg-hover, #f8fafc); border-color: var(--accent, #3b82f6); color: var(--accent, #3b82f6); }
.action-dropdown {
  position: absolute; right: 0; top: calc(100% + 4px); z-index: 50;
  background: var(--bg-card, #fff); border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 180px; padding: 4px; overflow: hidden;
}
.action-item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 8px 12px; border: none; background: none; cursor: pointer;
  font-size: 13px; color: var(--text-primary, #1a2332); text-align: start;
  border-radius: 6px; transition: background 0.12s;
}
.action-item:hover { background: var(--bg-hover, #f8fafc); }
.action-item.danger { color: var(--danger-text, #dc2626); }
.action-item.danger:hover { background: var(--danger-light, #fee2e2); }
.action-item.warning { color: var(--warning-text, #d97706); }
.action-item.warning:hover { background: var(--warning-light, #fef3c7); }
.action-item.success { color: var(--success-text, #16a34a); }
.action-item.success:hover { background: var(--success-light, #dcfce7); }
.ai-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
.menu-pop-enter-active, .menu-pop-leave-active { transition: opacity 0.12s, transform 0.12s; }
.menu-pop-enter-from, .menu-pop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
