import type { WorkshopComponent } from './types'
import { roundRect } from './drawHelpers'

// ─── 2D ───

export function drawZener2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 12 * z, h = 10 * z
  ctx.strokeStyle = sel ? '#fca5a5' : '#dc2626'
  ctx.lineWidth = 2 * z
  ctx.fillStyle = sel ? '#fca5a5' : '#dc2626'
  ctx.beginPath()
  ctx.moveTo(-w, -h); ctx.lineTo(-w, h); ctx.lineTo(w, 0); ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(w, -h); ctx.lineTo(w, h); ctx.stroke()
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w * 2, 0); ctx.lineTo(-w, 0)
  ctx.moveTo(w, 0); ctx.lineTo(w * 2, 0)
  ctx.stroke()
  ctx.strokeStyle = sel ? '#fca5a5' : '#dc2626'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w * 0.5, -h); ctx.lineTo(-w * 0.5, h)
  ctx.stroke()
  ctx.fillStyle = '#fca5a5'; ctx.font = `bold ${9 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}V`, 0, -h - 5 * z)
  ctx.font = `${7 * z}px sans-serif`; ctx.fillStyle = '#94a3b8'
  ctx.fillText('Zener', 0, h + 12 * z)
}

export function drawNPN2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 18 * z, h = 16 * z
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w, 0); ctx.lineTo(-w * 0.3, 0)
  ctx.stroke()
  ctx.strokeStyle = sel ? '#93c5fd' : '#3b82f6'
  ctx.lineWidth = 2.5 * z
  ctx.beginPath()
  ctx.moveTo(-w * 0.3, -h * 0.5); ctx.lineTo(-w * 0.3, h * 0.5)
  ctx.stroke()
  ctx.strokeStyle = sel ? '#93c5fd' : '#3b82f6'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w * 0.3, -h * 0.2); ctx.lineTo(w, -h * 0.6)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-w * 0.3, h * 0.2); ctx.lineTo(w, h * 0.6)
  ctx.stroke()
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(w, -h * 0.6); ctx.lineTo(w * 1.3, -h * 0.6)
  ctx.moveTo(w, h * 0.6); ctx.lineTo(w * 1.3, h * 0.6)
  ctx.stroke()
  ctx.strokeStyle = sel ? '#93c5fd' : '#3b82f6'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.moveTo(w * 0.6, h * 0.6); ctx.lineTo(w * 0.2, h * 1.1)
  ctx.stroke()
  ctx.fillStyle = '#3b82f6'
  ctx.beginPath()
  ctx.moveTo(w * 0.2, h * 1.1)
  ctx.lineTo(w * 0.45, h * 0.95)
  ctx.lineTo(w * 0.35, h * 1.25)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = sel ? '#93c5fd' : '#60a5fa'; ctx.font = `bold ${8 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('NPN', 0, -h - 5 * z)
  ctx.fillStyle = '#94a3b8'; ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(`β=${comp.beta ?? 100}`, 0, h * 1.5)
}

export function drawPNP2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 18 * z, h = 16 * z
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w, 0); ctx.lineTo(-w * 0.3, 0)
  ctx.stroke()
  ctx.strokeStyle = sel ? '#fca5a5' : '#ef4444'
  ctx.lineWidth = 2.5 * z
  ctx.beginPath()
  ctx.moveTo(-w * 0.3, -h * 0.5); ctx.lineTo(-w * 0.3, h * 0.5)
  ctx.stroke()
  ctx.strokeStyle = sel ? '#fca5a5' : '#ef4444'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w * 0.3, -h * 0.2); ctx.lineTo(w, -h * 0.6)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-w * 0.3, h * 0.2); ctx.lineTo(w, h * 0.6)
  ctx.stroke()
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(w, -h * 0.6); ctx.lineTo(w * 1.3, -h * 0.6)
  ctx.moveTo(w, h * 0.6); ctx.lineTo(w * 1.3, h * 0.6)
  ctx.stroke()
  ctx.strokeStyle = sel ? '#fca5a5' : '#ef4444'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.moveTo(w * 0.2, h * 1.1); ctx.lineTo(w * 0.6, h * 0.6)
  ctx.stroke()
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.moveTo(w * 0.6, h * 0.6)
  ctx.lineTo(w * 0.35, h * 0.95)
  ctx.lineTo(w * 0.45, h * 0.75)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = sel ? '#fca5a5' : '#f87171'; ctx.font = `bold ${8 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('PNP', 0, -h - 5 * z)
  ctx.fillStyle = '#94a3b8'; ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(`β=${comp.beta ?? 100}`, 0, h * 1.5)
}

