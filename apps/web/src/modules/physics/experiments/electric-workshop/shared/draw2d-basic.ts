import type { WorkshopComponent } from './types'

export function drawBattery2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const w = 20 * z
  ctx.strokeStyle = sel ? '#fde68a' : '#f59e0b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w, 0); ctx.lineTo(-w * 0.3, 0)
  ctx.lineTo(-w * 0.3, -10 * z); ctx.lineTo(w * 0.3, -10 * z)
  ctx.lineTo(w * 0.3, 0); ctx.lineTo(w, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-w * 0.3, 0); ctx.lineTo(-w * 0.3, 10 * z)
  ctx.lineTo(w * 0.3, 10 * z); ctx.lineTo(w * 0.3, 0)
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${10 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}V`, 0, -16 * z)
  ctx.font = `${8 * z}px sans-serif`; ctx.fillStyle = '#94a3b8'
  ctx.fillText('+', -w * 0.6, -14 * z)
  ctx.fillText('âˆ’', w * 0.6, -14 * z)
  if (running && Math.abs(comp.current) > 0.001) {
    ctx.fillStyle = `rgba(74,222,128,${0.3 + 0.2 * Math.sin(Date.now() / 200)})`
    ctx.font = `${8 * z}px sans-serif`
    ctx.fillText('âš¡', 0, 16 * z)
  }
}

export function drawResistor2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 30 * z, h = 8 * z
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w, 0); ctx.lineTo(-w * 0.75, 0)
  ctx.moveTo(w * 0.75, 0); ctx.lineTo(w, 0)
  ctx.stroke()
  ctx.strokeStyle = sel ? '#a5b4fc' : '#6366f1'
  ctx.lineWidth = 2.5 * z
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(-w * 0.75, 0)
  ctx.lineTo(-w * 0.6, -h)
  ctx.lineTo(-w * 0.4, h)
  ctx.lineTo(-w * 0.2, -h)
  ctx.lineTo(0, h)
  ctx.lineTo(w * 0.2, -h)
  ctx.lineTo(w * 0.4, h)
  ctx.lineTo(w * 0.6, -h)
  ctx.lineTo(w * 0.75, 0)
  ctx.stroke()
  ctx.fillStyle = sel ? '#a5b4fc' : '#818cf8'; ctx.font = `bold ${9 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}Î©`, 0, -h - 5 * z)
}

export function drawCapacitor2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 7 * z, gap = 4 * z, h = 14 * z
  ctx.strokeStyle = sel ? '#67e8f9' : '#06b6d4'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.moveTo(-w - gap, -h); ctx.lineTo(-w - gap, h)
  ctx.moveTo(w + gap, -h); ctx.lineTo(w + gap, h)
  ctx.stroke()
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w * 3, 0); ctx.lineTo(-w - gap, 0)
  ctx.moveTo(w + gap, 0); ctx.lineTo(w * 3, 0)
  ctx.stroke()
  ctx.fillStyle = '#67e8f9'; ctx.font = `bold ${9 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}ÂµF`, 0, -h - 5 * z)
}

export function drawInductor2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const w = 25 * z, r = 6 * z
  ctx.strokeStyle = sel ? '#c084fc' : '#a855f7'
  ctx.lineWidth = 2 * z
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
    ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 8 * z; ctx.stroke(); ctx.shadowBlur = 0
  }
  ctx.fillStyle = '#c084fc'; ctx.font = `bold ${9 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}mH`, 0, -r - 8 * z)
}

export function drawDiode2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
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
  ctx.fillStyle = '#fca5a5'; ctx.font = `bold ${9 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}V`, 0, -h - 5 * z)
}

export function drawSwitch2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 18 * z
  ctx.strokeStyle = sel ? '#86efac' : '#22c55e'
  ctx.lineWidth = 2 * z
  ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-8 * z, 0); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-8 * z, 0)
  if (comp.closed) { ctx.lineTo(8 * z, 0) } else { ctx.lineTo(6 * z, -14 * z) }
  ctx.stroke()
  ctx.beginPath(); ctx.arc(8 * z, 0, 3 * z, 0, Math.PI * 2)
  ctx.fillStyle = '#0d1117'; ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(8 * z, 0); ctx.lineTo(w, 0); ctx.stroke()
  ctx.fillStyle = comp.closed ? '#4ade80' : '#ef4444'
  ctx.font = `bold ${9 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(comp.closed ? 'ON' : 'OFF', 0, -20 * z)
}

export function drawLamp2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const r = 14 * z
  const power = running ? Math.abs(comp.voltage * comp.current) : 0
  const brightness = Math.min(1, power / 10)
  if (brightness > 0) {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.5)
    grad.addColorStop(0, `rgba(253,224,71,${brightness * 0.4})`)
    grad.addColorStop(1, 'rgba(253,224,71,0)')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.strokeStyle = sel ? '#fde68a' : '#f59e0b'
  ctx.lineWidth = 2 * z
  ctx.fillStyle = brightness > 0 ? `rgba(253,224,71,${brightness * 0.3})` : '#0d1117'
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = brightness > 0 ? '#fbbf24' : '#475569'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.moveTo(-r * 0.6, -r * 0.6); ctx.lineTo(r * 0.6, r * 0.6)
  ctx.moveTo(r * 0.6, -r * 0.6); ctx.lineTo(-r * 0.6, r * 0.6)
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${9 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}V`, 0, r + 12 * z)
}

export function drawAmmeter2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const r = 16 * z
  ctx.strokeStyle = sel ? '#4ade80' : '#22c55e'
  ctx.lineWidth = 2 * z
  ctx.fillStyle = '#0d1117'
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#4ade80'; ctx.font = `bold ${12 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('A', 0, 4 * z)
  const val = running ? Math.abs(comp.current).toFixed(3) : '0.000'
  ctx.fillStyle = '#94a3b8'; ctx.font = `${8 * z}px sans-serif`
  ctx.fillText(`${val}A`, 0, r + 12 * z)
}

export function drawVoltmeter2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const r = 16 * z
  ctx.strokeStyle = sel ? '#a78bfa' : '#8b5cf6'
  ctx.lineWidth = 2 * z
  ctx.fillStyle = '#0d1117'
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#a78bfa'; ctx.font = `bold ${12 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('V', 0, 4 * z)
  const val = running ? Math.abs(comp.voltage).toFixed(2) : '0.00'
  ctx.fillStyle = '#94a3b8'; ctx.font = `${8 * z}px sans-serif`
  ctx.fillText(`${val}V`, 0, r + 12 * z)
}
