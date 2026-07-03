<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import type { LeverForce } from '../../../modules/physics/experiments/lever/useLeverPhysics'
import type { BeamMass } from '../../../modules/physics/experiments/lever/useLeverBeamPhysics'

const { t } = useI18n()

const props = defineProps<{
  mode: 'vector' | 'beam'
  forces: LeverForce[]
  resultant: { fx: number; fy: number; magnitude: number; angleDeg: number }
  equilibriumForce: { magnitude: number; angleDeg: number } | null
  isBalanced: boolean
  masses?: BeamMass[]
  tiltDeg?: number
  netTorque?: number
  beamLength?: number
}>()

const emit = defineEmits<{
  (e: 'addForce'): void
  (e: 'updateForce', id: number, magnitude: number, angleDeg: number): void
  (e: 'removeForce', id: number): void
  (e: 'addMass'): void
  (e: 'updateMass', id: number, mass: number, distance: number): void
  (e: 'removeMass', id: number): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

const SCALE = 2.5 // px per Newton
const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

const draggingId = ref<number | null>(null)
const hoverId = ref<number | null>(null)

let cx = 0, cy = 0, radius = 0

function resize() {
  const c = canvasRef.value, w = wrapRef.value
  if (!c || !w) return
  const rect = w.getBoundingClientRect()
  c.width = rect.width; c.height = rect.height
  cx = c.width / 2; cy = c.height / 2
  radius = Math.min(cx, cy) - 40
  draw()
}

function toCanvas(force: LeverForce) {
  const rad = force.angleDeg * Math.PI / 180
  const len = Math.min(force.magnitude * SCALE, radius)
  return { x2: cx + len * Math.cos(rad), y2: cy - len * Math.sin(rad), len }
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width = 2, dashed = false) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width
  if (dashed) ctx.setLineDash([6, 4])
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 10
  ctx.beginPath(); ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(angle - 0.5), y2 - head * Math.sin(angle - 0.5))
  ctx.lineTo(x2 - head * Math.cos(angle + 0.5), y2 - head * Math.sin(angle + 0.5))
  ctx.closePath(); ctx.fill(); ctx.restore()
}

function draw() {
  const c = canvasRef.value; if (!c) return
  const ctx = c.getContext('2d')!; ctx.clearRect(0, 0, c.width, c.height)
  if (props.mode === 'vector') drawVector(ctx)
  else drawBeam(ctx)
}

