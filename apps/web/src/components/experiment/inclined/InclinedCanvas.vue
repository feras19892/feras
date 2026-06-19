<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { toRad, calculateInclinedSummary } from '../../../composables/inclined/inclinedUtils'

const props = defineProps<{
  params: { thetaDeg: number; length: number; mass: number; g: number; mu: number }
  simState: { t: number; s: number; v: number; arrived: boolean; running: boolean }
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

function resizeCanvas() {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return
  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label: string) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const headLen = 8
  ctx.beginPath(); ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.3), y2 - headLen * Math.sin(angle - 0.3))
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.3), y2 - headLen * Math.sin(angle + 0.3))
  ctx.closePath(); ctx.fill()
  if (label) {
    ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center'
    ctx.fillText(label, x2 + 14 * Math.cos(angle), y2 + 14 * Math.sin(angle))
    ctx.textAlign = 'start'
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  resizeCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, W, H)

  const margin = 60
  const thetaRad = toRad(props.params.thetaDeg)
  const sin = Math.sin(thetaRad)
  const cos = Math.cos(thetaRad)

  // Scale to fit ramp
  const rampBase = props.params.length * cos
  const rampHeight = props.params.length * sin
  const scaleX = (W - 2 * margin) / (rampBase + 1)
  const scaleY = (H - 2 * margin) / (rampHeight + 1)
  const scale = Math.min(scaleX, scaleY)

  // Origin (bottom-left of ramp base)
  const originX = margin + (W - 2 * margin - rampBase * scale) / 2
  const originY = H - margin - (H - 2 * margin - rampHeight * scale) / 2

  // Ramp top
  const topX = originX + rampBase * scale
  const topY = originY - rampHeight * scale

  // Draw ramp (thick line)
  ctx.strokeStyle = '#5B8DB8'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(originX, originY); ctx.lineTo(topX, topY); ctx.stroke()

  // Draw ground
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(originX - 20, originY); ctx.lineTo(originX + rampBase * scale + 20, originY); ctx.stroke()

  // Block position (distance s from top)
  const blockDistFromTop = props.simState.s
  const ratio = Math.min(1, blockDistFromTop / props.params.length)
  const blockX = topX - (topX - originX) * ratio
  const blockY = topY + (originY - topY) * ratio

  // Draw block
  const blockSize = 16
  const blockAngle = thetaRad
  ctx.save()
  ctx.translate(blockX, blockY)
  ctx.rotate(blockAngle)
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(-blockSize / 2, -blockSize, blockSize, blockSize)
  ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 1
  ctx.strokeRect(-blockSize / 2, -blockSize, blockSize, blockSize)
  ctx.restore()

  // Draw trail
  if (props.simState.s > 0) {
    ctx.strokeStyle = 'rgba(91,141,184,0.3)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(topX, topY)
    ctx.lineTo(blockX, blockY); ctx.stroke()
  }

  // Force arrows (from block center)
  const arrowScale = 1.5
  const summary = calculateInclinedSummary(props.params.thetaDeg, props.params.length, props.params.mass, props.params.g, props.params.mu)

  // mg (green, vertical down)
  const mgLen = props.params.mass * props.params.g * 0.8
  drawArrow(ctx, blockX, blockY, blockX, blockY + mgLen, '#22c55e', 'mg')

  // N (blue, perpendicular to plane, up)
  const nLen = summary.normalForce * 0.8
  drawArrow(ctx, blockX, blockY, blockX + nLen * sin, blockY - nLen * cos, '#3b82f6', 'N')

  // F∥ (red, parallel to plane, down)
  const fpLen = summary.parallelForce * 0.8
  drawArrow(ctx, blockX, blockY, blockX + fpLen * cos, blockY + fpLen * sin, '#ef4444', 'F∥')

  // f (orange, parallel to plane, up) — only if μ > 0
  if (props.params.mu > 0) {
    const fLen = summary.frictionForce * 0.8
    drawArrow(ctx, blockX, blockY, blockX - fLen * cos, blockY - fLen * sin, '#f59e0b', 'f')
  }

  // Live values overlay
  ctx.fillStyle = 'rgba(13,17,23,0.85)'
  ctx.fillRect(8, 8, 200, 90)
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = 1
  ctx.strokeRect(8, 8, 200, 90)
  ctx.fillStyle = '#D1D7E0'; ctx.font = '12px Segoe UI'
  ctx.fillText(`t = ${props.simState.t.toFixed(2)} s`, 16, 28)
  ctx.fillText(`s = ${props.simState.s.toFixed(2)} m`, 16, 46)
  ctx.fillText(`v = ${props.simState.v.toFixed(2)} m/s`, 16, 64)
  ctx.fillText(`a = ${summary.acceleration.toFixed(2)} m/s²`, 16, 82)

  // Angle label
  ctx.fillStyle = '#8B95A5'; ctx.font = '11px Segoe UI'
  ctx.fillText(`θ = ${props.params.thetaDeg}°`, originX + 8, originY - 8)
}

watch(() => [
  props.params.thetaDeg, props.params.length, props.params.mass, props.params.g, props.params.mu,
  props.simState.t, props.simState.s, props.simState.v, props.simState.arrived, props.simState.running,
], draw, { flush: 'post' })

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  if (wrapRef.value) {
    resizeObs = new ResizeObserver(() => { resizeCanvas(); draw() })
    resizeObs.observe(wrapRef.value)
  }
  draw()
})
onUnmounted(() => { if (resizeObs) resizeObs.disconnect() })

defineExpose({ draw })
</script>

<template>
  <div class="canvas-wrap" ref="wrapRef">
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.canvas-wrap { width: 100%; flex: 1; min-height: 0; position: relative; }
.canvas-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
</style>
