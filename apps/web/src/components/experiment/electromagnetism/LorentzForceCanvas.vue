<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  V: number       // accelerating voltage (V)
  I: number       // Helmholtz coil current (A)
  N: number       // turns per coil
  R: number       // coil radius (m)
  running: boolean
  paused: boolean
}>()

const emit = defineEmits<{
  (e: 'probe-placed', r: number): void
}>()

// Physical constants
const MU0 = 4 * Math.PI * 1e-7
const E_CHARGE = 1.602e-19
const E_MASS = 9.109e-31

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
let phase = 0
let zoom = 1
let panX = 0
let panY = 0
let isPanning = false
let panStart = { x: 0, y: 0 }

// Store current tube radius for probe conversion
let currentTubeR = 150
const R_MAX_VIS = 0.5  // max physical radius for visual mapping (m)

// Smooth interpolated values
let targetV = 200
let currentV_val = 200
let targetI = 1.0
let currentI = 1.0
let targetN = 130
let currentN = 130

// Particle simulation state
let particleAngle = 0
let particleTrail: { x: number; y: number }[] = []

type ProbeState = 'idle' | 'dragging' | 'placed'
let probeState: ProbeState = 'idle'
let probePos = { x: 0, y: 0 }
let probeMeasured = { r: 0 }
let probeIconPos = { x: 0, y: 0 }

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
      const world = screenToWorld(pos.x, pos.y)
      probeState = 'dragging'
      probePos = { x: world.x, y: world.y }
      draw()
      return
    }
  }

  if (probeState === 'placed') {
    const sx = (probePos.x - canvasRef.value!.width / 2) * zoom + canvasRef.value!.width / 2 + panX
    const sy = (probePos.y - canvasRef.value!.height / 2) * zoom + canvasRef.value!.height / 2 + panY
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
    const world = screenToWorld(pos.x, pos.y)
    probePos = world
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
    const canvas = canvasRef.value!
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    // Measure radius from beam center to probe position
    const dxPx = probePos.x - cx
    const dyPx = probePos.y - cy
    const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx)
    // Inverse visual mapping: visualR = sqrt(r / R_MAX_VIS) * tubeR * 0.92
    // So: r = (visualR / (tubeR * 0.92))^2 * R_MAX_VIS
    const t = distPx / (currentTubeR * 0.92)
    const Rmeters = Math.min(R_MAX_VIS, Math.max(0, t * t * R_MAX_VIS))
    probeMeasured = { r: Rmeters }
    emit('probe-placed', Rmeters)
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

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, size = 6) {
  ctx.fillStyle = color
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(size, 0)
  ctx.lineTo(-size * 0.6, -size * 0.7)
  ctx.lineTo(-size * 0.6, size * 0.7)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// Compute physics from interpolated values
function computePhysics() {
  // Helmholtz field: B = 8μ₀NI / (5√5 · R)
  const R_safe = Math.max(props.R, 1e-6)
  const B_val = (8 * MU0 * currentN * currentI) / (5 * Math.sqrt(5) * R_safe)
  // Electron velocity: v = √(2eV/m)
  const v_val = Math.sqrt((2 * E_CHARGE * currentV_val) / E_MASS)
  // Orbit radius: r = mv / (eB)
  let r_val = Infinity
  if (B_val > 1e-15) {
    r_val = (E_MASS * v_val) / (E_CHARGE * B_val)
  }
  return { B_val, v_val, r_val }
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

  // Physics from interpolated values
  const { B_val, v_val, r_val } = computePhysics()
  const Fm_val = E_CHARGE * v_val * B_val

  // Layout constants — Fine Beam Tube
  const tubeR = Math.min(w, h) * 0.28   // tube glass radius in px
  currentTubeR = tubeR                    // store for probe conversion
  const coilR_px = tubeR * 1.15          // Helmholtz coil radius in px
  const coilFlatR = coilR_px * 0.28      // coil perspective flatten
  const coilOffset = tubeR * 0.55        // distance between the two coils
  const particleR = 9

  // Visual radius: map physical r to pixels using sqrt scale
  // Typical r range: 0.005m (high B) to 0.5m (low B)
  // Map: r=0→0, r=0.5m→tubeR*0.92, using sqrt for sensitivity
  let visualR: number
  if (!isFinite(r_val) || r_val > R_MAX_VIS) {
    visualR = tubeR * 0.95  // very large — nearly straight, clamped
  } else {
    const t = Math.sqrt(r_val / R_MAX_VIS)
    visualR = Math.max(8, t * tubeR * 0.92)
  }

  // Angular velocity for animation — scale up for visibility
  const omega = B_val > 1e-15 ? Math.min(0.12, Math.max(0.02, Math.abs(E_CHARGE * B_val / E_MASS) * 5e-19)) : 0.03

  // Background — dark lab room
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2 + panX, h / 2 + panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-w / 2, -h / 2)

  // ── Layer 1: Helmholtz coils (perspective, behind tube) ──
  // Left coil
  drawHelmholtzCoil(ctx, cx - coilOffset, cy, coilR_px, coilFlatR, currentN)
  // Right coil
  drawHelmholtzCoil(ctx, cx + coilOffset, cy, coilR_px, coilFlatR, currentN)

  // ── Layer 2: Fine Beam Tube (glass sphere) ──
  // Glass glow
  const tubeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, tubeR)
  tubeGrad.addColorStop(0, 'rgba(20,30,50,0.4)')
  tubeGrad.addColorStop(0.7, 'rgba(15,22,40,0.2)')
  tubeGrad.addColorStop(1, 'rgba(10,18,32,0.6)')
  ctx.fillStyle = tubeGrad
  ctx.beginPath()
  ctx.ellipse(cx, cy, tubeR, tubeR * 0.85, 0, 0, Math.PI * 2)
  ctx.fill()

  // Glass outline
  ctx.strokeStyle = 'rgba(100,150,200,0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(cx, cy, tubeR, tubeR * 0.85, 0, 0, Math.PI * 2)
  ctx.stroke()

  // ── Layer 3: Magnetic field indicators (inside tube) ──
  if (B_val > 1e-15) {
    const fieldColor = currentI >= 0 ? 'rgba(59,130,246,' : 'rgba(239,68,68,'
    const B_vis = Math.min(1, B_val / 0.01) // normalize to ~10 mT
    const dotSpacing = 40 / (0.5 + B_vis * 0.5)
    const dotR = 3

    for (let i = -4; i < 5; i++) {
      for (let j = -4; j < 5; j++) {
        const dx = cx + i * dotSpacing
        const dy = cy + j * dotSpacing
        const distFromCenter = Math.sqrt((dx - cx) ** 2 + (dy - cy) ** 2)
        if (distFromCenter > tubeR * 0.8) continue
        if (distFromCenter < visualR * 0.85 && distFromCenter > 0) continue

        ctx.strokeStyle = fieldColor + '0.25)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(dx, dy, dotR, 0, Math.PI * 2)
        ctx.stroke()
        if (currentI >= 0) {
          ctx.fillStyle = fieldColor + '0.4)'
          ctx.beginPath()
          ctx.arc(dx, dy, 1.2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(dx - dotR * 0.6, dy - dotR * 0.6)
          ctx.lineTo(dx + dotR * 0.6, dy + dotR * 0.6)
          ctx.moveTo(dx + dotR * 0.6, dy - dotR * 0.6)
          ctx.lineTo(dx - dotR * 0.6, dy + dotR * 0.6)
          ctx.stroke()
        }
      }
    }
  }

  // ── Layer 4: Electron beam (only visible when running) ──
  const beamColor = 'rgba(34,197,94,'
  const beamGlow = 'rgba(74,222,128,'
  const beamOn = props.running && !props.paused

  if (beamOn && B_val > 1e-15) {
    // Circular beam path — 3-layer glow
    ctx.strokeStyle = beamColor + '0.12)'
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.arc(cx, cy, visualR, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = beamColor + '0.35)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(cx, cy, visualR, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = beamGlow + '0.9)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, visualR, 0, Math.PI * 2)
    ctx.stroke()

    // Animated electron on the path
    const direction = currentI >= 0 ? 1 : -1
    particleAngle += omega * direction

    const px = cx + visualR * Math.cos(particleAngle)
    const py = cy + visualR * Math.sin(particleAngle)

    // Trail
    particleTrail.push({ x: px, y: py })
    if (particleTrail.length > 100) particleTrail.shift()

    for (let i = 0; i < particleTrail.length - 1; i++) {
      const alpha = (i / particleTrail.length) * 0.8
      ctx.strokeStyle = beamGlow + alpha + ')'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(particleTrail[i].x, particleTrail[i].y)
      ctx.lineTo(particleTrail[i + 1].x, particleTrail[i + 1].y)
      ctx.stroke()
    }

    // Electron particle — large with pulsing glow
    const pulseR = particleR + Math.sin(phase * 3) * 2
    ctx.fillStyle = beamGlow + '0.25)'
    ctx.beginPath()
    ctx.arc(px, py, pulseR * 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = beamGlow + '0.5)'
    ctx.beginPath()
    ctx.arc(px, py, pulseR * 1.8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#aaffaa'
    ctx.beginPath()
    ctx.arc(px, py, pulseR, 0, Math.PI * 2)
    ctx.fill()

    // Radius indicator (dashed line from center to particle)
    ctx.strokeStyle = 'rgba(168,85,247,.5)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(px, py)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(168,85,247,.9)'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'center'
    const midX = (cx + px) / 2
    const midY = (cy + py) / 2
    ctx.fillText('r', midX, midY - 7)

  } else if (beamOn && B_val <= 1e-15) {
    // B = 0: straight beam from gun upward
    const gunTop = cy + tubeR * 0.7
    const beamTop = cy - tubeR * 0.7
    ctx.strokeStyle = beamColor + '0.12)'
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.moveTo(cx, gunTop)
    ctx.lineTo(cx, beamTop)
    ctx.stroke()

    ctx.strokeStyle = beamColor + '0.35)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(cx, gunTop)
    ctx.lineTo(cx, beamTop)
    ctx.stroke()

    ctx.strokeStyle = beamGlow + '0.9)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, gunTop)
    ctx.lineTo(cx, beamTop)
    ctx.stroke()

    // Animated electron moving straight
    particleAngle += 0.04
    const py = gunTop - ((particleAngle * 30) % (gunTop - beamTop))
    const px = cx

    ctx.fillStyle = beamGlow + '0.25)'
    ctx.beginPath()
    ctx.arc(px, py, particleR * 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#aaffaa'
    ctx.beginPath()
    ctx.arc(px, py, particleR, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(t('experiments.emCanvasBeamStraight'), cx, cy - tubeR * 0.5)
  } else {
    // Not running — show faint guide circle/line
    if (B_val > 1e-15) {
      ctx.strokeStyle = 'rgba(34,197,94,0.08)'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.arc(cx, cy, visualR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(t('experiments.emCanvasHeatFilament'), cx, cy - 10)
    ctx.font = '10px sans-serif'
    ctx.fillStyle = '#475569'
    ctx.fillText(t('experiments.emCanvasBeamAppears'), cx, cy + 8)
  }

  // ── Layer 5: Electron gun (at bottom of tube) ──
  const gunW = 24
  const gunH = 30
  const gunX = cx - gunW / 2
  const gunY = cy + tubeR * 0.7
  ctx.fillStyle = '#2D3645'
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(gunX, gunY, gunW, gunH, 4)
  ctx.fill()
  ctx.stroke()
  // Filament glow (red when running)
  if (props.running) {
    ctx.fillStyle = 'rgba(239,68,68,0.6)'
    ctx.beginPath()
    ctx.arc(cx, gunY + 8, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(239,68,68,0.2)'
    ctx.beginPath()
    ctx.arc(cx, gunY + 8, 8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#64748b'
  ctx.font = '8px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(t('experiments.emCanvasGun'), cx, gunY + gunH + 12)

  // ── Layer 6: Labels & readouts ──
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`V = ${currentV_val.toFixed(0)} V`, 15, 25)
  ctx.fillStyle = '#3b82f6'
  ctx.fillText(`I = ${currentI.toFixed(2)} A`, 15, 42)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, 15, 59)

  if (B_val > 1e-15) {
    ctx.fillStyle = '#3b82f6'
    ctx.fillText(`B = ${B_val.toExponential(2)} T`, 15, 76)
    ctx.fillStyle = '#22c55e'
    ctx.fillText(`v = ${v_val.toExponential(2)} m/s`, 15, 93)
    ctx.fillStyle = '#a855f7'
    ctx.fillText(`r = ${r_val.toExponential(2)} m (${(r_val * 100).toFixed(1)} cm)`, 15, 110)
    ctx.fillStyle = '#f59e0b'
    ctx.fillText(`F = ${Fm_val.toExponential(2)} N`, 15, 127)
  } else {
    ctx.fillStyle = '#64748b'
    ctx.fillText(t('experiments.emCanvasNoField'), 15, 76)
    ctx.fillStyle = '#22c55e'
    ctx.fillText(`v = ${v_val.toExponential(2)} m/s`, 15, 93)
    ctx.fillStyle = '#64748b'
    ctx.fillText(t('experiments.emCanvasBeamStraightShort'), 15, 110)
  }

  // Beam status indicator (top-right)
  ctx.textAlign = 'right'
  if (beamOn) {
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(t('experiments.emCanvasBeamActive'), w - 15, 25)
  } else {
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(t('experiments.emCanvasBeamStopped'), w - 15, 25)
  }

  ctx.restore()

  // ── Layer 7: Probe (screen space) ──
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
    ctx.fillText('�', probeIconPos.x, probeIconPos.y + 7)
    ctx.font = '8px sans-serif'
    ctx.fillText(t('experiments.emCanvasRulerMeasure'), probeIconPos.x, probeIconPos.y + 35)
    ctx.fillStyle = '#64748b'
    ctx.font = '7px sans-serif'
    ctx.fillText(t('experiments.emProbeDragHint'), probeIconPos.x, probeIconPos.y + 45)
  }

  if (probeState === 'dragging' || probeState === 'placed') {
    const sx = (probePos.x - w / 2) * zoom + w / 2 + panX
    const sy = (probePos.y - h / 2) * zoom + h / 2 + panY

    // Line from center to probe (radius measurement)
    const centerScreenX = (cx - w / 2) * zoom + w / 2 + panX
    const centerScreenY = (cy - h / 2) * zoom + h / 2 + panY
    ctx.strokeStyle = 'rgba(168,85,247,.4)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(centerScreenX, centerScreenY)
    ctx.lineTo(sx, sy)
    ctx.stroke()
    ctx.setLineDash([])

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
    ctx.fillText('�', sx, sy + 6)

    if (probeState === 'placed') {
      const rVal = probeMeasured.r
      ctx.fillStyle = 'rgba(168,85,247,.1)'
      ctx.strokeStyle = 'rgba(168,85,247,.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(sx + 20, sy - 20, 140, 40, 6)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`r = ${rVal.toExponential(2)} m`, sx + 26, sy - 4)
      ctx.fillText(`r = ${(rVal * 100).toFixed(2)} cm`, sx + 26, sy + 10)
      ctx.fillStyle = '#64748b'
      ctx.font = '7px sans-serif'
      ctx.fillText(t('experiments.emCanvasStableRecord'), sx + 26, sy + 22)
    }

    if (probeState === 'dragging') {
      ctx.fillStyle = '#a855f7'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(t('experiments.emCanvasReleaseToMeasure'), sx, sy + 28)
    }
  }

  // Zoom indicator
  ctx.fillStyle = '#64748b'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🔍 ${zoom.toFixed(1)}x  |  ${t('experiments.emZoomHint')}`, 10, h - 8)
}

function drawHelmholtzCoil(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, flatR: number, turns: number) {
  const coilW = r * 0.95  // coil ellipse x-radius
  // Back half (dim)
  ctx.strokeStyle = 'rgba(100,116,139,0.35)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.ellipse(x, y, coilW, flatR, 0, Math.PI, Math.PI * 2)
  ctx.stroke()

  // Front half (copper)
  const grad = ctx.createLinearGradient(x - coilW, 0, x + coilW, 0)
  grad.addColorStop(0, '#8B5E3C')
  grad.addColorStop(0.5, '#D49A6E')
  grad.addColorStop(1, '#8B5E3C')
  ctx.strokeStyle = grad
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.ellipse(x, y, coilW, flatR, 0, 0, Math.PI)
  ctx.stroke()

  // Multi-turn stacking — visible winding layers
  const numTurns = Math.min(Math.max(3, Math.round(turns / 15)), 12)
  for (let n = 1; n < numTurns; n++) {
    const oy = n * 2
    const shrink = 1 - n * 0.015
    ctx.strokeStyle = `rgba(100,116,139,${Math.max(0.12, 0.35 - n * 0.025)})`
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(x, y - oy, coilW * shrink, flatR * shrink, 0, Math.PI, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = `rgba(200,137,90,${Math.max(0.18, 0.45 - n * 0.025)})`
    ctx.beginPath()
    ctx.ellipse(x, y - oy, coilW * shrink, flatR * shrink, 0, 0, Math.PI)
    ctx.stroke()
  }

  // Current direction indicator (arrows on coil)
  if (Math.abs(currentI) > 0.01) {
    const arrowY = y + flatR * 0.5
    const arrowDir = currentI >= 0 ? 1 : -1
    ctx.fillStyle = 'rgba(59,130,246,0.8)'
    drawArrow(ctx, x + coilW * arrowDir, arrowY, arrowDir > 0 ? 0 : Math.PI, 'rgba(59,130,246,0.8)', 5)
  }
}

function loop() {
  try {
    if (props.running && !props.paused) {
      phase += 0.02
    }

    // Smooth parameter transitions
    targetV = props.V
    targetI = props.I
    targetN = props.N
    currentV_val += (targetV - currentV_val) * 0.3
    currentI += (targetI - currentI) * 0.3
    currentN += (targetN - currentN) * 0.3

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
  resize()
  window.addEventListener('resize', resize)
  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('mouseleave', onMouseUp)
    canvas.addEventListener('dblclick', onDoubleClick)
  }
  rafId = requestAnimationFrame(loop)

  // ResizeObserver
  const parent = canvas?.parentElement
  if (parent) {
    resizeObserver = new ResizeObserver(() => { resize() })
    resizeObserver.observe(parent)
  }

  // Watchdog
  watchdogId = window.setInterval(() => {
    if (rafId === 0 && canvasRef.value) {
      rafId = requestAnimationFrame(loop)
    }
  }, 2000)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  rafId = 0
  if (watchdogId) clearInterval(watchdogId)
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', resize)
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

watch(() => [props.V, props.I, props.N], () => {
  // Reset trail when params change
  particleTrail = []
})

watch(() => props.running, (running) => {
  if (!running) {
    particleTrail = []
    particleAngle = 0
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="lorentz-canvas" />
</template>

<style scoped>
.lorentz-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
.lorentz-canvas:active { cursor: grabbing; }
</style>