export function drawOpAmp2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 24 * z, h = 18 * z
  ctx.strokeStyle = sel ? '#6ee7b7' : '#10b981'
  ctx.lineWidth = 2 * z
  ctx.fillStyle = '#0d1117'
  ctx.beginPath()
  ctx.moveTo(-w, -h)
  ctx.lineTo(-w, h)
  ctx.lineTo(w, 0)
  ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = sel ? '#6ee7b7' : '#34d399'
  ctx.font = `bold ${10 * z}px sans-serif`; ctx.textAlign = 'left'
  ctx.fillText('−', -w * 0.6, -h * 0.35)
  ctx.fillText('+', -w * 0.6, h * 0.55)
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w, -h * 0.5); ctx.lineTo(-w * 1.3, -h * 0.5)
  ctx.moveTo(-w, h * 0.5); ctx.lineTo(-w * 1.3, h * 0.5)
  ctx.moveTo(w, 0); ctx.lineTo(w * 1.3, 0)
  ctx.stroke()
  ctx.fillStyle = sel ? '#6ee7b7' : '#34d399'; ctx.font = `bold ${7 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('OP', 0, 3 * z)
  ctx.fillStyle = '#94a3b8'; ctx.font = `${6 * z}px sans-serif`
  ctx.fillText(`A=${(comp.opampGain ?? 100000).toExponential(0)}`, 0, h + 10 * z)
}

// ─── 3D ───

export function drawZener3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 14 * z, h = 10 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#fca5a5')
  grad.addColorStop(0.5, '#ef4444')
  grad.addColorStop(1, '#991b1b')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fbbf24' : '#991b1b'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 3 * z)
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#fca5a5'; ctx.font = `bold ${9 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}V`, 0, 3 * z)
  ctx.font = `${7 * z}px sans-serif`; ctx.fillStyle = '#94a3b8'
  ctx.fillText('Zener', 0, h + 10 * z)
}

export function drawNPN3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 22 * z, h = 16 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#60a5fa')
  grad.addColorStop(0.5, '#3b82f6')
  grad.addColorStop(1, '#1e40af')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fbbf24' : '#1e40af'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#dbeafe'; ctx.font = `bold ${10 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('NPN', 0, -h - 5 * z)
  ctx.fillStyle = '#93c5fd'; ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(`β=${comp.beta ?? 100}`, 0, 3 * z)
  ctx.fillStyle = '#60a5fa'; ctx.font = `${6 * z}px sans-serif`
  ctx.fillText('B', -w + 8 * z, h + 10 * z)
  ctx.fillText('C', w - 8 * z, -h * 0.3)
  ctx.fillText('E', w - 8 * z, h * 0.6)
}

export function drawPNP3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 22 * z, h = 16 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#fca5a5')
  grad.addColorStop(0.5, '#ef4444')
  grad.addColorStop(1, '#991b1b')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fbbf24' : '#991b1b'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#fee2e2'; ctx.font = `bold ${10 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('PNP', 0, -h - 5 * z)
  ctx.fillStyle = '#fca5a5'; ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(`β=${comp.beta ?? 100}`, 0, 3 * z)
  ctx.fillStyle = '#f87171'; ctx.font = `${6 * z}px sans-serif`
  ctx.fillText('B', -w + 8 * z, h + 10 * z)
  ctx.fillText('C', w - 8 * z, -h * 0.3)
  ctx.fillText('E', w - 8 * z, h * 0.6)
}

export function drawOpAmp3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 28 * z, h = 20 * z
  const grad = ctx.createLinearGradient(-w, 0, w, 0)
  grad.addColorStop(0, '#34d399')
  grad.addColorStop(0.5, '#10b981')
  grad.addColorStop(1, '#047857')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fbbf24' : '#047857'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w, -h)
  ctx.lineTo(-w, h)
  ctx.lineTo(w, 0)
  ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#d1fae5'; ctx.font = `bold ${11 * z}px sans-serif`; ctx.textAlign = 'left'
  ctx.fillText('−', -w * 0.6, -h * 0.3)
  ctx.fillText('+', -w * 0.6, h * 0.6)
  ctx.fillStyle = '#a7f3d0'; ctx.font = `bold ${8 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('OP', 0, 3 * z)
  ctx.fillStyle = '#6ee7b7'; ctx.font = `${6 * z}px sans-serif`
  ctx.fillText(`A=${(comp.opampGain ?? 100000).toExponential(0)}`, 0, h + 10 * z)
}
