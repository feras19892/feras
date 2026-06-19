<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useProjectileDraw } from '../../../composables/projectile/useProjectileDraw'
import type { ProjectileParams, ProjectilePoint } from '../../../modules/physics/experiments/projectile/useProjectilePhysics'

interface SimState {
  x: number; y: number; vx: number; vy: number; t: number
  running: boolean; paused: boolean; landed: boolean
  trail: ProjectilePoint[]
}

const props = defineProps<{
  params: ProjectileParams
  simState: SimState
}>()

const emit = defineEmits<{
  (e: 'snapshot', dataUrl: string): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)
const { draw } = useProjectileDraw(canvasRef, props.params, props.simState)

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

watch(() => [
  props.params.v0, props.params.angleDeg, props.params.g,
  props.simState.x, props.simState.y, props.simState.vx, props.simState.vy, props.simState.t, props.simState.landed,
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
    <canvas ref="canvasRef" width="700" height="420" />
  </div>
</template>

<style scoped>
.canvas-wrap { flex: 1; min-height: 0; width: 100%; display: flex; flex-direction: column; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,.3); border: 1px solid rgba(71,85,105,0.3); }
.canvas-wrap canvas { display: block; width: 100%; flex: 1; min-height: 0; }
.snapshot-btn { position: absolute; top: 10px; left: 10px; z-index: 10; background: rgba(15,23,42,0.85); border: 1px solid rgba(71,85,105,0.5); border-radius: 8px; padding: .3rem .5rem; font-size: .85rem; color: #e2e8f0; cursor: pointer; backdrop-filter: blur(8px); transition: background .2s; }
.snapshot-btn:hover { background: rgba(30,41,59,0.95); }
</style>
