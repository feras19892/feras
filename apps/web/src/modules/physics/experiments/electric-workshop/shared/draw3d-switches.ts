import type { WorkshopComponent } from './types'
import { roundRect } from './drawHelpers'

export function drawRelay3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 28 * z, h = 18 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#a16207')
  grad.addColorStop(0.5, '#92400e')
  grad.addColorStop(1, '#451a03')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fbbf24' : '#451a03'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 1 * z
  ctx.beginPath()
  ctx.moveTo(-w * 0.9, 0); ctx.lineTo(w * 0.9, 0)
  ctx.stroke()
  const a1x = -w, a1y = -h
  const a2x = w, a2y = -h
  const comx = -w, comy = h
  const nox = w, noy = h
  const ncx = 0, ncy = h
  ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2 * z
  ctx.beginPath(); ctx.moveTo(a1x, a1y); ctx.lineTo(a1x, -h * 0.3); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(a2x, a2y); ctx.lineTo(a2x, -h * 0.3); ctx.stroke()
  const coilStart = -w * 0.35, coilEnd = w * 0.35, coilY = -h * 0.3
  const coilW = coilEnd - coilStart
  const bumps = 4
  ctx.beginPath()
  ctx.moveTo(coilStart, coilY)
  for (let i = 0; i < bumps; i++) {
    const cx = coilStart + coilW * (i + 0.5) / bumps
    ctx.arc(cx, coilY, coilW / (bumps * 2), Math.PI, 0, false)
  }
  ctx.stroke()
  ctx.beginPath(); ctx.moveTo(coilStart, coilY); ctx.lineTo(a1x, coilY); ctx.lineTo(a1x, -h * 0.3); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(coilEnd, coilY); ctx.lineTo(a2x, coilY); ctx.lineTo(a2x, -h * 0.3); ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${7 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('A1', a1x, a1y - 4 * z)
  ctx.fillText('A2', a2x, a2y - 4 * z)
  const pivotX = -w * 0.35, pivotY = h * 0.3
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2 * z
  ctx.beginPath(); ctx.moveTo(comx, comy); ctx.lineTo(comx, pivotY); ctx.lineTo(pivotX, pivotY); ctx.stroke()
  const noContactX = w * 0.35, noContactY = h * 0.1
  const ncContactX = w * 0.35, ncContactY = h * 0.5
  ctx.beginPath(); ctx.moveTo(noContactX, noContactY); ctx.lineTo(nox, noContactY); ctx.lineTo(nox, noy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ncContactX, ncContactY); ctx.lineTo(ncx, ncContactY); ctx.lineTo(ncx, ncy); ctx.stroke()
  ctx.fillStyle = '#64748b'
  ctx.beginPath(); ctx.arc(noContactX, noContactY, 2.5 * z, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(ncContactX, ncContactY, 2.5 * z, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(pivotX, pivotY, 2.5 * z, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = comp.relayState ? '#4ade80' : '#ef4444'
  ctx.lineWidth = 2.5 * z
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(pivotX, pivotY)
  if (comp.relayState) { ctx.lineTo(noContactX, noContactY) } else { ctx.lineTo(ncContactX, ncContactY) }
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${6 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('COM', comx, comy + 8 * z)
  ctx.fillText('NO', nox, noy + 8 * z)
  ctx.fillText('NC', ncx, ncy + 8 * z)
  ctx.fillStyle = comp.relayState ? '#4ade80' : '#ef4444'
  ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(comp.relayState ? 'ENG' : 'IDLE', 0, -h - 5 * z)
}

export function drawBreaker3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 18 * z, h = 11 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#64748b')
  grad.addColorStop(0.5, '#475569')
  grad.addColorStop(1, '#1e293b')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#94a3b8' : '#0f172a'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 3 * z)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = comp.breakerTripped ? '#ef4444' : '#22c55e'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.moveTo(0, h * 0.5)
  if (comp.breakerTripped) { ctx.lineTo(w * 0.5, -h * 0.3) } else { ctx.lineTo(0, -h * 0.5) }
  ctx.stroke()
  ctx.fillStyle = comp.breakerTripped ? '#ef4444' : '#22c55e'
  ctx.font = `bold ${8 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}A`, 0, -h - 5 * z)
  ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(comp.breakerTripped ? 'TRIPPED' : 'MCB', 0, h + 10 * z)
}

export function drawFuse3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 22 * z, h = 7 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, 'rgba(226,232,240,0.3)')
  grad.addColorStop(1, 'rgba(100,116,139,0.3)')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#e2e8f0' : '#94a3b8'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, h)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = comp.fuseBlown ? '#ef4444' : '#fbbf24'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  if (comp.fuseBlown) {
    ctx.moveTo(-w * 0.8, 0); ctx.lineTo(-w * 0.2, 0)
    ctx.moveTo(w * 0.2, 0); ctx.lineTo(w * 0.8, 0)
  } else {
    ctx.moveTo(-w * 0.8, 0); ctx.lineTo(w * 0.8, 0)
  }
  ctx.stroke()
  ctx.fillStyle = comp.fuseBlown ? '#ef4444' : '#94a3b8'
  ctx.font = `bold ${8 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}A`, 0, -h - 5 * z)
}

export function drawGround3D(ctx: CanvasRenderingContext2D, z: number, _comp: WorkshopComponent, sel: boolean) {
  const w = 12 * z
  ctx.strokeStyle = sel ? '#86efac' : '#22c55e'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.moveTo(0, -10 * z); ctx.lineTo(0, 0)
  ctx.moveTo(-w, 0); ctx.lineTo(w, 0)
  ctx.moveTo(-w * 0.7, 6 * z); ctx.lineTo(w * 0.7, 6 * z)
  ctx.moveTo(-w * 0.4, 12 * z); ctx.lineTo(w * 0.4, 12 * z)
  ctx.stroke()
}
