<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { toRad, calculateInclinedSummary, calculateDragForce } from '../../../composables/inclined/inclinedUtils'

const props = defineProps<{
  params: { thetaDeg: number; length: number; mass: number; g: number; mu: number; airResistance: boolean; bodyTypeId: string; cd: number; area: number }
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

function drawArrow(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label: string) {
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 2
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke()
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const headLen = 8
  c.beginPath(); c.moveTo(x2, y2)
  c.lineTo(x2 - headLen * Math.cos(angle - 0.3), y2 - headLen * Math.sin(angle - 0.3))
  c.lineTo(x2 - headLen * Math.cos(angle + 0.3), y2 - headLen * Math.sin(angle + 0.3))
  c.closePath(); c.fill()
  if (label) {
    c.font = 'bold 11px Segoe UI'; c.textAlign = 'center'
    c.fillText(label, x2 + 14 * Math.cos(angle), y2 + 14 * Math.sin(angle))
    c.textAlign = 'start'
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  resizeCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const c = ctx
  const W = canvas.width, H = canvas.height
  c.clearRect(0, 0, W, H)
  c.fillStyle = '#0d1117'
  c.fillRect(0, 0, W, H)

  const margin = 40
  const barH = 110
  const thetaRad = toRad(props.params.thetaDeg)
  const sin = Math.sin(thetaRad)
  const cos = Math.cos(thetaRad)

  // Visual length capped at 10m so drawing never gets too small
  const visualLength = Math.min(props.params.length, 10)
  const rampBase = visualLength * cos
  const rampHeight = visualLength * sin
  const availW = W - 2 * margin
  const availH = H - barH - 2 * margin
  const scaleX = availW / (rampBase + 1)
  const scaleY = availH / (rampHeight + 1)
  const scale = Math.min(scaleX, scaleY)

  // Origin (bottom-left of ramp base)
  const originX = margin + (availW - rampBase * scale) / 2
  const originY = H - margin - (availH - rampHeight * scale) / 2

  // Ramp top
  const topX = originX + rampBase * scale
  const topY = originY - rampHeight * scale

  // Draw ramp (thick line)
  c.strokeStyle = '#5B8DB8'; c.lineWidth = 6
  c.beginPath(); c.moveTo(originX, originY); c.lineTo(topX, topY); c.stroke()

  // Draw ground
  c.strokeStyle = '#2D3645'; c.lineWidth = 2
  c.beginPath(); c.moveTo(originX - 20, originY); c.lineTo(originX + rampBase * scale + 20, originY); c.stroke()

  // Block position (distance s from top)
  const blockDistFromTop = props.simState.s
  const ratio = Math.min(1, blockDistFromTop / props.params.length)
  const blockX = topX - (topX - originX) * ratio
  const blockY = topY + (originY - topY) * ratio

  // Draw body based on type
  const bodyType = props.params.bodyTypeId
  const blockSize = 28
  const blockAngle = thetaRad
  c.save()
  c.translate(blockX, blockY)
  c.rotate(blockAngle)

  if (bodyType === 'sphere') {
    // Sphere (circle)
    c.fillStyle = '#3b82f6'
    c.beginPath(); c.arc(0, -blockSize / 2, blockSize / 2, 0, Math.PI * 2); c.fill()
    c.strokeStyle = '#1d4ed8'; c.lineWidth = 2
    c.beginPath(); c.arc(0, -blockSize / 2, blockSize / 2, 0, Math.PI * 2); c.stroke()
  } else if (bodyType === 'streamlined') {
    // Streamlined (teardrop / ellipse)
    c.fillStyle = '#06b6d4'
    c.beginPath()
    c.ellipse(0, -blockSize / 2, blockSize * 0.7, blockSize * 0.35, 0, 0, Math.PI * 2)
    c.fill()
    c.strokeStyle = '#0891b2'; c.lineWidth = 2
    c.beginPath()
    c.ellipse(0, -blockSize / 2, blockSize * 0.7, blockSize * 0.35, 0, 0, Math.PI * 2)
    c.stroke()
  } else if (bodyType === 'feather') {
    // Feather (thin elongated shape)
    c.fillStyle = '#a855f7'
    c.beginPath()
    c.moveTo(0, 2)
    c.lineTo(-4, -blockSize)
    c.lineTo(0, -blockSize - 8)
    c.lineTo(4, -blockSize)
    c.closePath()
    c.fill()
    c.strokeStyle = '#7c3aed'; c.lineWidth = 1
    c.beginPath()
    c.moveTo(0, 2); c.lineTo(0, -blockSize - 8); c.stroke()
  } else {
    // Block (default square)
    c.fillStyle = '#22c55e'
    c.fillRect(-blockSize / 2, -blockSize, blockSize, blockSize)
    c.strokeStyle = '#16a34a'; c.lineWidth = 2
    c.strokeRect(-blockSize / 2, -blockSize, blockSize, blockSize)
  }
  c.restore()

  // Draw trail
  if (props.simState.s > 0) {
    c.strokeStyle = 'rgba(91,141,184,0.3)'; c.lineWidth = 2
    c.beginPath(); c.moveTo(topX, topY)
    c.lineTo(blockX, blockY); c.stroke()
  }

  // Force arrows (from block center)
  const summary = calculateInclinedSummary(props.params.thetaDeg, props.params.length, props.params.mass, props.params.g, props.params.mu, props.params.airResistance, props.params.cd, props.params.area)

  // mg (green, vertical down)
  const mgLen = props.params.mass * props.params.g * 1.4
  drawArrow(c, blockX, blockY, blockX, blockY + mgLen, '#22c55e', 'mg')

  // N (blue, perpendicular to plane, up)
  const nLen = summary.normalForce * 1.4
  drawArrow(c, blockX, blockY, blockX + nLen * sin, blockY - nLen * cos, '#3b82f6', 'N')

  // F∥ (red, parallel to plane, down)
  const fpLen = summary.parallelForce * 1.4
  drawArrow(c, blockX, blockY, blockX + fpLen * cos, blockY + fpLen * sin, '#ef4444', 'F∥')

  // f (orange, parallel to plane, up) — only if μ > 0
  if (props.params.mu > 0) {
    const fLen = summary.frictionForce * 1.4
    drawArrow(c, blockX, blockY, blockX - fLen * cos, blockY - fLen * sin, '#f59e0b', 'f')
  }

  // Fd (purple, drag force, opposite to motion along plane)
  if (props.params.airResistance && props.simState.v > 0.01) {
    const fdLen = summary.dragForce * 1.4
    drawArrow(c, blockX, blockY, blockX - fdLen * cos, blockY - fdLen * sin, '#a855f7', 'Fd')
  }

  // Live values overlay (horizontal top bar — full width)
  const pad = 10

  // Background bar
  c.fillStyle = 'rgba(13,17,23,0.92)'
  c.fillRect(0, 0, W, barH)
  c.strokeStyle = '#5B8DB8'; c.lineWidth = 2
  c.beginPath(); c.moveTo(0, barH); c.lineTo(W, barH); c.stroke()

  // Title
  c.fillStyle = '#5B8DB8'; c.font = 'bold 13px Segoe UI'
  c.textAlign = 'center'
  c.fillText('📊 القراءات الحية', W / 2, 20)
  c.textAlign = 'start'

  // Data cells layout: 7 columns across the width
  const cols = 7
  const colW = (W - pad * 2) / cols
  const startY = 32

  function drawCell(idx: number, label: string, val: string, color: string) {
    const x = pad + idx * colW
    // Label
    c.fillStyle = '#8B95A5'; c.font = 'bold 11px Segoe UI'
    c.textAlign = 'center'
    c.fillText(label, x + colW / 2, startY)
    // Value (big)
    c.fillStyle = color; c.font = 'bold 18px Segoe UI'
    c.fillText(val, x + colW / 2, startY + 26)
    c.textAlign = 'start'
  }

  drawCell(0, 't (زمن)', `${props.simState.t.toFixed(2)} s`, '#22c55e')
  drawCell(1, 's (مسافة)', `${props.simState.s.toFixed(2)} m`, '#3b82f6')
  drawCell(2, 'v (سرعة)', `${props.simState.v.toFixed(2)} m/s`, '#f59e0b')
  // Live acceleration: subtract drag force dynamically
  const fdLive = props.params.airResistance ? calculateDragForce(props.simState.v, props.params.cd, props.params.area) : 0
  const aLive = (summary.parallelForce - summary.frictionForce - fdLive) / props.params.mass
  drawCell(3, 'a (تسارع)', `${aLive.toFixed(2)}`, '#ef4444')
  drawCell(4, 'N (تفاعل)', `${summary.normalForce.toFixed(1)} N`, '#06b6d4')
  drawCell(5, 'F∥ (متوازية)', `${summary.parallelForce.toFixed(1)} N`, '#ec4899')
  if (props.params.airResistance) {
    drawCell(6, 'Fd (سحب)', `${summary.dragForce.toFixed(1)} N`, '#a855f7')
  } else if (props.params.mu > 0) {
    drawCell(6, 'f (احتكاك)', `${summary.frictionForce.toFixed(1)} N`, '#f97316')
  } else {
    drawCell(6, 'μ (معامل)', `${props.params.mu.toFixed(2)}`, '#a78bfa')
  }

  // Second row: params
  const startY2 = 72
  function drawCell2(idx: number, label: string, val: string, color: string) {
    const x = pad + idx * colW
    c.fillStyle = '#8B95A5'; c.font = 'bold 11px Segoe UI'
    c.textAlign = 'center'
    c.fillText(label, x + colW / 2, startY2)
    c.fillStyle = color; c.font = 'bold 16px Segoe UI'
    c.fillText(val, x + colW / 2, startY2 + 22)
    c.textAlign = 'start'
  }

  drawCell2(0, 'θ (زاوية المنحدر)', `${props.params.thetaDeg}°`, '#a78bfa')
  drawCell2(1, 'L (طول المنحدر)', `${props.params.length.toFixed(1)} m`, '#a78bfa')
  drawCell2(2, 'm (الكتلة)', `${props.params.mass.toFixed(1)} kg`, '#a78bfa')
  drawCell2(3, 'g (الجاذبية)', `${props.params.g.toFixed(2)} m/s²`, '#a78bfa')
  drawCell2(4, 'μ (الاحتكاك)', `${props.params.mu.toFixed(2)}`, '#a78bfa')

  // Angle label at origin (below the bar)
  c.fillStyle = '#8B95A5'; c.font = '12px Segoe UI'
  c.textAlign = 'start'
  c.fillText(`θ = ${props.params.thetaDeg}°`, originX + 8, originY - 8)
}

watch(() => [props.params, props.simState], draw, { deep: true, flush: 'post' })

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