function drawVector(ctx: CanvasRenderingContext2D) {
  const W = ctx.canvas.width, H = ctx.canvas.height

  // Concentric circles
  ctx.strokeStyle = 'rgba(91,141,184,0.10)'; ctx.lineWidth = 1
  for (let r = 20; r <= radius; r += 40) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke() }

  // Axes
  ctx.strokeStyle = 'rgba(91,141,184,0.25)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
  ctx.fillStyle = '#5B8DB8'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('0°', cx + radius + 14, cy + 4); ctx.fillText('90°', cx - 8, cy - radius - 6)
  ctx.fillText('180°', cx - radius - 14, cy + 4); ctx.fillText('270°', cx - 8, cy + radius + 14)

  // === Construction: head-to-tail dashed lines ===
  if (props.forces.length >= 2) {
    let curX = cx, curY = cy
    ctx.strokeStyle = 'rgba(148,163,184,0.35)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
    for (const f of props.forces) {
      const rad = f.angleDeg * Math.PI / 180
      const len = Math.min(f.magnitude * SCALE, radius)
      const nx = curX + len * Math.cos(rad)
      const ny = curY - len * Math.sin(rad)
      ctx.beginPath(); ctx.moveTo(curX, curY); ctx.lineTo(nx, ny); ctx.stroke()
      // small dot at joint
      ctx.fillStyle = 'rgba(148,163,184,0.5)'; ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fill()
      curX = nx; curY = ny
    }
    // dashed line back to origin (should close if balanced)
    if (!props.isBalanced) {
      ctx.strokeStyle = 'rgba(239,68,68,0.3)'; ctx.setLineDash([3, 6])
      ctx.beginPath(); ctx.moveTo(curX, curY); ctx.lineTo(cx, cy); ctx.stroke()
    }
    ctx.setLineDash([])
  }

  // === Force arrows from origin ===
  props.forces.forEach((f, i) => {
    const pos = toCanvas(f)
    const color = COLORS[i % COLORS.length]
    const isHover = hoverId.value === f.id
    drawArrow(ctx, cx, cy, pos.x2, pos.y2, color, isHover ? 3.5 : 2.5)
    // Label with background for readability
    const labelX = pos.x2 + 8, labelY = pos.y2
    ctx.fillStyle = 'rgba(22,27,34,0.85)'; ctx.fillRect(labelX - 2, labelY - 10, 90, 14)
    ctx.fillStyle = color; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(`${f.magnitude.toFixed(1)}N @${f.angleDeg.toFixed(0)}°`, labelX, labelY)
  })

  // === Resultant arrow (thick red) ===
  if (props.resultant.magnitude > 0.01) {
    const rLen = Math.min(props.resultant.magnitude * SCALE, radius)
    const rRad = props.resultant.angleDeg * Math.PI / 180
    const rx = cx + rLen * Math.cos(rRad), ry = cy - rLen * Math.sin(rRad)
    // Glow
    ctx.save(); ctx.strokeStyle = 'rgba(239,68,68,0.15)'; ctx.lineWidth = 8; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx, ry); ctx.stroke(); ctx.restore()
    // Arrow
    drawArrow(ctx, cx, cy, rx, ry, '#ef4444', 4)
    // Value label
    ctx.fillStyle = 'rgba(22,27,34,0.9)'; ctx.fillRect(rx + 6, ry - 22, 110, 28)
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1; ctx.strokeRect(rx + 6, ry - 22, 110, 28)
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText('R = ' + props.resultant.magnitude.toFixed(2) + ' N', rx + 12, ry - 8)
    ctx.fillStyle = '#8B95A5'; ctx.font = '10px sans-serif'
    ctx.fillText('@ ' + props.resultant.angleDeg.toFixed(1) + '°', rx + 12, ry + 4)
  }

  // === Equilibrium force (green dashed) ===
  if (props.equilibriumForce && props.equilibriumForce.magnitude > 0.01) {
    const eLen = Math.min(props.equilibriumForce.magnitude * SCALE, radius)
    const eRad = props.equilibriumForce.angleDeg * Math.PI / 180
    const ex = cx + eLen * Math.cos(eRad), ey = cy - eLen * Math.sin(eRad)
    drawArrow(ctx, cx, cy, ex, ey, '#22c55e', 2.5, true)
    ctx.fillStyle = 'rgba(22,27,34,0.85)'; ctx.fillRect(ex + 6, ey + 4, 70, 14)
    ctx.fillStyle = '#22c55e'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText('F_eq = ' + props.equilibriumForce.magnitude.toFixed(1) + 'N', ex + 8, ey + 14)
  }

  // === Balance indicator ===
  if (props.isBalanced) {
    ctx.fillStyle = '#22c55e'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('✅ ' + t('experiments.balanced'), cx, cy - radius - 20)
  } else if (props.resultant.magnitude > 0.01) {
    // Show "net force" hint
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('⚠️ ' + t('experiments.unbalanced'), cx, cy - radius - 16)
  }
}

function drawBeam(ctx: CanvasRenderingContext2D) {
  const bLen = (props.beamLength ?? 2)
  const pxPerM = Math.min(cx - 60, 200) / (bLen / 2)
  const fulcrumX = cx, fulcrumY = cy
  const tilt = (props.tiltDeg ?? 0) * Math.PI / 180

  // Ground
  ctx.fillStyle = '#2D3645'; ctx.fillRect(0, fulcrumY + 60, ctx.canvas.width, 4)

  // Fulcrum (triangle)
  ctx.fillStyle = '#8B95A5'; ctx.beginPath()
  ctx.moveTo(fulcrumX, fulcrumY + 60); ctx.lineTo(fulcrumX - 20, fulcrumY + 80); ctx.lineTo(fulcrumX + 20, fulcrumY + 80); ctx.closePath(); ctx.fill()

  // Beam (rotated around fulcrum)
  const halfBeamPx = (bLen / 2) * pxPerM
  ctx.save(); ctx.translate(fulcrumX, fulcrumY); ctx.rotate(tilt)
  ctx.strokeStyle = '#5B8DB8'; ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(-halfBeamPx, 0); ctx.lineTo(halfBeamPx, 0); ctx.stroke()
  // Ticks
  ctx.fillStyle = '#5B8DB8'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
  for (let d = -bLen / 2; d <= bLen / 2; d += 0.25) {
    const tx = d * pxPerM
    ctx.beginPath(); ctx.moveTo(tx, -3); ctx.lineTo(tx, 3); ctx.stroke()
    if (Math.abs(d * 4 - Math.round(d * 4)) < 0.01) ctx.fillText(d.toFixed(1) + 'm', tx, 18)
  }
  // Masses
  props.masses?.forEach((m, i) => {
    const mx = m.distance * pxPerM
    const color = COLORS[i % COLORS.length]
    // Weight arrow (down from beam)
    const wLen = Math.min(m.mass * 3, 60)
    drawArrow(ctx, mx, 0, mx, wLen, color, 2)
    // Mass block
    ctx.fillStyle = color; ctx.fillRect(mx - 10, -12, 20, 12)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(`${m.mass.toFixed(1)}kg`, mx, -4)
  })
  ctx.restore()

  // Torque info
  ctx.fillStyle = '#D1D7E0'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(`τ = ${(props.netTorque ?? 0).toFixed(2)} N·m`, 10, 20)
  if (Math.abs(props.netTorque ?? 0) < 0.01) {
    ctx.fillStyle = '#22c55e'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('✅ ' + t('experiments.balanced'), cx, 30)
  }
}

