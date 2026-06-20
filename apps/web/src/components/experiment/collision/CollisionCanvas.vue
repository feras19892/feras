<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { CollisionParams, CollisionState } from '../../../modules/physics/experiments/collision/useCollisionPhysics'

const props = defineProps<{
  params: CollisionParams
  simState: CollisionState
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Trail history
const trail1 = ref<{ x: number; t: number }[]>([])
const trail2 = ref<{ x: number; t: number }[]>([])
const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }[] = []
let lastCollided = false
let shockwave: { x: number; y: number; r: number; alpha: number } | null = null

function playBoom() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(); osc.stop(ctx.currentTime + 0.3)
  } catch { /* ignore */ }
}

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

  // Shockwave + sound on first collision frame
  if (collided && !lastCollided) {
    playBoom()
    shockwave = { x: (cx1 + cx2) / 2, y: cy, r: 10, alpha: 1 }
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5
      const speed = 2 + Math.random() * 5
      particles.push({
        x: (cx1 + cx2) / 2, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, maxLife: 0.6 + Math.random() * 0.6,
        color: Math.random() > 0.3 ? '#fbbf24' : '#f87171'
      })
    }
    lastCollided = true
  }
  if (!collided) lastCollided = false

  // Draw shockwave ring
  if (shockwave) {
    ctx.save()
    ctx.strokeStyle = `rgba(251,191,36,${shockwave.alpha})`
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(shockwave.x, shockwave.y, shockwave.r, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
    shockwave.r += 4; shockwave.alpha -= 0.03
    if (shockwave.alpha <= 0) shockwave = null
  }

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

  // Velocity arrows — compact, above balls
  function drawArrow(c: CanvasRenderingContext2D, x: number, y: number, v: number, color: string, r: number) {
    if (Math.abs(v) < 0.3) return
    const len = Math.min(70, Math.abs(v) * 12)
    const dir = v > 0 ? 1 : -1
    const ay = y - r - 14
    c.save()
    c.strokeStyle = color; c.lineWidth = 3; c.globalAlpha = 0.85
    c.beginPath(); c.moveTo(x, ay); c.lineTo(x + len * dir, ay); c.stroke()
    c.fillStyle = color; c.globalAlpha = 0.85
    c.beginPath()
    c.moveTo(x + len * dir, ay)
    c.lineTo(x + len * dir - 7 * dir, ay - 5)
    c.lineTo(x + len * dir - 7 * dir, ay + 5)
    c.closePath(); c.fill()
    c.fillStyle = color; c.font = 'bold 11px "Segoe UI"'; c.textAlign = 'center'; c.textBaseline = 'bottom'
    c.fillText(`${v.toFixed(1)}`, x + (len * dir) / 2, ay - 6)
    c.restore()
  }
  drawArrow(ctx, cx1, cy, collided ? (v1f ?? 0) : v1, '#34d399', sr1)
  drawArrow(ctx, cx2, cy, collided ? (v2f ?? 0) : v2, '#34d399', sr2)

  // Walls
  ctx.save()
  ctx.fillStyle = 'rgba(71,85,105,0.5)'
  const wallW = 12
  ctx.fillRect(0, cy - 60, wallW, 120)
  ctx.fillRect(w - wallW, cy - 60, wallW, 120)
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2
  ctx.strokeRect(0, cy - 60, wallW, 120)
  ctx.strokeRect(w - wallW, cy - 60, wallW, 120)
  ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 10px "Segoe UI"'; ctx.textAlign = 'center'
  ctx.save(); ctx.translate(6, cy); ctx.rotate(-Math.PI/2); ctx.fillText('حاجز', 0, 0); ctx.restore()
  ctx.save(); ctx.translate(w - 6, cy); ctx.rotate(Math.PI/2); ctx.fillText('حاجز', 0, 0); ctx.restore()
  ctx.restore()

  // Live HUD — bigger + Pi/Pf/KE
  ctx.save()
  ctx.fillStyle = 'rgba(15,23,42,0.92)'
  ctx.strokeStyle = 'rgba(148,163,184,0.3)'; ctx.lineWidth = 1.5
  const rx = 12, ry = 10, rw = 200, rh = 148, rr = 8
  ctx.beginPath(); ctx.moveTo(rx + rr, ry); ctx.lineTo(rx + rw - rr, ry); ctx.arcTo(rx + rw, ry, rx + rw, ry + rr, rr); ctx.lineTo(rx + rw, ry + rh - rr); ctx.arcTo(rx + rw, ry + rh, rx + rw - rr, ry + rh, rr); ctx.lineTo(rx + rr, ry + rh); ctx.arcTo(rx, ry + rh, rx, ry + rh - rr, rr); ctx.lineTo(rx, ry + rr); ctx.arcTo(rx, ry, rx + rr, ry, rr); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 13px "Segoe UI"'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  ctx.fillText(`v₁ = ${(collided ? (v1f ?? v1) : v1).toFixed(2)} m/s`, 22, 16)
  ctx.fillStyle = '#38bdf8'
  ctx.fillText(`v₂ = ${(collided ? (v2f ?? v2) : v2).toFixed(2)} m/s`, 22, 36)
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`t = ${t.toFixed(2)} s`, 22, 56)
  // Physics counters
  const st = props.simState
  if (st.KEi !== null && st.KEf !== null) {
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px "Segoe UI"'
    ctx.fillText(`Pقبل = ${st.Pi?.toFixed(1)}  |  Pبعد = ${st.Pf?.toFixed(1)}`, 22, 80)
    ctx.fillStyle = '#34d399'
    ctx.fillText(`KEقبل = ${st.KEi?.toFixed(1)} J`, 22, 98)
    ctx.fillStyle = '#f87171'
    ctx.fillText(`KEبعد = ${st.KEf?.toFixed(1)} J  |  فقدان ${st.lossPercent?.toFixed(0)}%`, 22, 116)
  }
  ctx.restore()

  // Countdown to collision
  if (running && !collided && !st.paused) {
    const dist = Math.abs(x2 - x1) - (props.params.r1 + props.params.r2)
    const relV = Math.abs(v1 - v2)
    if (dist > 0 && relV > 0.1) {
      const timeToCollide = dist / relV
      if (timeToCollide < 3) {
        ctx.save()
        ctx.fillStyle = 'rgba(251,191,36,0.9)'
        ctx.font = 'bold 18px "Segoe UI"'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
        ctx.fillText(`التصادم خلال ${timeToCollide.toFixed(1)}s`, w / 2, 80)
        ctx.restore()
      }
    }
  }

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
