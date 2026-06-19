<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useProjectileDraw } from '../../../composables/projectile/useProjectileDraw'
import { useProjectileGrid } from '../../../composables/projectile/useProjectileGrid'
import ProjectileHintOverlay from './ProjectileHintOverlay.vue'
import type { ProjectileParams, ProjectilePoint } from '../../../modules/physics/experiments/projectile/useProjectilePhysics'

interface SimState {
  x: number; y: number; vx: number; vy: number; t: number
  running: boolean; paused: boolean; landed: boolean
  trail: ProjectilePoint[]
  targetHit: boolean
  distanceToTarget: number | null
  maxHeightReached: number
}

const props = defineProps<{
  params: ProjectileParams
  simState: SimState
}>()

const emit = defineEmits<{
  (e: 'snapshot', dataUrl: string): void
  (e: 'update:targetX', val: number): void
  (e: 'update:targetY', val: number): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)
const { draw } = useProjectileDraw(canvasRef, props.params, props.simState)
const { screenToWorld, toScreen } = useProjectileGrid(props.params)
const draggingTarget = ref(false)

function captureSnapshot() {
  const canvas = canvasRef.value
  if (!canvas) return
  try { emit('snapshot', canvas.toDataURL('image/png')) } catch { /* ignore */ }
}

function resizeCanvas() {
  const canvas = canvasRef.value, wrap = wrapRef.value
  if (!canvas || !wrap) return
  const rect = wrap.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = Math.max(rect.height, 300)
}

function getCanvasPos(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onMouseDown(e: MouseEvent) {
  if (!props.params.targetMode || !props.params.targetVisible) return
  const pos = getCanvasPos(e)
  const w = canvasRef.value?.width ?? 0
  const h = canvasRef.value?.height ?? 0
  const ts = toScreen(w, h, 0, 0)
  const tx = ts.margin + props.params.targetX * ts.scale
  const ty = ts.groundY - props.params.targetY * ts.scale
  const dx = pos.x - tx
  const dy = pos.y - ty
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 40) {
    draggingTarget.value = true
    e.preventDefault()
  }
}

function onMouseMove(e: MouseEvent) {
  if (!draggingTarget.value) return
  const pos = getCanvasPos(e)
  const w = canvasRef.value?.width ?? 0
  const h = canvasRef.value?.height ?? 0
  const world = screenToWorld(w, h, pos.x, pos.y)
  emit('update:targetX', Math.max(0, world.x))
  emit('update:targetY', Math.max(0, world.y))
}

function onMouseUp() {
  draggingTarget.value = false
}

watch(() => [
  props.params.v0, props.params.angleDeg, props.params.g, props.params.targetMode, props.params.targetVisible, props.params.targetX, props.params.targetRadius,
  props.simState.x, props.simState.y, props.simState.vx, props.simState.vy, props.simState.t, props.simState.landed, props.simState.targetHit,
], draw, { flush: 'post' })

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  if (wrapRef.value) {
    resizeObs = new ResizeObserver(() => { resizeCanvas(); draw() })
    resizeObs.observe(wrapRef.value)
  }
  resizeCanvas()
  draw()
})
onUnmounted(() => { if (resizeObs) resizeObs.disconnect() })

defineExpose({ draw, captureSnapshot })
</script>

<template>
  <div ref="wrapRef" class="canvas-wrap">
    <button class="snapshot-btn" @click="captureSnapshot()" title="📸 التقاط لقطة">📸</button>
    <ProjectileHintOverlay :v0="params.v0" :angle-deg="params.angleDeg" :g="params.g" :target-x="params.targetX" :target-mode="params.targetMode" />
    <canvas ref="canvasRef" width="700" height="420" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp" :style="{ cursor: draggingTarget ? 'grabbing' : params.targetMode ? 'grab' : 'default' }" />
  </div>
</template>

<style scoped>
.canvas-wrap { flex: 1; min-height: 0; width: 100%; display: flex; flex-direction: column; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,.3); border: 1px solid rgba(71,85,105,0.3); }
.canvas-wrap canvas { display: block; width: 100%; flex: 1; min-height: 0; }
.snapshot-btn { position: absolute; top: 10px; left: 10px; z-index: 10; background: rgba(15,23,42,0.85); border: 1px solid rgba(71,85,105,0.5); border-radius: 8px; padding: .3rem .5rem; font-size: .85rem; color: #e2e8f0; cursor: pointer; backdrop-filter: blur(8px); transition: background .2s; }
.snapshot-btn:hover { background: rgba(30,41,59,0.95); }
</style>