function hitTest(x: number, y: number): number | null {
  if (props.mode === 'vector') {
    for (const f of props.forces) {
      const pos = toCanvas(f)
      const dx = x - pos.x2, dy = y - pos.y2
      if (dx * dx + dy * dy < 400) return f.id
    }
  } else {
    // Hit test masses on beam
    const bLen = props.beamLength ?? 2
    const pxPerM = Math.min(cx - 60, 200) / (bLen / 2)
    const tilt = (props.tiltDeg ?? 0) * Math.PI / 180
    for (const m of props.masses ?? []) {
      const mx = cx + (m.distance * pxPerM) * Math.cos(-tilt)
      const my = cy - (m.distance * pxPerM) * Math.sin(-tilt) - 12
      const dx = x - mx, dy = y - my
      if (dx * dx + dy * dy < 400) return m.id
    }
  }
  return null
}

function onPointerDown(e: PointerEvent) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const x = e.clientX - rect.left, y = e.clientY - rect.top
  const id = hitTest(x, y)
  if (id !== null) { draggingId.value = id; canvasRef.value!.setPointerCapture(e.pointerId) }
}

function onPointerMove(e: PointerEvent) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const x = e.clientX - rect.left, y = e.clientY - rect.top
  hoverId.value = hitTest(x, y)
  if (draggingId.value === null) return
  if (props.mode === 'vector') {
    const dx = x - cx, dy = cy - y
    const angle = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360
    const dist = Math.sqrt(dx * dx + dy * dy)
    emit('updateForce', draggingId.value, Math.max(0.1, Math.min(100, dist / SCALE)), angle)
  } else {
    const bLen = props.beamLength ?? 2
    const pxPerM = Math.min(cx - 60, 200) / (bLen / 2)
    const dist = (x - cx) / pxPerM
    emit('updateMass', draggingId.value, (props.masses?.find(m => m.id === draggingId.value)?.mass ?? 1), Math.max(-bLen / 2, Math.min(bLen / 2, dist)))
  }
}

function onPointerUp() { draggingId.value = null }
function onDblClick(e: MouseEvent) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const id = hitTest(e.clientX - rect.left, e.clientY - rect.top)
  if (id !== null) { if (props.mode === 'vector') emit('removeForce', id); else emit('removeMass', id) }
}

let resizeObs: ResizeObserver | null = null
onMounted(() => { resize(); if (wrapRef.value) { resizeObs = new ResizeObserver(resize); resizeObs.observe(wrapRef.value) } })
onUnmounted(() => { if (resizeObs) resizeObs.disconnect() })
watch(() => [props.mode, props.forces.length, props.forces.map(f => `${f.magnitude},${f.angleDeg}`), props.resultant.magnitude, props.isBalanced, props.masses?.length, props.tiltDeg, props.netTorque], draw, { flush: 'post' })
</script>

<template>
  <div ref="wrapRef" class="canvas-wrap">
    <canvas ref="canvasRef" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp" @dblclick="onDblClick" />
    <button class="add-btn" @click="mode === 'vector' ? emit('addForce') : emit('addMass')">
      + {{ mode === 'vector' ? t('experiments.addForce') : t('experiments.addMass') }}
    </button>
  </div>
</template>

<style scoped>
.canvas-wrap { flex: 1; min-height: 0; width: 100%; display: flex; flex-direction: column; position: relative; }
.canvas-wrap canvas { display: block; width: 100%; flex: 1; min-height: 0; border-radius: 8px; background: linear-gradient(180deg, #fffef7, #fff8ea); border: 1px solid #2D3645; }
.add-btn { position: absolute; bottom: 16px; left: 16px; z-index: 10; background: linear-gradient(135deg, #5B8DB8, #3b6f99); color: #fff; border: none; border-radius: 24px; padding: .5rem 1rem; font-size: .75rem; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 12px rgba(91,141,184,.35); letter-spacing: .3px; }
.add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(91,141,184,.45); }
.add-btn:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(91,141,184,.3); }
</style>
