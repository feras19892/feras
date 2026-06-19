<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useSpringDraw } from '../../../composables/spring/useSpringDraw'
import type { SpringParams } from '../../../modules/physics/experiments/spring/useSpringPhysics'

interface SimState {
  x: number; v: number; t: number; running: boolean; paused: boolean;
}

const props = defineProps<{
  params: SpringParams
  simState: SimState
  oscillationCount?: number
}>()

const emit = defineEmits<{
  (e: 'toggle-mass'): void
  (e: 'pull-down'): void
  (e: 'push-up'): void
  (e: 'snapshot', dataUrl: string): void
}>()

function captureSnapshot() {
  const canvas = canvasRef.value
  if (!canvas) return
  try {
    const dataUrl = canvas.toDataURL('image/png')
    emit('snapshot', dataUrl)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `spring_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch { /* ignore */ }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

const { draw, resizeCanvas } = useSpringDraw(canvasRef, props.params, props.simState)

watch(() => [
  props.params.mass, props.params.k, props.params.amplitude, props.params.damping,
  props.simState.x, props.simState.v, props.simState.t
], draw, { flush: 'post' })

let resizeObs: ResizeObserver | null = null
let pullInterval: ReturnType<typeof setInterval> | null = null
let pushInterval: ReturnType<typeof setInterval> | null = null
const REPEAT_DELAY = 100  // ms between repeats

function startPull() {
  emit('pull-down')
  pullInterval = setInterval(() => emit('pull-down'), REPEAT_DELAY)
}
function stopPull() {
  if (pullInterval) { clearInterval(pullInterval); pullInterval = null }
}
function startPush() {
  emit('push-up')
  pushInterval = setInterval(() => emit('push-up'), REPEAT_DELAY)
}
function stopPush() {
  if (pushInterval) { clearInterval(pushInterval); pushInterval = null }
}

onMounted(() => {
  if (wrapRef.value) {
    resizeObs = new ResizeObserver(() => { resizeCanvas(); draw() })
    resizeObs.observe(wrapRef.value)
  }
  draw()
})
onUnmounted(() => {
  if (resizeObs) resizeObs.disconnect()
  stopPull()
  stopPush()
})

defineExpose({ draw, captureSnapshot })
</script>

<template>
  <div ref="wrapRef" class="canvas-wrap">
    <button class="mass-toggle-btn" @click="emit('toggle-mass')">
      {{ params.mass > 0 ? '🏗️ إزالة الثقل' : '➕ إعادة الثقل' }}
    </button>
    <div class="spring-ctrls"
      @mousedown.prevent
      @touchstart.prevent
    >
      <button class="spring-btn pull"
        @mousedown="startPull"
        @mouseup="stopPull"
        @mouseleave="stopPull"
        @touchstart="startPull"
        @touchend="stopPull"
        title="سحب لأسفل"
      >⬇️ سحب</button>
      <button class="spring-btn push"
        @mousedown="startPush"
        @mouseup="stopPush"
        @mouseleave="stopPush"
        @touchstart="startPush"
        @touchend="stopPush"
        title="ضغط لأعلى"
      >⬆️ ضغط</button>
    </div>
    <div v-if="simState.running && oscillationCount !== undefined" class="osc-counter">
      <span class="osc-num">{{ oscillationCount }}</span>
      <span class="osc-label">اهتزاز</span>
    </div>
    <button class="snapshot-btn" @click="captureSnapshot()" title="📸 التقاط لقطة">📸</button>
    <canvas ref="canvasRef" width="700" height="420" />
  </div>
</template>

<style scoped>
.canvas-wrap { flex: 1; min-height: 0; width: 100%; display: flex; flex-direction: column; position: relative; }
.canvas-wrap canvas { display: block; width: 100%; flex: 1; min-height: 0; border-radius: 8px; background: linear-gradient(180deg, #fffef7, #fff8ea); border: 1px solid #2D3645; }
.mass-toggle-btn { position: absolute; top: 8px; left: 8px; z-index: 10; background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 6px; padding: .3rem .6rem; font-size: .72rem; cursor: pointer; transition: all .15s; }
.mass-toggle-btn:hover { background: #252D3A; border-color: #5B8DB8; color: #5B8DB8; }
.spring-ctrls { position: absolute; bottom: 12px; left: 12px; z-index: 10; display: flex; flex-direction: column; gap: .4rem; }
.spring-btn { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 6px; padding: .4rem .6rem; font-size: .75rem; cursor: pointer; transition: all .15s; font-weight: 600; }
.spring-btn:hover { background: #252D3A; }
.spring-btn.pull:hover { border-color: #22c55e; color: #22c55e; }
.spring-btn.push:hover { border-color: #ef4444; color: #ef4444; }
.osc-counter { position: absolute; top: 8px; right: 8px; z-index: 10; background: #1E2530; border: 1px solid #2D3645; border-radius: 6px; padding: .3rem .6rem; font-size: .72rem; display: flex; align-items: center; gap: .3rem; color: #D1D7E0; }
.osc-num { color: #5B8DB8; font-weight: 700; font-size: .9rem; }
.snapshot-btn { position: absolute; top: 8px; right: 100px; z-index: 10; background: #1E2530; border: 1px solid #2D3645; border-radius: 6px; padding: .25rem .4rem; font-size: .75rem; cursor: pointer; transition: all .15s; }
.snapshot-btn:hover { background: #252D3A; border-color: #5B8DB8; }
</style>
