<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  I: number
  N: number
  a: number
  b: number
  bField: number
  theta: number
  running: boolean
  paused: boolean
}>()

const emit = defineEmits<{
  (e: 'probe-placed', theta: number, tau: number): void
}>()

// Polyfill for roundRect
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2
    if (h < 2 * r) r = h / 2
    this.beginPath()
    this.moveTo(x + r, y)
    this.arcTo(x + w, y, x + w, y + h, r)
    this.arcTo(x + w, y + h, x, y + h, r)
    this.arcTo(x, y + h, x, y, r)
    this.arcTo(x, y, x + w, y, r)
    this.closePath()
    return this
  }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let rafId = 0
let watchdogId = 0
let resizeObserver: ResizeObserver | null = null
let _phase = 0
let zoom = 1
let panX = 0
let panY = 0
let isPanning = false
let panStart = { x: 0, y: 0 }

// Smooth interpolated values
let targetI = 2.0, currentI = 2.0
let targetN = 50, currentN = 50
let targetA_dim = 0.10, currentA_dim = 0.10
let targetB_dim = 0.08, currentB_dim = 0.08
let targetB = 0.1, currentB_val = 0.1
let targetTheta = 90, currentTheta = 90

// Animation: coil rotation angle (oscillates around equilibrium)
let coilAngle = 0
let coilAngVel = 0

// Probe state
type ProbeState = 'idle' | 'dragging' | 'placed'
let probeState: ProbeState = 'idle'
let probePos = { x: 0, y: 0 }
let probeIconPos = { x: 0, y: 0 }
let probeMeasured = { theta: 0, tau: 0 }

function getCanvasPos(e: MouseEvent): { x: number; y: number } {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function screenToWorld(sx: number, sy: number): { x: number; y: number } {
  const canvas = canvasRef.value!
  const w = canvas.width
  const h = canvas.height
  const tx = (sx - w / 2 - panX) / zoom + w / 2
  const ty = (sy - h / 2 - panY) / zoom + h / 2
  return { x: tx, y: ty }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom = Math.max(0.3, Math.min(5, zoom * delta))
  draw()
}

function onMouseDown(e: MouseEvent) {
  const pos = getCanvasPos(e)

  if (probeState === 'idle') {
    const dx = pos.x - probeIconPos.x
    const dy = pos.y - probeIconPos.y
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
      probeState = 'dragging'
      probePos = screenToWorld(pos.x, pos.y)
      draw()
      return
    }
  }

  if (probeState === 'placed') {
    const canvas = canvasRef.value!
    const sx = (probePos.x - canvas.width / 2) * zoom + canvas.width / 2 + panX
    const sy = (probePos.y - canvas.height / 2) * zoom + canvas.height / 2 + panY
    const dx = pos.x - sx
    const dy = pos.y - sy
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
      probeState = 'dragging'
      draw()
      return
    }
  }

  isPanning = true
  panStart = { x: e.clientX - panX, y: e.clientY - panY }
}

function onMouseMove(e: MouseEvent) {
  if (probeState === 'dragging') {
    const pos = getCanvasPos(e)
    probePos = screenToWorld(pos.x, pos.y)
    draw()
    return
  }
  if (!isPanning) return
  panX = e.clientX - panStart.x
  panY = e.clientY - panStart.y
  draw()
}

function onMouseUp() {
  if (probeState === 'dragging') {
    probeState = 'placed'
    // Measure angle from probe position relative to coil center
    const canvas = canvasRef.value!
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const dx = probePos.x - cx
    const dy = probePos.y - cy
    // Angle from vertical (B field direction = up)
    const angleRad = Math.atan2(dx, -dy)
    let angleDeg = angleRad * 180 / Math.PI
    if (angleDeg < 0) angleDeg += 360
    if (angleDeg > 180) angleDeg = 360 - angleDeg
    // Clamp to 0–180
    angleDeg = Math.min(180, Math.max(0, angleDeg))
    // Compute torque at this angle
    const A_val = currentA_dim * currentB_dim
    const mu_val = currentN * currentI * A_val
    const tau_val = mu_val * currentB_val * Math.sin(angleDeg * Math.PI / 180)
    probeMeasured = { theta: angleDeg, tau: tau_val }
    emit('probe-placed', angleDeg, tau_val)
    draw()
  }
  isPanning = false
}

