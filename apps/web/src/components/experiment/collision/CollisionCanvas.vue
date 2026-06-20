<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { CollisionParams, CollisionState } from '../../../modules/physics/experiments/collision/useCollisionPhysics'

const props = defineProps<{
  params: CollisionParams
  simState: CollisionState
}>()

const emit = defineEmits<{
  (e: 'snapshot', dataUrl: string): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Trail history
const trail1 = ref<{ x: number; t: number }[]>([])
const trail2 = ref<{ x: number; t: number }[]>([])
let particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }[] = []
let lastCollided = false

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)

  const { x1, x2, v1, v2, v1f, v2f, collided, t, running } = props.simState
  const scale = 90
  const cy = h * 0.55
  const cx1 = w / 2 + x1 * scale
  const cx2 = w / 2 + x2 * scale
  const sr1 = Math.max(22, props.params.r1 * scale)
  const sr2 = Math.max(22, props.params.r2 * scale)

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0f172a')
  grad.addColorStop(1, '#1e293b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Track — thick ground line
  ctx.strokeStyle = 'rgba(148,163,184,0.5)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(40, cy + sr1 + 20)
  ctx.lineTo(w - 40, cy + sr1 + 20)
  ctx.stroke()

  // Track ticks + scale markers
  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'bold 14px "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  for (let i = -5; i <= 5; i++) {
    const px = w / 2 + i * scale
    ctx.beginPath()
    ctx.moveTo(px, cy + sr1 + 14)
    ctx.lineTo(px, cy + sr1 + 26)
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.stroke()
    ctx.fillText(`${i}m`, px, cy + sr1 + 46)
  }

  // Update trails
  if (running && !props.simState.paused) {
    trail1.value.push({ x: cx1, t })
    trail2.value.push({ x: cx2, t })
    if (trail1.value.length > 80) trail1.value.shift()
    if (trail2.value.length > 80) trail2.value.shift()
  }

  // Draw trails
  function drawTrail(c: CanvasRenderingContext2D, trail: { x: number; t: number }[], colorBase: string) {
    if (trail.length < 2) return
    c.save()
    for (let i = 1; i < trail.length; i++) {
      const alpha = i / trail.length * 0.4
      c.strokeStyle = colorBase + alpha + ')'
      c.lineWidth = 2
      c.beginPath()
      c.moveTo(trail[i - 1].x, cy)
      c.lineTo(trail[i].x, cy)
      c.stroke()
    }
    c.restore()
  }
  drawTrail(ctx, trail1.value, 'rgba(59,130,246,' )
  drawTrail(ctx, trail2.value, 'rgba(239,68,68,' )

  // Shadow under balls
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(cx1, cy + sr1 + 10, sr1 * 0.9, sr1 * 0.25, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx2, cy + sr2 + 10, sr2 * 0.9, sr2 * 0.25, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Ball 1 — 3D blue
  ctx.save()
  const g1 = ctx.createRadialGradient(cx1 - sr1 * 0.3, cy - sr1 * 0.3, sr1 * 0.1, cx1, cy, sr1)
  g1.addColorStop(0, '#60a5fa')
  g1.addColorStop(0.5, '#3b82f6')
  g1.addColorStop(1, '#1e40af')
  ctx.beginPath(); ctx.arc(cx1, cy, sr1, 0, Math.PI * 2)
  ctx.fillStyle = g1; ctx.fill()
  ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 3; ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.beginPath(); ctx.arc(cx1 - sr1 * 0.25, cy - sr1 * 0.25, sr1 * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.max(16, sr1 * 0.35)}px "Segoe UI"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('m₁', cx1, cy + 2)
  ctx.restore()

  // Ball 2 — 3D red
  ctx.save()
  const g2 = ctx.createRadialGradient(cx2 - sr2 * 0.3, cy - sr2 * 0.3, sr2 * 0.1, cx2, cy, sr2)
  g2.addColorStop(0, '#f87171')
  g2.addColorStop(0.5, '#ef4444')
  g2.addColorStop(1, '#991b1b')
  ctx.beginPath(); ctx.arc(cx2, cy, sr2, 0, Math.PI * 2)
  ctx.fillStyle = g2; ctx.fill()
  ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 3; ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.beginPath(); ctx.arc(cx2 - sr2 * 0.25, cy - sr2 * 0.25, sr2 * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.max(16, sr2 * 0.35)}px "Segoe UI"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('m₂', cx2, cy + 2)
  ctx.restore()

  // Collision particles
  if (collided && !lastCollided) {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.3
      const speed = 1 + Math.random() * 3
      particles.push({
        x: (cx1 + cx2) / 2, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, maxLife: 0.5 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? '#fbbf24' : '#f87171'
      })
    }
    lastCollided = true
  }
  if (!collided) lastCollided = false

  // Draw & update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy; p.vy += 0.1
    p.life -= 0.02
    if (p.life <= 0) { particles.splice(i, 1); continue }
    ctx.save()
    ctx.globalAlpha = p.life
    ctx.fillStyle = p.color
    ctx.beginPath(); ctx.arc(p.x, p.y, 3 + p.life * 3, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  // Velocity arrows — bigger
  function drawArrow(c: CanvasRenderingContext2D, x: number, y: number, v: number, color: string, r: number) {
    if (Math.abs(v) < 0.1) return
    const len = Math.min(120, Math.abs(v) * 22)
    const dir = v > 0 ? 1 : -1
    c.save()
    c.strokeStyle = color; c.lineWidth = 4
    c.beginPath(); c.moveTo(x, y - r - 24); c.lineTo(x + len * dir, y - r - 24); c.stroke()
    c.fillStyle = color
    c.beginPath()
    c.moveTo(x + len * dir, y - r - 24)
    c.lineTo(x + len * dir - 10 * dir, y - r - 30)
    c.lineTo(x + len * dir - 10 * dir, y - r - 18)
    c.closePath(); c.fill()
    c.fillStyle = color; c.font = 'bold 13px "Segoe UI"'; c.textAlign = 'center'; c.textBaseline = 'bottom'
    c.fillText(`${v.toFixed(1)}`, x + (len * dir) / 2, y - r - 30)
    c.restore()
  }
  drawArrow(ctx, cx1, cy, collided ? (v1f ?? 0) : v1, '#34d399', sr1)
  drawArrow(ctx, cx2, cy, collided ? (v2f ?? 0) : v2, '#34d399', sr2)

  // Live HUD — bigger
  ctx.save()
  ctx.fillStyle = 'rgba(15,23,42,0.9)'
  ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.roundRect(12, 10, 170, 88, 8); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 14px "Segoe UI"'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  ctx.fillText(`v₁ = ${(collided ? (v1f ?? v1) : v1).toFixed(2)} m/s`, 22, 18)
  ctx.fillStyle = '#38bdf8'
  ctx.fillText(`v₂ = ${(collided ? (v2f ?? v2) : v2).toFixed(2)} m/s`, 22, 40)
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`t = ${t.toFixed(2)} s`, 22, 62)
  ctx.restore()

  // Status text — bigger
  ctx.save()
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 16px "Segoe UI"'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  let status = ''
  if (!running) status = 'اضغط "بدء" لإطلاق الكرتين'
  else if (props.simState.paused) status = '⏸️ متوقف مؤقتاً'
  else if (collided) status = '💥 تصادم!'
  else status = 'الكرتان تتحركان...'
  ctx.fillText(status, w / 2, h - 32)
  ctx.restore()
}

function captureSnapshot() {
  const canvas = canvasRef.value
  if (!canvas) return ''
  return canvas.toDataURL('image/png')
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const wrap = canvas.parentElement
  if (!wrap) return
  canvas.width = wrap.clientWidth
  canvas.height = wrap.clientHeight
  draw()
}

watch(() => props.simState, draw, { deep: true })

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})
onUnmounted(() => window.removeEventListener('resize', resize))

defineExpose({ captureSnapshot })
</script>

<template>
  <div class="collision-canvas-wrap">
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.collision-canvas-wrap { flex: 1; min-height: 0; position: relative; background: #0f172a; border-radius: 10px; border: 2px solid #2D3645; overflow: hidden; }
.collision-canvas-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
</style>
