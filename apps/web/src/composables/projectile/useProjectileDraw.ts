import type { ProjectileParams, ProjectilePoint } from '../../modules/physics/experiments/projectile/useProjectilePhysics'
import { useProjectileTargetDraw } from './useProjectileTargetDraw'
import { useProjectileGrid } from './useProjectileGrid'
import { useProjectileDigitalScreen } from './useProjectileDigitalScreen'

interface SimState {
  x: number; y: number; vx: number; vy: number; t: number
  running: boolean; paused: boolean; landed: boolean
  trail: ProjectilePoint[]
  targetHit: boolean
  distanceToTarget: number | null
  maxHeightReached: number
  landingSpeed: number
}

export function useProjectileDraw(canvasRef: { value: HTMLCanvasElement | null }, params: ProjectileParams, simState: SimState) {
  const { drawTarget } = useProjectileTargetDraw()
  const { toScreen, drawGrid, drawAxes } = useProjectileGrid(params)
  const { draw: drawDigitalScreen } = useProjectileDigitalScreen(params, simState)

  function drawLauncher(ctx: CanvasRenderingContext2D, _ts: ReturnType<typeof toScreen>) {
    const { sx, sy, scale } = _ts
    const angleRad = (params.angleDeg * Math.PI) / 180
    const barrelLen = scale * 0.4
    const bx = sx + Math.cos(angleRad) * barrelLen
    const by = sy - Math.sin(angleRad) * barrelLen
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bx, by); ctx.stroke()
    ctx.fillStyle = '#1e293b'
    ctx.beginPath(); ctx.arc(sx, sy, scale * 0.12, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke()
  }

  function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number, _ts: ReturnType<typeof toScreen>) {
    const { margin, groundY } = _ts
    ctx.fillStyle = '#252D3A'
    ctx.fillRect(margin, groundY, w - margin * 2, h - groundY)
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    for (let x = margin + 5; x < w - margin; x += 10) {
      ctx.beginPath(); ctx.arc(x, groundY + 3, 1, 0, Math.PI * 2); ctx.fillStyle = '#334155'; ctx.fill()
    }
  }

  function drawTrail(ctx: CanvasRenderingContext2D, w: number, h: number, _ts: ReturnType<typeof toScreen>) {
    const trail = simState.trail
    if (trail.length < 2) return
    // Glow shadow
    ctx.save()
    ctx.shadowColor = 'rgba(59,130,246,0.6)'
    ctx.shadowBlur = 8
    ctx.strokeStyle = 'rgba(59,130,246,0.8)'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    trail.forEach((p, i) => {
      const pt = toScreen(w, h, p.x, p.y)
      if (i === 0) ctx.moveTo(pt.sx, pt.sy)
      else ctx.lineTo(pt.sx, pt.sy)
    })
    ctx.stroke()
    ctx.restore()
    // Dots along trail
    ctx.fillStyle = 'rgba(59,130,246,0.6)'
    trail.forEach((p, i) => {
      if (i % 4 !== 0) return
      const pt = toScreen(w, h, p.x, p.y)
      ctx.beginPath(); ctx.arc(pt.sx, pt.sy, 1.5, 0, Math.PI * 2); ctx.fill()
    })
  }

  function drawBall(ctx: CanvasRenderingContext2D, w: number, h: number, _ts: ReturnType<typeof toScreen>, ballPos: ReturnType<typeof toScreen>) {
    const { sx: bx, sy: by, scale } = ballPos
    const ballR = Math.max(5, scale * 0.15)
    // Shadow at ground under ball
    if (simState.y > 0.1) {
      const shadowY = h - _ts.margin + 3
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath(); ctx.ellipse(bx, shadowY, ballR * 0.8, ballR * 0.3, 0, 0, Math.PI * 2); ctx.fill()
    }
    // Ball
    const bg = ctx.createRadialGradient(bx - ballR * 0.3, by - ballR * 0.3, ballR * 0.1, bx, by, ballR)
    bg.addColorStop(0, '#fca5a5')
    bg.addColorStop(0.5, '#ef4444')
    bg.addColorStop(1, '#b91c1c')
    ctx.fillStyle = bg
    ctx.beginPath(); ctx.arc(bx, by, ballR, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1; ctx.stroke()
  }

  function drawVelocity(ctx: CanvasRenderingContext2D, _w: number, _h: number, ballPos: ReturnType<typeof toScreen>) {
    const vMag = Math.sqrt(simState.vx ** 2 + simState.vy ** 2)
    if (vMag < 0.1 || simState.landed) return
    const { sx: bx, sy: by, scale } = ballPos
    const vScale = Math.min(scale * 0.3, 40)
    const vdx = (simState.vx / vMag) * vScale
    const vdy = -(simState.vy / vMag) * vScale
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + vdx, by + vdy); ctx.stroke()
    const angle = Math.atan2(-vdy, vdx)
    ctx.beginPath()
    ctx.moveTo(bx + vdx, by + vdy)
    ctx.lineTo(bx + vdx - 8 * Math.cos(angle - 0.5), by + vdy + 8 * Math.sin(angle - 0.5))
    ctx.lineTo(bx + vdx - 8 * Math.cos(angle + 0.5), by + vdy + 8 * Math.sin(angle + 0.5))
    ctx.closePath(); ctx.fillStyle = '#22c55e'; ctx.fill()
  }

  function draw() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const w = rect.width, h = rect.height
    if (w === 0 || h === 0) return
    ctx.clearRect(0, 0, w, h)

    // Dark theme canvas background
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#1e293b')
    grad.addColorStop(1, '#0f172a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)

    const _ts = toScreen(w, h, 0, 0)
    const ballPos = toScreen(w, h, simState.x, simState.y)
    drawGrid(ctx, w, h, _ts)
    drawGround(ctx, w, h, _ts)
    drawAxes(ctx, w, h, _ts)
    drawTarget(ctx, w, h, params, simState, _ts.margin, _ts.groundY, _ts.scale)
    drawLauncher(ctx, _ts)
    drawTrail(ctx, w, h, _ts)
    drawBall(ctx, w, h, _ts, ballPos)
    drawVelocity(ctx, w, h, ballPos)
    drawDigitalScreen(ctx, w)
  }

  return { draw }
}
