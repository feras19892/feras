<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

const props = defineProps<{
  n: number
  T: number
  V: number
  P: number
  particles: { x: number; y: number; vx: number; vy: number }[]
  running: boolean
}>()

const emit = defineEmits<{
  (e: 'update:V', v: number): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let lastTs = 0

/* drag state for interactive piston */
const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartV = ref(0)
const Vmin = 0.005, Vmax = 0.1

function getCtx() { const c = canvasRef.value; return c ? c.getContext('2d') : null }
function getSize(): { w: number; h: number; dpr: number } {
  const c = canvasRef.value
  if (!c) return { w: 600, h: 400, dpr: 1 }
  const rect = c.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  c.width = Math.round(rect.width * dpr)
  c.height = Math.round(rect.height * dpr)
  return { w: c.width, h: c.height, dpr }
}

function rectWidth() { return canvasRef.value ? canvasRef.value.getBoundingClientRect().width : 600 }
function rectHeight() { return canvasRef.value ? canvasRef.value.getBoundingClientRect().height : 400 }

/* temperature → color */
function tempColor(T: number, alpha = 1): string {
  const t = Math.max(0, Math.min(1, (T - 200) / 400))
  const r = Math.round(100 + t * 155)
  const g = Math.round(200 - t * 120)
  const b = Math.round(255 - t * 200)
  return `rgba(${r},${g},${b},${alpha})`
}

/* layout helpers */
const layout = computed(() => {
  const W = rectWidth(), H = rectHeight()
  const scale = Math.min(W / 520, H / 380)
  const s = (v: number) => v * scale
  const cx = W / 2
  const bottom = H - s(24)
  const cylW = s(170)
  const cylH = s(300)
  const left = cx - cylW / 2
  const right = cx + cylW / 2
  const top = bottom - cylH
  const tVol = (props.V - Vmin) / (Vmax - Vmin)
  const pistonY = bottom - s(12) - tVol * (cylH - s(36))
  return { W, H, s, cx, bottom, cylW, cylH, left, right, top, pistonY, tVol }
})

function draw() {
  const ctx = getCtx()
  if (!ctx) return
  const { dpr } = getSize()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const L = layout.value
  const { s, cx, bottom, cylW, cylH, left, right, top, pistonY } = L

  ctx.fillStyle = '#0B1220'
  ctx.fillRect(0, 0, L.W, L.H)

  // === CYLINDER GLASS ===
  ctx.fillStyle = 'rgba(30,45,60,0.35)'
  ctx.fillRect(left, top, cylW, cylH)
  // inner vertical glow
  const glow = ctx.createLinearGradient(left, top, left + cylW, top)
  glow.addColorStop(0, 'rgba(91,141,184,0.06)')
  glow.addColorStop(0.5, 'rgba(91,141,184,0.02)')
  glow.addColorStop(1, 'rgba(91,141,184,0.06)')
  ctx.fillStyle = glow
  ctx.fillRect(left + s(2), top + s(2), cylW - s(4), cylH - s(4))

  // === CYLINDER WALLS ===
  ctx.strokeStyle = '#4A5D75'; ctx.lineWidth = s(3)
  ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, bottom); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(right, top); ctx.lineTo(right, bottom); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(right, bottom); ctx.stroke()
  // top rim
  ctx.strokeStyle = '#3D4F66'; ctx.lineWidth = s(1.5)
  ctx.beginPath(); ctx.ellipse(cx, top, cylW / 2, s(9), 0, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = 'rgba(11,18,32,0.6)'
  ctx.beginPath(); ctx.ellipse(cx, top, cylW / 2 - s(2), s(7), 0, 0, Math.PI * 2); ctx.fill()

  // === VOLUME MARKERS (inside right) ===
  ctx.fillStyle = '#5A6E82'; ctx.font = `bold ${s(8)}px sans-serif`
  for (let i = 0; i <= 5; i++) {
    const y = bottom - (i / 5) * (cylH - s(36))
    ctx.fillRect(right - s(18), y, s(10), s(1.5))
    const vLabel = (Vmin + (Vmax - Vmin) * (i / 5)) * 1000
    ctx.fillText(`${vLabel.toFixed(0)}`, right - s(16), y + s(4))
  }

  // === GAS PARTICLES (with speed-based brightness) ===
  const count = Math.min(props.particles.length, Math.round(props.n * 30))
  const glowColor = tempColor(props.T, 0.22)
  const coreColor = tempColor(props.T, 1)
  for (let i = 0; i < count; i++) {
    const p = props.particles[i]
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const brightness = 0.6 + 0.4 * Math.min(speed / 2, 1)
    const px = left + s(12) + p.x * (cylW - s(24))
    const py = pistonY + s(10) + p.y * (bottom - pistonY - s(20))
    // glow
    ctx.fillStyle = glowColor
    ctx.beginPath(); ctx.arc(px, py, s(4), 0, Math.PI * 2); ctx.fill()
    // bright core
    const [r, g, b] = coreColor.slice(5, -1).split(',').map(Number)
    ctx.fillStyle = `rgba(${Math.min(255, r * brightness)},${Math.min(255, g * brightness)},${Math.min(255, b * brightness)},1)`
    ctx.beginPath(); ctx.arc(px, py, s(2.2), 0, Math.PI * 2); ctx.fill()
  }

  // === PISTON ===
  const ph = s(16)
  const grad = ctx.createLinearGradient(left, pistonY, left, pistonY + ph)
  grad.addColorStop(0, '#6BA0C8'); grad.addColorStop(0.4, '#4A7FA8'); grad.addColorStop(1, '#2A5068')
  ctx.fillStyle = grad
  ctx.fillRect(left - s(4), pistonY, cylW + s(8), ph)
  ctx.strokeStyle = '#8BBCE0'; ctx.lineWidth = s(1.2)
  ctx.strokeRect(left - s(4), pistonY, cylW + s(8), ph)
  // rod
  ctx.fillStyle = '#3D5060'
  const rodW = s(14), rodH = s(35)
  ctx.fillRect(cx - rodW / 2, pistonY - rodH, rodW, rodH)
  // handle (crossbar)
  ctx.fillStyle = '#5B8DB8'
  const barW = s(64), barH = s(10)
  ctx.fillRect(cx - barW / 2, pistonY - rodH - barH + s(3), barW, barH)
  ctx.strokeStyle = '#7BA3C8'; ctx.lineWidth = s(1.2)
  ctx.strokeRect(cx - barW / 2, pistonY - rodH - barH + s(3), barW, barH)
  // drag hint
  if (isDragging.value) {
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = s(2)
    ctx.setLineDash([s(4), s(4)])
    ctx.strokeRect(left - s(6), pistonY - rodH - barH - s(4), cylW + s(12), rodH + barH + ph + s(8))
    ctx.setLineDash([])
  }

  // === PRESSURE GAUGE (right, well separated) ===
  const gx = right + s(100), gy = top + s(100)
  const gR = s(50)
  // outer ring
  ctx.strokeStyle = '#4A5D75'; ctx.lineWidth = s(3.5)
  ctx.beginPath(); ctx.arc(gx, gy, gR, 0, Math.PI * 2); ctx.stroke()
  // inner dark
  ctx.fillStyle = '#0B1220'; ctx.beginPath(); ctx.arc(gx, gy, gR - s(4), 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#2D3F55'; ctx.lineWidth = s(1)
  ctx.beginPath(); ctx.arc(gx, gy, gR - s(4), 0, Math.PI * 2); ctx.stroke()
  // ticks
  for (let i = 0; i <= 10; i++) {
    const ang = -Math.PI * 0.75 + (i / 10) * (Math.PI * 1.5)
    const r1 = gR - s(12), r2 = gR - s(3)
    ctx.strokeStyle = i % 5 === 0 ? '#8B95A5' : '#475569'
    ctx.lineWidth = i % 5 === 0 ? s(2) : s(1.2)
    ctx.beginPath(); ctx.moveTo(gx + Math.cos(ang) * r1, gy + Math.sin(ang) * r1); ctx.lineTo(gx + Math.cos(ang) * r2, gy + Math.sin(ang) * r2); ctx.stroke()
  }
  // needle
  const Pmax = 500000
  const angle = -Math.PI * 0.75 + (Math.min(props.P, Pmax) / Pmax) * (Math.PI * 1.5)
  ctx.strokeStyle = '#ef4444'; ctx.lineWidth = s(2.8)
  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(angle) * (gR - s(10)), gy + Math.sin(angle) * (gR - s(10))); ctx.stroke()
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(gx, gy, s(5.5), 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1F27'; ctx.beginPath(); ctx.arc(gx, gy, s(2.5), 0, Math.PI * 2); ctx.fill()
  // value label
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${s(14)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${(props.P / 1000).toFixed(1)}`, gx, gy + gR + s(22))
  ctx.fillStyle = '#64748b'; ctx.font = `${s(10)}px sans-serif`
  ctx.fillText('kPa', gx, gy + gR + s(36))
  ctx.fillStyle = '#8B95A5'; ctx.font = `bold ${s(11)}px sans-serif`
  ctx.fillText('P', gx, gy - gR - s(10))
  ctx.textAlign = 'start'
}

/* === PHYSICS UPDATE === */
function updatePhysics(dt: number) {
  if (dt <= 0) return
  const speedFactor = Math.sqrt(props.T / 300) * 1.8
  const count = Math.min(props.particles.length, Math.round(props.n * 30))
  for (let i = 0; i < count; i++) {
    const p = props.particles[i]
    // move
    p.x += p.vx * dt * speedFactor
    p.y += p.vy * dt * speedFactor
    // wall collisions (elastic)
    if (p.x < 0) { p.vx = Math.abs(p.vx); p.x = 0 }
    if (p.x > 1) { p.vx = -Math.abs(p.vx); p.x = 1 }
    // bottom wall
    if (p.y < 0) { p.vy = Math.abs(p.vy); p.y = 0 }
    // piston collision (y=1 is piston in normalized coords)
    if (p.y > 1) { p.vy = -Math.abs(p.vy); p.y = 1 }
  }
}

/* === INTERACTIVE PISTON DRAG === */
function getCanvasXY(e: MouseEvent): { x: number; y: number } {
  const rect = canvasRef.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onMouseDown(e: MouseEvent) {
  const { x, y } = getCanvasXY(e)
  const L = layout.value
  // hit test: piston handle area
  const handleTop = L.pistonY - sToPx(35) - sToPx(10) + sToPx(3)
  const handleBottom = L.pistonY + sToPx(16)
  const handleLeft = L.cx - sToPx(32)
  const handleRight = L.cx + sToPx(32)
  if (x >= handleLeft && x <= handleRight && y >= handleTop && y <= handleBottom) {
    isDragging.value = true
    dragStartY.value = y
    dragStartV.value = props.V
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const { y } = getCanvasXY(e)
  const L = layout.value
  const deltaY = y - dragStartY.value
  const deltaRatio = deltaY / (L.cylH - sToPx(36))
  const newV = dragStartV.value + deltaRatio * (Vmax - Vmin)
  const clampedV = Math.max(Vmin, Math.min(Vmax, newV))
  emit('update:V', clampedV)
}

function onMouseUp() {
  isDragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function sToPx(v: number): number {
  const scale = Math.min(rectWidth() / 520, rectHeight() / 380)
  return v * scale
}

function loop(ts: number) {
  const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0
  lastTs = ts
  if (props.running) updatePhysics(dt)
  draw()
  animId = requestAnimationFrame(loop)
}

watch(() => [props.n, props.T, props.V, props.P], draw, { deep: true })

onMounted(() => {
  draw()
  animId = requestAnimationFrame(loop)
  canvasRef.value?.addEventListener('mousedown', onMouseDown)
})
onUnmounted(() => {
  cancelAnimationFrame(animId)
  canvasRef.value?.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <canvas ref="canvasRef" style="width: 100%; height: 100%; display: block; cursor: grab;" :style="isDragging ? 'cursor: grabbing;' : ''" />
</template>
