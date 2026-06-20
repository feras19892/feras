<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { PendulumParams } from '../../../modules/physics/experiments/pendulum/usePendulumPhysics'

interface SimState { theta: number; omega: number; t: number; running: boolean; paused: boolean }

const props = defineProps<{ params: PendulumParams; simState: SimState; oscillationCount?: number }>()
const emit = defineEmits<{ (e: 'snapshot', dataUrl: string): void }>()

function captureSnapshot() {
  const canvas = canvasRef.value
  if (!canvas) return
  try {
    const dataUrl = canvas.toDataURL('image/png')
    emit('snapshot', dataUrl)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `pendulum_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch { /* ignore */ }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#f8fafc')
  grad.addColorStop(1, '#e2e8f0')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2, cy = 50
  const scale = Math.min(w, h) / 3.2
  const L = Math.min(props.params.length * scale, h * 0.65)
  const px = cx + Math.sin(props.simState.theta) * L
  const py = cy + Math.cos(props.simState.theta) * L

  // Protractor / support
  ctx.fillStyle = '#334155'
  ctx.fillRect(cx - 40, cy - 6, 80, 12)
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.arc(cx, cy, 6, 0, Math.PI * 2)
  ctx.fill()

  // Protractor ticks
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1
  for (let deg = -60; deg <= 60; deg += 10) {
    const rad = (deg * Math.PI / 180) + Math.PI / 2
    const r1 = 35, r2 = deg % 30 === 0 ? 42 : 38
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1)
    ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2)
    ctx.stroke()
  }

  // String
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(px, py)
  ctx.stroke()

  // Bob shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.beginPath()
  ctx.ellipse(px + 3, py + 4, 10, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Bob body (metallic sphere)
  const bobR = 10 + Math.min(props.params.mass * 80, 14)
  const bobGrad = ctx.createRadialGradient(px - bobR * 0.3, py - bobR * 0.3, bobR * 0.1, px, py, bobR)
  bobGrad.addColorStop(0, '#93c5fd')
  bobGrad.addColorStop(0.5, '#3b82f6')
  bobGrad.addColorStop(1, '#1d4ed8')
  ctx.fillStyle = bobGrad
  ctx.beginPath()
  ctx.arc(px, py, bobR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#1e3a8a'
  ctx.lineWidth = 1
  ctx.stroke()

  // Highlight on bob
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.beginPath()
  ctx.arc(px - bobR * 0.3, py - bobR * 0.3, bobR * 0.25, 0, Math.PI * 2)
  ctx.fill()

  // Angle arc
  if (Math.abs(props.simState.theta) > 0.03) {
    ctx.strokeStyle = 'rgba(59,130,246,0.5)'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.arc(cx, cy, 28, Math.PI / 2 - props.simState.theta, Math.PI / 2)
    ctx.stroke()
    ctx.setLineDash([])
    // Angle label
    const midAngle = Math.PI / 2 - props.simState.theta / 2
    const labelR = 40
    ctx.fillStyle = '#3b82f6'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.abs(props.simState.theta * 180 / Math.PI).toFixed(1)}°`, cx + Math.cos(midAngle) * labelR, cy + Math.sin(midAngle) * labelR)
  }

  // Bottom info bar
  ctx.fillStyle = 'rgba(30,41,59,0.9)'
  ctx.beginPath()
  ctx.roundRect(10, h - 38, w - 20, 28, 6)
  ctx.fill()
  ctx.fillStyle = '#e2e8f0'
  ctx.font = '12px monospace'
  ctx.textAlign = 'center'
  const info = `L = ${props.params.length.toFixed(2)} m  |  θ = ${(props.simState.theta * 180 / Math.PI).toFixed(1)}°  |  T = ${props.simState.running ? (2 * Math.PI * Math.sqrt(props.params.length / props.params.g)).toFixed(3) : '--'} s`
  ctx.fillText(info, w / 2, h - 18)
}

function resizeCanvas() {
  const canvas = canvasRef.value, wrap = wrapRef.value
  if (!canvas || !wrap) return
  const rect = wrap.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = Math.max(rect.height, 300)
}

watch(() => [props.params.length, props.params.mass, props.simState.theta, props.simState.t], draw, { flush: 'post' })

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  if (wrapRef.value) { resizeObs = new ResizeObserver(() => { resizeCanvas(); draw() }); resizeObs.observe(wrapRef.value) }
  resizeCanvas(); draw()
})
onUnmounted(() => { if (resizeObs) resizeObs.disconnect() })

defineExpose({ draw, captureSnapshot })
</script>

<template>
  <div ref="wrapRef" class="canvas-wrap">
    <div v-if="simState.running && oscillationCount !== undefined" class="osc-counter">
      <span class="osc-num">{{ oscillationCount }}</span><span class="osc-label">اهتزاز</span>
    </div>
    <button class="snapshot-btn" @click="captureSnapshot()" title="📸 التقاط لقطة">📸</button>
    <canvas ref="canvasRef" width="700" height="420" />
  </div>
</template>

<style scoped>
.canvas-wrap { flex: 1; min-height: 0; width: 100%; display: flex; flex-direction: column; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,.3); border: 1px solid rgba(71,85,105,0.3); }
.canvas-wrap canvas { display: block; width: 100%; flex: 1; min-height: 0; }
.osc-counter { position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(15,23,42,0.85); border: 1px solid rgba(71,85,105,0.5); border-radius: 8px; padding: .35rem .7rem; font-size: .75rem; display: flex; align-items: center; gap: .3rem; color: #e2e8f0; backdrop-filter: blur(8px); box-shadow: 0 2px 8px rgba(0,0,0,.2); }
.osc-num { color: #60a5fa; font-weight: 800; font-size: .95rem; font-family: monospace; }
.snapshot-btn { position: absolute; top: 10px; right: 110px; z-index: 10; background: rgba(15,23,42,0.85); border: 1px solid rgba(71,85,105,0.5); border-radius: 8px; padding: .3rem .5rem; font-size: .78rem; cursor: pointer; transition: all .15s; backdrop-filter: blur(8px); color: #e2e8f0; }
.snapshot-btn:hover { background: rgba(30,41,59,0.95); border-color: #60a5fa; color: #60a5fa; }
</style>
