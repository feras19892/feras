<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick, ref } from 'vue';
import { useCommandPalette } from '../../composables/useCommandPalette';

const palette = useCommandPalette();
const inputRef = ref<HTMLInputElement | null>(null);

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    palette.toggle();
    return;
  }
  if (!palette.open.value) return;
  if (e.key === 'Escape') { palette.close(); return; }
  if (e.key === 'ArrowDown') { e.preventDefault(); palette.moveDown(); return; }
  if (e.key === 'ArrowUp') { e.preventDefault(); palette.moveUp(); return; }
  if (e.key === 'Enter') { e.preventDefault(); palette.selectCurrent(); return; }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));

watch(() => palette.open.value, (isOpen) => {
  if (isOpen) {
    nextTick(() => inputRef.value?.focus());
  }
});

watch(() => palette.query.value, () => {
  palette.selectedIndex.value = 0;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="palette-fade">
      <div v-if="palette.open.value" class="palette-overlay" @click.self="palette.close()">
        <div class="palette-panel">
          <div class="palette-header">
            <span class="palette-icon">🔍</span>
            <input
              ref="inputRef"
              v-model="palette.query.value"
              type="text"
              class="palette-input"
              placeholder="ابحث أو انتقل إلى..."
            />
            <kbd class="palette-esc">ESC</kbd>
          </div>
          <div class="palette-list" v-if="palette.filteredCommands.value.length">
            <button
              v-for="(item, i) in palette.filteredCommands.value"
              :key="item.id"
              :class="['palette-item', { active: i === palette.selectedIndex.value }]"
              @mouseenter="palette.selectedIndex.value = i"
              @click="palette.execute(item)"
            >
              <span class="palette-item-icon">{{ item.icon || '🔗' }}</span>
              <span class="palette-item-label">{{ item.label }}</span>
              <span class="palette-item-desc" v-if="item.description">{{ item.description }}</span>
            </button>
          </div>
          <div class="palette-empty" v-else>
            لا توجد نتائج
          </div>
          <div class="palette-footer">
            <span><kbd>↑</kbd> <kbd>↓</kbd> للتنقل</span>
            <span><kbd>Enter</kbd> للاختيار</span>
            <span><kbd>ESC</kbd> للإغلاق</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 9999;
}

.palette-panel {
  width: 90%;
  max-width: 560px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.palette-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.palette-icon { font-size: 1.25rem; }

.palette-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-size: 1rem;
  font-family: inherit;
}

.palette-input::placeholder { color: #64748b; }

.palette-esc {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.palette-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 0.5rem;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: none;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 0.9rem;
  text-align: start;
  transition: background 0.1s;
}

.palette-item.active {
  background: rgba(99, 102, 241, 0.15);
  color: #fff;
}

.palette-item-icon { font-size: 1.1rem; flex-shrink: 0; }
.palette-item-label { flex: 1; }
.palette-item-desc { font-size: 0.75rem; color: #64748b; }

.palette-empty {
  padding: 2rem;
  text-align: center;
  color: #64748b;
}

.palette-footer {
  display: flex;
  gap: 1rem;
  padding: 0.6rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.7rem;
  color: #64748b;
}

.palette-footer kbd {
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  background: rgba(255, 255, 255, 0.08);
}

.palette-fade-enter-active,
.palette-fade-leave-active { transition: opacity 0.15s ease; }
.palette-fade-enter-from,
.palette-fade-leave-to { opacity: 0; }
</style>
