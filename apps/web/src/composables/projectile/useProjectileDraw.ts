import type { ProjectileParams, ProjectilePoint } from '../../modules/physics/experiments/projectile/useProjectilePhysics'

interface SimState {
  x: number; y: number; vx: number; vy: number; t: number
  running: boolean; paused: boolean; landed: boolean
  trail: ProjectilePoint[]
}

export function useProjectileDraw(canvasRef: { value: HTMLCanvasElement | null }, params: ProjectileParams, simState: SimState) {
  function toScreen(w: number, h: number, x: number, y: number) {
    const margin = 50
    const groundY = h - margin
    const rad = (params.angleDeg * Math.PI) / 180
    const v0 = params.v0
    const g = params.g
    const R = (v0 * v0 * Math.sin(2 * rad)) / g
    const H = (Math.pow(v0 * Math.sin(rad), 2)) / (2 * g)
    const maxX = Math.max(R * 1.6, 50)
    const maxY = Math.max(H * 1.6, 30)
    const scaleX = (w - margin * 2) / maxX
    const scaleY = (groundY - margin * 2) / maxY
    const scale = Math.min(scaleX, scaleY)
    const sx = margin + x * scale
    const sy = groundY - y * scale
    return { sx, sy, scale, margin, groundY }
  }

  function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, _ts: ReturnType<typeof toScreen>) {
    const { margin, groundY, scale } = _ts
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    const step = 20
    for (let x = margin; x < w - margin; x += step) {
      ctx.beginPath(); ctx.moveTo(x, margin); ctx.lineTo(x, groundY); ctx.stroke()
    }
    for (let y = margin; y < groundY; y += step) {
      ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(w - margin, y); ctx.stroke()
    }
  }

  function drawAxes(ctx: CanvasRenderingContext2D, w: number, h: number, _ts: ReturnType<typeof toScreen>) {
    const { margin, groundY } = _ts
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(margin, groundY); ctx.lineTo(w - margin, groundY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(margin, margin); ctx.lineTo(margin, groundY); ctx.stroke()
    // Arrow X
    ctx.beginPath(); ctx.moveTo(w - margin, groundY); ctx.lineTo(w - margin - 10, groundY - 4); ctx.lineTo(w - margin - 10, groundY + 4); ctx.closePath(); ctx.fillStyle = '#475569'; ctx.fill()
    // Arrow Y
    ctx.beginPath(); ctx.moveTo(margin, margin); ctx.lineTo(margin - 4, margin + 10); ctx.lineTo(margin + 4, margin + 10); ctx.closePath(); ctx.fillStyle = '#475569'; ctx.fill()
    // Labels
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('X (m)', w - margin - 15, groundY + 15)
    ctx.fillText('Y (m)', margin - 15, margin + 15)
  }

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
    ctx.fillStyle = '#1e293b'
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

  function drawClock(ctx: CanvasRenderingContext2D, w: number, _ts: ReturnType<typeof toScreen>) {
    ctx.fillStyle = 'rgba(15,23,42,0.9)'
    ctx.beginPath()
    ctx.roundRect(w - 120, 10, 100, 28, 6)
    ctx.fill()
    ctx.strokeStyle = 'rgba(71,85,105,0.5)'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillStyle = '#e2e8f0'; ctx.font = '13px monospace'; ctx.textAlign = 'center'
    ctx.fillText(`t = ${simState.t.toFixed(2)} s`, w - 70, 29)
  }

  function drawInfoBar(ctx: CanvasRenderingContext2D, w: number, _h: number) {
    const vMag = Math.sqrt(simState.vx ** 2 + simState.vy ** 2)
    ctx.fillStyle = 'rgba(30,41,59,0.75)'
    ctx.beginPath(); ctx.roundRect(10, 46, 220, 22, 4); ctx.fill()
    ctx.fillStyle = '#cbd5e1'; ctx.font = '11px monospace'; ctx.textAlign = 'left'
    const info = `v=${vMag.toFixed(1)}  y=${simState.y.toFixed(1)}  t=${simState.t.toFixed(2)}`
    ctx.fillText(info, 18, 61)
  }

  function draw() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#f8fafc')
    grad.addColorStop(1, '#e2e8f0')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)

    const _ts = toScreen(w, h, 0, 0)
    const ballPos = toScreen(w, h, simState.x, simState.y)
    drawGrid(ctx, w, h, _ts)
    drawGround(ctx, w, h, _ts)
    drawAxes(ctx, w, h, _ts)
    drawLauncher(ctx, _ts)
    drawTrail(ctx, w, h, _ts)
    drawBall(ctx, w, h, _ts, ballPos)
    drawVelocity(ctx, w, h, ballPos)
    drawClock(ctx, w, _ts)
    drawInfoBar(ctx, w, h)
  }

  return { draw }
}
