<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface SimState {
  theta1: number; theta2: number; running: boolean
}

const props = defineProps<{
  params: { length: number; mass: number; springK: number }
  simState: SimState
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

function draw() {
  const canvas = canvasRef.value; if (!canvas) return
  const ctx = canvas.getContext('2d'); if (!ctx) return
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#f8fafc')
  grad.addColorStop(1, '#e2e8f0')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)

  const cy = 50, scale = Math.min(w, h) / 3.5
  const L = Math.min(props.params.length * scale, h * 0.6)
  const cx1 = w / 2 - 60, cx2 = w / 2 + 60

  const px1 = cx1 + Math.sin(props.simState.theta1) * L
  const py1 = cy + Math.cos(props.simState.theta1) * L
  const px2 = cx2 + Math.sin(props.simState.theta2) * L
  const py2 = cy + Math.cos(props.simState.theta2) * L

  // Support bar
  ctx.fillStyle = '#334155'; ctx.fillRect(cx1 - 10, cy - 6, (cx2 - cx1) + 20, 12)
  ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(cx1, cy, 5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(cx2, cy, 5, 0, Math.PI * 2); ctx.fill()

  // Strings
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(cx1, cy); ctx.lineTo(px1, py1); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx2, cy); ctx.lineTo(px2, py2); ctx.stroke()

  // Spring (zigzag between bobs)
  ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2
  ctx.beginPath()
  const springY = (py1 + py2) / 2
  const springSegs = 12
  const springDx = (px2 - px1) / springSegs
  ctx.moveTo(px1, springY)
  for (let i = 1; i < springSegs; i++) {
    const amp = (i % 2 === 0 ? 1 : -1) * 6
    ctx.lineTo(px1 + i * springDx, springY + amp)
  }
  ctx.lineTo(px2, springY); ctx.stroke()

  // Bobs
  const bobR = 8 + Math.min(props.params.mass * 80, 12)
  for (const [px, py] of [[px1, py1], [px2, py2]]) {
    const bg = ctx.createRadialGradient(px - bobR * 0.3, py - bobR * 0.3, bobR * 0.1, px, py, bobR)
    bg.addColorStop(0, '#93c5fd'); bg.addColorStop(0.5, '#3b82f6'); bg.addColorStop(1, '#1d4ed8')
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(px, py, bobR, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(px - bobR * 0.3, py - bobR * 0.3, bobR * 0.25, 0, Math.PI * 2); ctx.fill()
  }

  // Info bar
  ctx.fillStyle = 'rgba(30,41,59,0.9)'; ctx.beginPath(); ctx.roundRect(10, h - 38, w - 20, 28, 6); ctx.fill()
  ctx.fillStyle = '#e2e8f0'; ctx.font = '12px monospace'; ctx.textAlign = 'center'
  ctx.fillText(`L=${props.params.length.toFixed(2)}m | k=${props.params.springK.toFixed(1)}N/m | θ₁=${(props.simState.theta1*180/Math.PI).toFixed(1)}° | θ₂=${(props.simState.theta2*180/Math.PI).toFixed(1)}°`, w / 2, h - 18)
}

function resizeCanvas() {
  const canvas = canvasRef.value, wrap = wrapRef.value
  if (!canvas || !wrap) return
  const rect = wrap.getBoundingClientRect()
  canvas.width = rect.width; canvas.height = Math.max(rect.height, 300)
}

watch(() => [props.simState.theta1, props.simState.theta2], draw, { flush: 'post' })

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  if (wrapRef.value) { resizeObs = new ResizeObserver(() => { resizeCanvas(); draw() }); resizeObs.observe(wrapRef.value) }
  resizeCanvas(); draw()
})
onUnmounted(() => { if (resizeObs) resizeObs.disconnect() })

defineExpose({ draw })
</script>

<template>
  <div ref="wrapRef" class="canvas-wrap">
    <canvas ref="canvasRef" width="700" height="420" />
  </div>
</template>

<style scoped>
.canvas-wrap { flex:1; min-height:0; width:100%; display:flex; flex-direction:column; position:relative; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,.3); border:1px solid rgba(71,85,105,0.3); }
.canvas-wrap canvas { display:block; width:100%; flex:1; min-height:0; }
</style>
