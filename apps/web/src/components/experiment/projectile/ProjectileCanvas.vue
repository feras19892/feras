<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
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
  landingSpeed: number
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
const { toScreen } = useProjectileGrid(props.params)
const draggingTarget = ref(false)
const dragStart = ref({ mx: 0, my: 0, tx: 0, ty: 0, scale: 1 })
const showTargetInput = ref(false)
const targetInputValue = ref('')
const targetInputRef = ref<HTMLInputElement | null>(null)
const targetInputPos = ref({ left: '0px', top: '0px' })

function captureSnapshot() {
  const canvas = canvasRef.value
  if (!canvas) return
  try {
    const dataUrl = canvas.toDataURL('image/png')
    emit('snapshot', dataUrl)
    // Auto-download the image
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `projectile_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch { /* ignore */ }
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
  if (props.simState.running) return
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
    dragStart.value = {
      mx: pos.x, my: pos.y,
      tx: props.params.targetX, ty: props.params.targetY,
      scale: ts.scale
    }
    e.preventDefault()
  }
}

function onMouseMove(e: MouseEvent) {
  if (!draggingTarget.value) return
  const pos = getCanvasPos(e)
  const worldDx = (pos.x - dragStart.value.mx) / dragStart.value.scale
  const worldDy = (pos.y - dragStart.value.my) / dragStart.value.scale
  emit('update:targetX', Math.max(0, dragStart.value.tx + worldDx))
  emit('update:targetY', Math.max(0, dragStart.value.ty - worldDy))
}

function onMouseUp() {
  draggingTarget.value = false
}

function onDblClick(e: MouseEvent) {
  if (!props.params.targetMode || !props.params.targetVisible || props.simState.running) return
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
    targetInputValue.value = props.params.targetX.toFixed(1)
    showTargetInput.value = true
    targetInputPos.value = { left: (tx - 35) + 'px', top: (ty - 50) + 'px' }
    nextTick(() => {
      const el = targetInputRef.value
      if (el) { el.focus(); el.select() }
    })
    e.preventDefault()
  }
}

function onTargetInputSubmit() {
  const val = parseFloat(targetInputValue.value)
  if (!isNaN(val) && val >= 0) {
    emit('update:targetX', val)
  }
  showTargetInput.value = false
}

watch(() => [
  props.params.v0, props.params.angleDeg, props.params.g, props.params.dragCoeff, props.params.targetMode, props.params.targetVisible, props.params.targetX, props.params.targetY, props.params.targetRadius,
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
    <input v-if="showTargetInput" ref="targetInputRef" v-model="targetInputValue" @keyup.enter="onTargetInputSubmit" @blur="onTargetInputSubmit" class="target-input" :style="{ left: targetInputPos.left, top: targetInputPos.top }" />
    <canvas ref="canvasRef" width="700" height="420" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp" @dblclick="onDblClick" :style="{ cursor: draggingTarget ? 'grabbing' : params.targetMode ? 'grab' : 'default' }" />
  </div>
</template>

<style scoped>
.canvas-wrap { flex: 1; min-height: 0; width: 100%; display: flex; flex-direction: column; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,.3); border: 1px solid rgba(71,85,105,0.3); }
.canvas-wrap canvas { display: block; width: 100%; flex: 1; min-height: 0; }
.snapshot-btn { position: absolute; top: 10px; left: 10px; z-index: 10; background: rgba(15,23,42,0.85); border: 1px solid rgba(71,85,105,0.5); border-radius: 8px; padding: .3rem .5rem; font-size: .85rem; color: #e2e8f0; cursor: pointer; backdrop-filter: blur(8px); transition: background .2s; }
.snapshot-btn:hover { background: rgba(30,41,59,0.95); }
.target-input { position: absolute; z-index: 30; width: 70px; padding: .2rem .4rem; border-radius: 6px; border: 1px solid #5B8DB8; background: rgba(15,23,42,0.95); color: #e2e8f0; font-size: .8rem; text-align: center; outline: none; }
</style>
