import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import { drawTrail, drawArrow, drawBall, drawWalls } from './collision-drawers'
import { drawHUD, drawStatus, drawCountdown } from './collision-hud'
import type { CollisionParams, CollisionState } from '../../../modules/physics/experiments/collision/useCollisionPhysics'

export function useCollisionCanvas(
  getParams: () => CollisionParams,
  getSimState: () => CollisionState,
) {
  const { t } = useI18n()
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const trail1 = ref<{ x: number; t: number }[]>([])
  const trail2 = ref<{ x: number; t: number }[]>([])
  const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }[] = []
  let lastCollided = false
  let shockwave: { x: number; y: number; r: number; alpha: number } | null = null

  function playBoom() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const st = getSimState()
    const params = getParams()
    const { x1, x2, v1, v2, v1f, v2f, collided, t: simTime, running } = st
    const scale = 90
    const cy = h * 0.55
    const cx1 = w / 2 + x1 * scale
    const cx2 = w / 2 + x2 * scale
    const sr1 = Math.max(22, params.r1 * scale)
    const sr2 = Math.max(22, params.r2 * scale)

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(1, '#1e293b')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Track
    ctx.strokeStyle = 'rgba(148,163,184,0.5)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(40, cy + sr1 + 20)
    ctx.lineTo(w - 40, cy + sr1 + 20)
    ctx.stroke()

    // Track ticks
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

    // Trails
    if (running && !st.paused) {
      trail1.value.push({ x: cx1, t: simTime })
      trail2.value.push({ x: cx2, t: simTime })
      if (trail1.value.length > 80) trail1.value.shift()
      if (trail2.value.length > 80) trail2.value.shift()
    }
    drawTrail(ctx, trail1.value, cy, 'rgba(59,130,246,')
    drawTrail(ctx, trail2.value, cy, 'rgba(239,68,68,')

    // Shadows
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(cx1, cy + sr1 + 10, sr1 * 0.9, sr1 * 0.25, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx2, cy + sr2 + 10, sr2 * 0.9, sr2 * 0.25, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Balls
    drawBall(ctx, cx1, cy, sr1, ['#60a5fa', '#3b82f6', '#1e40af'], 'm₁')
    drawBall(ctx, cx2, cy, sr2, ['#f87171', '#ef4444', '#991b1b'], 'm₂')

    // Collision effects
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

    // Shockwave
    if (shockwave) {
      ctx.save()
      ctx.strokeStyle = `rgba(251,191,36,${shockwave.alpha})`
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.arc(shockwave.x, shockwave.y, shockwave.r, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()
      shockwave.r += 4; shockwave.alpha -= 0.03
      if (shockwave.alpha <= 0) shockwave = null
    }

    // Particles
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

    // Arrows
    drawArrow(ctx, cx1, cy, collided ? (v1f ?? 0) : v1, '#34d399', sr1)
    drawArrow(ctx, cx2, cy, collided ? (v2f ?? 0) : v2, '#34d399', sr2)

    // Walls
    drawWalls(ctx, w, cy, t('experiments.wallLabel'))

    // HUD
    drawHUD(ctx, w, st, params, t)

    // Countdown
    drawCountdown(ctx, w, st, params, t)

    // Status
    drawStatus(ctx, w, h, st, t)
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

  watch(() => getSimState(), draw, { deep: true })

  onMounted(() => {
    resize()
    window.addEventListener('resize', resize)
  })
  onUnmounted(() => window.removeEventListener('resize', resize))

  return { canvasRef, captureSnapshot }
}