function onDoubleClick() {
  zoom = 1
  panX = 0
  panY = 0
  draw()
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, size = 8) {
  ctx.fillStyle = color
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(size, 0)
  ctx.lineTo(-size * 0.6, -size * 0.5)
  ctx.lineTo(-size * 0.3, 0)
  ctx.lineTo(-size * 0.6, size * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function computePhysics() {
  const A_val = currentA_dim * currentB_dim
  const mu_val = currentN * currentI * A_val
  const thetaRad = currentTheta * Math.PI / 180
  const tau_val = mu_val * currentB_val * Math.sin(thetaRad)
  return { A_val, mu_val, tau_val }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (canvas.width === 0 || canvas.height === 0) return

  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2

  const { mu_val, tau_val } = computePhysics()

  // Layout
  const scale = Math.min(w, h) / 600
  const coilW = Math.max(20, currentA_dim * 800 * scale)
  const coilH = Math.max(20, currentB_dim * 800 * scale)

  // Background
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  // ── Layer 1: Magnetic field lines (vertical, pointing up) ──
  if (currentB_val > 0.001) {
    const fieldAlpha = Math.min(0.5, currentB_val * 3)
    const numLines = 7
    const fieldSpacing = Math.min(w, h) * 0.12
    ctx.strokeStyle = `rgba(59,130,246,${fieldAlpha * 0.3})`
    ctx.lineWidth = 1
    for (let i = -Math.floor(numLines / 2); i <= Math.floor(numLines / 2); i++) {
      const x = cx + i * fieldSpacing
      ctx.beginPath()
      ctx.moveTo(x, h * 0.1)
      ctx.lineTo(x, h * 0.9)
      ctx.stroke()

      // Arrow heads pointing up
      ctx.fillStyle = `rgba(59,130,246,${fieldAlpha})`
      for (let y = h * 0.15; y < h * 0.9; y += 60) {
        drawArrow(ctx, x, y, -Math.PI / 2, `rgba(59,130,246,${fieldAlpha})`, 5)
      }
    }

    // B field label
    ctx.fillStyle = '#3b82f6'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`B = ${currentB_val.toFixed(3)} T →`, cx + fieldSpacing * 3.5, h * 0.12)
  }

  // ── Layer 2: Rotation axis (dashed vertical line) ──
  ctx.strokeStyle = 'rgba(100,116,139,0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(cx, cy - h * 0.35)
  ctx.lineTo(cx, cy + h * 0.35)
  ctx.stroke()
  ctx.setLineDash([])

  // Axis label
  ctx.fillStyle = '#64748b'
  ctx.font = '9px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(t('experiments.emCanvasRotationAxis'), cx, cy - h * 0.36)

  // ── Layer 3: The coil (rectangular, rotated by theta) ──
  // The coil rotates around the vertical axis
  // We show it in perspective: width foreshortened by cos(theta)
  const thetaRad = currentTheta * Math.PI / 180
  const displayAngle = props.running && !props.paused ? coilAngle : thetaRad

  const perspW = Math.abs(coilW * Math.cos(displayAngle))
  const halfW = perspW / 2
  const halfH = coilH / 2

  // Determine which side is "front" (facing viewer)
  const cosA = Math.cos(displayAngle)
  const _frontIsPositive = cosA >= 0

  // Coil frame — 3D perspective look
  const coilCenterX = cx
  const coilCenterY = cy

  // Back side of coil (dimmer)
  const backOffset = coilW * Math.sin(displayAngle) * 0.15
  ctx.strokeStyle = 'rgba(200,137,90,0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(coilCenterX - halfW + backOffset, coilCenterY - halfH)
  ctx.lineTo(coilCenterX + halfW + backOffset, coilCenterY - halfH)
  ctx.lineTo(coilCenterX + halfW + backOffset, coilCenterY + halfH)
  ctx.lineTo(coilCenterX - halfW + backOffset, coilCenterY + halfH)
  ctx.closePath()
  ctx.stroke()

  // Multi-turn winding lines
  const numTurnsVis = Math.min(Math.max(3, Math.round(currentN / 8)), 15)
  for (let n = 0; n < numTurnsVis; n++) {
    const t = n / Math.max(1, numTurnsVis - 1)
    const offsetY = (t - 0.5) * coilH * 0.9
    const alpha = 0.15 + t * 0.15
    ctx.strokeStyle = `rgba(200,137,90,${alpha})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(coilCenterX - halfW, coilCenterY + offsetY)
    ctx.lineTo(coilCenterX + halfW, coilCenterY + offsetY)
    ctx.stroke()
  }

  // Front side of coil (bright copper)
  const grad = ctx.createLinearGradient(coilCenterX - halfW, 0, coilCenterX + halfW, 0)
  grad.addColorStop(0, '#8B5E3C')
  grad.addColorStop(0.5, '#D49A6E')
  grad.addColorStop(1, '#8B5E3C')
  ctx.strokeStyle = grad
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(coilCenterX - halfW, coilCenterY - halfH)
  ctx.lineTo(coilCenterX + halfW, coilCenterY - halfH)
  ctx.lineTo(coilCenterX + halfW, coilCenterY + halfH)
  ctx.lineTo(coilCenterX - halfW, coilCenterY + halfH)
  ctx.closePath()
  ctx.stroke()

  // Current direction indicators on coil
  if (Math.abs(currentI) > 0.01 && props.running) {
    const arrowDir = currentI >= 0 ? 1 : -1
    // Top edge arrow
    drawArrow(ctx, coilCenterX, coilCenterY - halfH, arrowDir > 0 ? 0 : Math.PI, '#22c55e', 6)
    // Bottom edge arrow
    drawArrow(ctx, coilCenterX, coilCenterY + halfH, arrowDir > 0 ? Math.PI : 0, '#22c55e', 6)
  }

  // ── Layer 4: Normal vector (μ) ──
  const normalLen = coilH * 0.6
  const nx = coilCenterX + normalLen * Math.sin(displayAngle)
  const ny = coilCenterY - normalLen * Math.cos(displayAngle)
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(coilCenterX, coilCenterY)
  ctx.lineTo(nx, ny)
  ctx.stroke()
  drawArrow(ctx, nx, ny, Math.atan2(ny - coilCenterY, nx - coilCenterX), '#f59e0b', 8)

  // μ label
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('μ', nx + 10, ny - 5)

  // ── Layer 5: Torque vector (curved arrow) ──
  if (Math.abs(tau_val) > 1e-10) {
    const torqueRadius = 35
    const torqueDir = tau_val > 0 ? 1 : -1
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(coilCenterX, coilCenterY, torqueRadius, -Math.PI / 2, -Math.PI / 2 + torqueDir * Math.PI * 0.6, torqueDir < 0)
    ctx.stroke()

    // Arrow head at end of arc
    const endAngle = -Math.PI / 2 + torqueDir * Math.PI * 0.6
    const ex = coilCenterX + torqueRadius * Math.cos(endAngle)
    const ey = coilCenterY + torqueRadius * Math.sin(endAngle)
    drawArrow(ctx, ex, ey, endAngle + torqueDir * Math.PI / 2, '#ef4444', 7)

    // τ label
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('τ', coilCenterX + torqueDir * 45, coilCenterY + 5)
  }

  // ── Layer 6: Angle arc indicator ──
  if (Math.abs(currentTheta) > 1) {
    const arcR = 50
    ctx.strokeStyle = 'rgba(168,85,247,0.5)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.arc(coilCenterX, coilCenterY, arcR, -Math.PI / 2, -Math.PI / 2 + displayAngle, displayAngle < 0)
    ctx.stroke()
    ctx.setLineDash([])

    // θ label
    const labelAngle = -Math.PI / 2 + displayAngle * 0.5
    const lx = coilCenterX + (arcR + 12) * Math.cos(labelAngle)
    const ly = coilCenterY + (arcR + 12) * Math.sin(labelAngle)
    ctx.fillStyle = '#a855f7'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`θ=${currentTheta.toFixed(0)}°`, lx, ly)
  }

  // ── Layer 7: Labels ──
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`I = ${currentI.toFixed(2)} A`, 15, 25)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, 15, 42)
  ctx.fillStyle = '#3b82f6'
  ctx.fillText(`B = ${currentB_val.toFixed(3)} T`, 15, 59)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(`A = ${(currentA_dim * 100).toFixed(1)}×${(currentB_dim * 100).toFixed(1)} cm`, 15, 76)
  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`μ = ${mu_val.toExponential(2)} A·m²`, 15, 93)
  ctx.fillStyle = '#ef4444'
  ctx.fillText(`τ = ${tau_val.toExponential(2)} N·m`, 15, 110)

  // Status indicator
  ctx.textAlign = 'right'
  if (props.running && !props.paused) {
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(t('experiments.emSimActive'), w - 15, 25)
  } else {
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(t('experiments.emSimStopped'), w - 15, 25)
  }

  ctx.restore()

  // ── Layer 8: Probe (screen space) ──
  probeIconPos = { x: w - 50, y: 50 }

  if (probeState === 'idle') {
    ctx.fillStyle = 'rgba(168,85,247,.15)'
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.roundRect(probeIconPos.x - 22, probeIconPos.y - 22, 44, 44, 8)
    ctx.fill()
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#a855f7'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📐', probeIconPos.x, probeIconPos.y + 7)
    ctx.font = '8px sans-serif'
    ctx.fillText(t('experiments.emCanvasAngleMeasure'), probeIconPos.x, probeIconPos.y + 35)
    ctx.fillStyle = '#64748b'
    ctx.font = '7px sans-serif'
    ctx.fillText(t('experiments.emProbeDragHint'), probeIconPos.x, probeIconPos.y + 45)
  }

  if (probeState === 'dragging' || probeState === 'placed') {
    const sx = (probePos.x - w / 2) * zoom + w / 2 + panX
    const sy = (probePos.y - h / 2) * zoom + h / 2 + panY

    ctx.fillStyle = '#1E2530'
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(sx - 16, sy - 16, 32, 32, 6)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#a855f7'
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📐', sx, sy + 6)

    if (probeState === 'placed') {
      ctx.fillStyle = 'rgba(168,85,247,.1)'
      ctx.strokeStyle = 'rgba(168,85,247,.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(sx + 20, sy - 20, 150, 40, 6)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`θ = ${probeMeasured.theta.toFixed(1)}°`, sx + 26, sy - 4)
      ctx.fillText(`τ = ${probeMeasured.tau.toExponential(2)} N·m`, sx + 26, sy + 10)
      ctx.fillStyle = '#64748b'
      ctx.font = '7px sans-serif'
      ctx.fillText(t('experiments.emCanvasStableRecord'), sx + 26, sy + 22)
    }
  }

  // Zoom indicator
  ctx.fillStyle = '#64748b'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🔍 ${zoom.toFixed(1)}x  |  ${t('experiments.emZoomHint')}`, 10, h - 8)
}

function loop() {
  try {
    if (props.running && !props.paused) {
      _phase += 0.02

      // Physics-based oscillation: coil swings under torque
      // Simple pendulum: I_rot * α = -τ, where τ = μB sin(θ)
      const A_val = currentA_dim * currentB_dim
      const mu_val = currentN * currentI * A_val
      const thetaRad = coilAngle
      const tau_val = mu_val * currentB_val * Math.sin(thetaRad)
      // Moment of inertia (simplified): I_rot ~ N*m*(a²+b²)/12
      const I_rot = Math.max(currentN * 0.01 * (currentA_dim ** 2 + currentB_dim ** 2) / 12, 1e-8)
      const alpha = -tau_val / I_rot
      // Clamp alpha to prevent explosion
      const clampedAlpha = Math.max(-100, Math.min(100, alpha))
      coilAngVel += clampedAlpha * 0.016  // dt ~ 16ms
      coilAngVel *= 0.995  // damping
      // Clamp velocity
      coilAngVel = Math.max(-10, Math.min(10, coilAngVel))
      coilAngle += coilAngVel * 0.016

      // Safety: if angle becomes NaN/Infinity, reset
      if (!isFinite(coilAngle)) { coilAngle = 0; coilAngVel = 0 }

      // Keep angle in reasonable range
      if (coilAngle > Math.PI) coilAngle -= Math.PI
      if (coilAngle < 0) coilAngle += Math.PI
    }

    // Smooth parameter transitions
    targetI = props.I
    targetN = props.N
    targetA_dim = props.a
    targetB_dim = props.b
    targetB = props.bField
    targetTheta = props.theta
    currentI += (targetI - currentI) * 0.3
    currentN += (targetN - currentN) * 0.3
    currentA_dim += (targetA_dim - currentA_dim) * 0.3
    currentB_dim += (targetB_dim - currentB_dim) * 0.3
    currentB_val += (targetB - currentB_val) * 0.3
    currentTheta += (targetTheta - currentTheta) * 0.3

    // When not running, sync coilAngle to theta
    if (!props.running || props.paused) {
      coilAngle = currentTheta * Math.PI / 180
    }

    draw()
  } catch (e) {
    console.error('loop error:', e)
  }
  rafId = requestAnimationFrame(loop)
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return
  canvas.width = parent.clientWidth
  canvas.height = parent.clientHeight
  draw()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  resize()
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mouseup', onMouseUp)
  canvas.addEventListener('mouseleave', onMouseUp)
  canvas.addEventListener('dblclick', onDoubleClick)
  rafId = requestAnimationFrame(loop)

  const parent = canvas.parentElement
  if (parent) {
    resizeObserver = new ResizeObserver(() => { resize() })
    resizeObserver.observe(parent)
  }

  watchdogId = window.setInterval(() => {
    if (rafId === 0 && canvasRef.value) {
      rafId = requestAnimationFrame(loop)
    }
  }, 2000)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  rafId = 0
  clearInterval(watchdogId)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('wheel', onWheel)
    canvas.removeEventListener('mousedown', onMouseDown)
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('mouseup', onMouseUp)
    canvas.removeEventListener('mouseleave', onMouseUp)
    canvas.removeEventListener('dblclick', onDoubleClick)
  }
})

watch(() => [props.I, props.N, props.a, props.b, props.bField, props.theta], () => {
  // Reset animation when params change
  if (!props.running) {
    coilAngle = props.theta * Math.PI / 180
    coilAngVel = 0
  }
})

watch(() => props.running, (running) => {
  if (running) {
    coilAngle = props.theta * Math.PI / 180
    coilAngVel = 0
  } else {
    coilAngVel = 0
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="torque-canvas" />
</template>

<style scoped>
.torque-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
</style>
