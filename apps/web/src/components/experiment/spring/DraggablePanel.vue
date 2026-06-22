<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
import { ref } from 'vue'

defineOptions({ inheritAttrs: false })

const { t } = useI18n()
const props = defineProps<{
  id: string
  title: string
}>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'hide', id: string): void
  (e: 'drop', id: string, x: number, y: number): void
}>()

const dragging = ref(false)
const pos = ref({ x: 0, y: 0 })
const startMouse = ref({ x: 0, y: 0 })
const startPos = ref({ x: 0, y: 0 })

function onHeaderDown(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('.panel-actions')) return
  e.preventDefault()
  dragging.value = true
  startMouse.value = { x: e.clientX, y: e.clientY }
  startPos.value = { ...pos.value }
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', onDrop)
}

function onDrag(e: MouseEvent) {
  if (!dragging.value) return
  e.preventDefault()
  pos.value = {
    x: startPos.value.x + (e.clientX - startMouse.value.x),
    y: startPos.value.y + (e.clientY - startMouse.value.y),
  }
}

function onDrop(e: MouseEvent) {
  dragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', onDrop)
  emit('drop', props.id, e.clientX, e.clientY)
  pos.value = { x: 0, y: 0 }
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="draggable-panel"
    :class="{ dragging: dragging }"
    :data-id="props.id"
    :style="dragging ? { transform: `translate(${pos.x}px, ${pos.y}px)`, zIndex: 9999, opacity: 0.9 } : undefined"
  >
    <div class="card-header" @mousedown="onHeaderDown">
      <h4>{{ props.title }}</h4>
      <div class="panel-actions">
        <button class="pa-btn" draggable="false" @mousedown.stop @click.stop="emit('maximize', props.id)" :title="t('experiments.maximize')">&#x26F6;</button>
        <button class="pa-btn" draggable="false" @mousedown.stop @click.stop="emit('hide', props.id)" :title="t('experiments.hide')">&#x2715;</button>
      </div>
    </div>

    <slot />
  </div>
</template>

<style scoped>
.draggable-panel { background: rgba(30,37,48,0.7); backdrop-filter:blur(12px); border-radius: 10px; padding: .5rem .55rem; border: 1px solid rgba(91,141,184,0.12); display: flex; flex-direction: column; transition: box-shadow .25s, border-color .25s; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.draggable-panel:hover { border-color: rgba(91,141,184,0.22); box-shadow: 0 6px 24px rgba(0,0,0,0.25); }
.draggable-panel.dragging { box-shadow: 0 20px 60px rgba(0,0,0,.5); z-index: 9999; border: 2px dashed #5B8DB8; opacity: .92; }

.chart-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin: 0 0 .25rem; flex-shrink: 0; cursor: grab; padding-bottom:.25rem; border-bottom:1px solid rgba(91,141,184,0.08); }
.card-header:active { cursor: grabbing; }
.card-header h4 { margin: 0; font-size: .78rem; color: #94a3b8; font-weight: 700; user-select: none; letter-spacing:.3px; }
.panel-actions { display: flex; gap: .15rem; }
.pa-btn { background: rgba(45,54,69,0.4); border: 1px solid rgba(91,141,184,0.1); color: #8B95A5; border-radius: 5px; cursor: pointer; font-size: .68rem; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; padding: 0; transition:all .15s; }
.pa-btn:hover { background: rgba(91,141,184,.18); color: #5B8DB8; border-color: rgba(91,141,184,0.25); transform:scale(1.05); }
</style>
