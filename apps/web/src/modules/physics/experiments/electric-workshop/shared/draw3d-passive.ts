import type { WorkshopComponent } from './types'
import { roundRect } from './drawHelpers'
import { getResistorBandColors } from './resistorColors'

export function drawBattery3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const w = 22 * z, h = 10 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#fbbf24')
  grad.addColorStop(0.5, '#f59e0b')
  grad.addColorStop(1, '#b45309')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fde68a' : '#92400e'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#fde68a'
  ctx.font = `bold ${10 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('+', -w * 0.7, -h - 4 * z)
  ctx.fillText('âˆ’', w * 0.7, -h - 4 * z)
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${10 * z}px sans-serif`
  ctx.fillText(`${comp.value}V`, 0, 3 * z)
  if (running && Math.abs(comp.current) > 0.001) {
    ctx.fillStyle = `rgba(74,222,128,${0.3 + 0.2 * Math.sin(Date.now() / 200)})`
    ctx.font = `${8 * z}px sans-serif`
    ctx.fillText('âš¡', 0, h + 10 * z)
  }
}

export function drawResistor3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 25 * z, h = 10 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#e8dcc8')
  grad.addColorStop(0.5, '#d4c4a8')
  grad.addColorStop(1, '#b8a888')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#a5b4fc' : '#8a7a5a'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 3 * z)
  ctx.fill()
  ctx.stroke()
  const bandColors = getResistorBandColors(comp.value)
  for (let i = 0; i < 4; i++) {
    const bx = -w * 0.5 + i * w * 0.25
    ctx.fillStyle = bandColors[i]
    ctx.fillRect(bx, -h, w * 0.08, h * 2)
  }
  ctx.fillStyle = '#1e293b'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}Î©`, 0, -h - 5 * z)
}

export function drawCapacitor3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 7 * z, gap = 4 * z, h = 14 * z
  ctx.strokeStyle = sel ? '#67e8f9' : '#06b6d4'
  ctx.lineWidth = 3 * z
  const grad = ctx.createLinearGradient(-w - gap, 0, w + gap, 0)
  grad.addColorStop(0, '#22d3ee')
  grad.addColorStop(0.5, '#06b6d4')
  grad.addColorStop(1, '#0e7490')
  ctx.strokeStyle = grad
  ctx.beginPath()
  ctx.moveTo(-w - gap, -h); ctx.lineTo(-w - gap, h)
  ctx.moveTo(w + gap, -h); ctx.lineTo(w + gap, h)
  ctx.stroke()
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w * 3, 0); ctx.lineTo(-w - gap, 0)
  ctx.moveTo(w + gap, 0); ctx.lineTo(w * 3, 0)
  ctx.stroke()
  ctx.fillStyle = '#67e8f9'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}ÂµF`, 0, -h - 5 * z)
}

export function drawInductor3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const w = 25 * z, r = 6 * z
  ctx.strokeStyle = sel ? '#c084fc' : '#a855f7'
  ctx.lineWidth = 3 * z
  const coils = 4
  ctx.beginPath()
  ctx.moveTo(-w, 0)
  for (let i = 0; i < coils; i++) {
    const cx = -w + (i + 0.5) * (w * 2 / coils)
    ctx.arc(cx, 0, r, Math.PI, 0, false)
  }
  ctx.lineTo(w, 0)
  ctx.stroke()
  if (running && Math.abs(comp.current) > 0.001) {
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 10 * z
    ctx.stroke()
    ctx.shadowBlur = 0
  }
  ctx.fillStyle = '#c084fc'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}mH`, 0, -r - 8 * z)
}

export function drawDiode3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 14 * z, h = 11 * z
  const grad = ctx.createLinearGradient(-w, 0, w, 0)
  grad.addColorStop(0, '#fca5a5')
  grad.addColorStop(1, '#dc2626')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fca5a5' : '#991b1b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w, -h)
  ctx.lineTo(-w, h)
  ctx.lineTo(w, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(w, -h); ctx.lineTo(w, h)
  ctx.stroke()
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w * 2, 0); ctx.lineTo(-w, 0)
  ctx.moveTo(w, 0); ctx.lineTo(w * 2, 0)
  ctx.stroke()
  ctx.fillStyle = '#fca5a5'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}V`, 0, -h - 5 * z)
}

export function drawSwitch3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 16 * z, h = 10 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#4ade80')
  grad.addColorStop(1, '#15803d')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#86efac' : '#14532d'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 3 * z)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.moveTo(-w * 0.6, 0)
  if (comp.closed) { ctx.lineTo(w * 0.6, 0) } else { ctx.lineTo(w * 0.4, -h * 0.8) }
  ctx.stroke()
  ctx.fillStyle = comp.closed ? '#4ade80' : '#ef4444'
  ctx.beginPath()
  ctx.arc(w * 0.6, 0, 3 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = comp.closed ? '#4ade80' : '#ef4444'
  ctx.font = `bold ${8 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(comp.closed ? 'ON' : 'OFF', 0, -h - 5 * z)
}

export function drawLamp3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const r = 12 * z
  const power = running ? Math.abs(comp.voltage * comp.current) : 0
  const brightness = Math.min(1, power / 10)
  if (brightness > 0) {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3)
    grad.addColorStop(0, `rgba(253,224,71,${brightness * 0.5})`)
    grad.addColorStop(1, 'rgba(253,224,71,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(0, 0, r * 3, 0, Math.PI * 2)
    ctx.fill()
  }
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
  grad.addColorStop(0, brightness > 0 ? `rgba(253,224,71,${0.3 + brightness * 0.5})` : '#1e293b')
  grad.addColorStop(1, brightness > 0 ? `rgba(245,158,11,${brightness * 0.3})` : '#0d1117')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fde68a' : '#f59e0b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = brightness > 0 ? '#fbbf24' : '#475569'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.moveTo(-r * 0.5, -r * 0.5); ctx.lineTo(r * 0.5, r * 0.5)
  ctx.moveTo(r * 0.5, -r * 0.5); ctx.lineTo(-r * 0.5, r * 0.5)
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}V`, 0, r + 12 * z)
}

export function drawAmmeter3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const r = 13 * z
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
  grad.addColorStop(0, '#0d1526')
  grad.addColorStop(1, '#020617')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#4ade80' : '#22c55e'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#4ade80'
  ctx.font = `bold ${11 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('A', 0, 4 * z)
  const val = running ? Math.abs(comp.current).toFixed(3) : '0.000'
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${8 * z}px sans-serif`
  ctx.fillText(`${val}A`, 0, r + 12 * z)
}

export function drawVoltmeter3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const r = 13 * z
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
  grad.addColorStop(0, '#0d1526')
  grad.addColorStop(1, '#020617')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#a78bfa' : '#8b5cf6'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#a78bfa'
  ctx.font = `bold ${11 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('V', 0, 4 * z)
  const val = running ? Math.abs(comp.voltage).toFixed(2) : '0.00'
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${8 * z}px sans-serif`
  ctx.fillText(`${val}V`, 0, r + 12 * z)
}
