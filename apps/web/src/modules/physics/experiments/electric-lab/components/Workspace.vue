<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { CircuitComponent } from '../types'
import { useWorkspaceCanvas } from '../useWorkspaceCanvas'

const props = defineProps<{
  components: CircuitComponent[]
  running: boolean
  current: number
  voltage: number
  kirchhoffCurrents?: { I1: number; I2: number; I3: number }
  parallelCurrents?: { I1: number; I2: number; Itotal: number }
  isRC?: boolean
  rcReading?: { V: number; I: number; t: number; tau: number; charging: boolean }
  isLamp?: boolean
  lampReading?: { V: number; I: number; P: number; PLight: number; PHeat: number; brightness: number }
  isGalvanometer?: boolean
  galvanometerReading?: { emf: number; IuA: number; sensitivity: number; turns: number; speed: number }
  isInternalResistance?: boolean
  internalResistanceReading?: { emf: number; Vt: number; I: number; r: number; Vdrop: number }
  isSeries?: boolean
  seriesReading?: { V: number; I: number; Req: number; V1: number; V2: number; V3: number }
  isNonOhmic?: boolean
  nonOhmicReading?: { V: number; I_ohmic: number; I_lamp: number; R_dyn: number }
  isCellsParallel?: boolean
  cellsParallelReading?: { EMF: number; Vt: number; I: number; R: number }
}>()

const emit = defineEmits<{
  (e: 'move', id: number, x: number, y: number): void
  (e: 'select', id: number | null): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const selectedId = ref<number | null>(null)
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)

let isPanning = false
let isDraggingComp = false
let lastMouseX = 0
let lastMouseY = 0
let dragOffsetX = 0
let dragOffsetY = 0

const { screenToWorld, hitTest, draw } = useWorkspaceCanvas(zoom, panX, panY, props)

function resizeCanvas() {
  const c = canvasRef.value; if (!c) return
  const parent = c.parentElement; if (!parent) return
  c.width = parent.clientWidth
  c.height = parent.clientHeight
  redraw()
}

function redraw() {
  if (canvasRef.value) draw(canvasRef.value, selectedId.value)
}

function getMousePos(e: MouseEvent): [number, number] {
  const c = canvasRef.value; if (!c) return [0, 0]
  const rect = c.getBoundingClientRect()
  return [e.clientX - rect.left, e.clientY - rect.top]
}

function onMouseDown(e: MouseEvent) {
  const [sx, sy] = getMousePos(e)
  const hit = hitTest(sx, sy)
  if (hit) {
    isDraggingComp = true
    selectedId.value = hit.id
    emit('select', hit.id)
    const [wx, wy] = screenToWorld(sx, sy)
    dragOffsetX = hit.x - wx
    dragOffsetY = hit.y - wy
  } else {
    isPanning = true
    selectedId.value = null
    emit('select', null)
  }
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  redraw()
}

function onMouseMove(e: MouseEvent) {
  if (isDraggingComp && selectedId.value !== null) {
    const [sx, sy] = getMousePos(e)
    const [wx, wy] = screenToWorld(sx, sy)
    emit('move', selectedId.value, wx + dragOffsetX, wy + dragOffsetY)
  } else if (isPanning) {
    panX.value += e.clientX - lastMouseX
    panY.value += e.clientY - lastMouseY
  }
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  redraw()
}

function onMouseUp() {
  isPanning = false
  isDraggingComp = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const [sx, sy] = getMousePos(e)
  const [wxBefore, wyBefore] = screenToWorld(sx, sy)
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.3, Math.min(3, zoom.value * delta))
  const [wxAfter, wyAfter] = screenToWorld(sx, sy)
  panX.value += (wxAfter - wxBefore) * zoom.value
  panY.value += (wyAfter - wyBefore) * zoom.value
  redraw()
}

watch(() => [props.components, props.running, props.current, props.voltage, props.internalResistanceReading, props.seriesReading, props.nonOhmicReading], redraw, { deep: true })

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div class="workspace" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp" @wheel.prevent="onWheel">
    <canvas ref="canvasRef" class="ws-canvas"></canvas>
  </div>
</template>

<style scoped>
.workspace {
  flex: 1;
  display: flex;
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.75rem;
  overflow: hidden;
  min-height: 400px;
  cursor: grab;
  user-select: none;
}
.workspace:active {
  cursor: grabbing;
}
.ws-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
