import type { WorkshopComponent } from './types'

export interface DrawCtx {
  zoom: number
  panX: number
  panY: number
  worldToScreen: (x: number, y: number) => [number, number]
}

export type RenderMode = '3d' | '2d'

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function drawTerminals(ctx: CanvasRenderingContext2D, comp: WorkshopComponent, z: number) {
  for (const t of comp.terminals) {
    const tx = t.dx * z
    const ty = t.dy * z
    const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, 4 * z)
    grad.addColorStop(0, '#cbd5e1')
    grad.addColorStop(1, '#475569')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(tx, ty, 4 * z, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1 * z
    ctx.stroke()
  }
}
