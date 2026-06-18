<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ inheritAttrs: false })

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
        <button class="pa-btn" draggable="false" @mousedown.stop @click.stop="emit('maximize', props.id)" title="تكبير">&#x26F6;</button>
        <button class="pa-btn" draggable="false" @mousedown.stop @click.stop="emit('hide', props.id)" title="إخفاء">&#x2715;</button>
      </div>
    </div>

    <slot />
  </div>
</template>

<style scoped>
.draggable-panel { background: #1E2530; border-radius: 8px; padding: .6rem; border: 1px solid #2D3645; display: flex; flex-direction: column; transition: box-shadow .2s; }
.draggable-panel.dragging { box-shadow: 0 16px 48px rgba(0,0,0,.6); z-index: 9999; border: 2px dashed #5B8DB8; opacity: .92; }

.chart-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin: 0 0 .3rem; flex-shrink: 0; cursor: grab; }
.card-header:active { cursor: grabbing; }
.card-header h4 { margin: 0; font-size: .82rem; color: #D1D7E0; font-weight: 700; user-select: none; }
.panel-actions { display: flex; gap: .2rem; }
.pa-btn { background: transparent; border: 1px solid #2D3645; color: #8B95A5; border-radius: 4px; cursor: pointer; font-size: .7rem; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; padding: 0; }
.pa-btn:hover { background: rgba(91,141,184,.15); color: #5B8DB8; }
</style>
