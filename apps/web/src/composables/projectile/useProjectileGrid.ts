import type { ProjectileParams } from '../../modules/physics/experiments/projectile/useProjectilePhysics'

interface ScreenTransform {
  margin: number
  groundY: number
  scale: number
}

export function useProjectileGrid(params: ProjectileParams) {
  function toScreen(w: number, h: number, x: number, y: number) {
    const margin = 50
    const groundY = h - margin
    const rad = (params.angleDeg * Math.PI) / 180
    const v0 = params.v0
    const g = params.g
    const R = (v0 * v0 * Math.sin(2 * rad)) / g
    const H = (Math.pow(v0 * Math.sin(rad), 2)) / (2 * g)
    const maxX = params.targetMode && params.targetVisible ? Math.max(params.targetX * 1.5, R * 1.6, 80) : Math.max(R * 1.6, 50)
    const maxY = params.targetMode && params.targetVisible ? Math.max(H * 1.6, params.targetX * 0.3, 30) : Math.max(H * 1.6, 30)
    const scaleX = (w - margin * 2) / maxX
    const scaleY = (groundY - margin * 2) / maxY
    const scale = Math.min(scaleX, scaleY)
    const sx = margin + x * scale
    const sy = groundY - y * scale
    return { sx, sy, scale, margin, groundY }
  }

  function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, _ts: ScreenTransform) {
    const { margin, groundY } = _ts
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

  function drawAxes(ctx: CanvasRenderingContext2D, w: number, h: number, _ts: ScreenTransform) {
    const { margin, groundY } = _ts
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(margin, groundY); ctx.lineTo(w - margin, groundY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(margin, margin); ctx.lineTo(margin, groundY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(w - margin, groundY); ctx.lineTo(w - margin - 10, groundY - 4); ctx.lineTo(w - margin - 10, groundY + 4); ctx.closePath(); ctx.fillStyle = '#475569'; ctx.fill()
    ctx.beginPath(); ctx.moveTo(margin, margin); ctx.lineTo(margin - 4, margin + 10); ctx.lineTo(margin + 4, margin + 10); ctx.closePath(); ctx.fillStyle = '#475569'; ctx.fill()
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('X (m)', w - margin - 15, groundY + 15)
    ctx.fillText('Y (m)', margin - 15, margin + 15)
  }

  function screenToWorld(w: number, h: number, sx: number, sy: number) {
    const ts = toScreen(w, h, 0, 0)
    const x = (sx - ts.margin) / ts.scale
    const y = (ts.groundY - sy) / ts.scale
    return { x, y, scale: ts.scale, margin: ts.margin, groundY: ts.groundY }
  }

  return { toScreen, screenToWorld, drawGrid, drawAxes }
}
