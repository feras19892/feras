import type { WorkshopComponent } from './types'
import { roundRect } from './drawHelpers'

export function drawMultimeter3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const w = 22 * z, h = 28 * z
  const mode = comp.multimeterMode || 'voltage'
  const bodyGrad = ctx.createLinearGradient(-w, -h, w, h)
  bodyGrad.addColorStop(0, '#1e3a5f')
  bodyGrad.addColorStop(0.5, '#0f1f3a')
  bodyGrad.addColorStop(1, '#050a18')
  ctx.fillStyle = bodyGrad
  ctx.strokeStyle = sel ? '#38bdf8' : '#0ea5e9'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill()
  ctx.stroke()
  const shineGrad = ctx.createLinearGradient(0, -h, 0, -h * 0.5)
  shineGrad.addColorStop(0, 'rgba(255,255,255,0.08)')
  shineGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = shineGrad
  roundRect(ctx, -w + 2 * z, -h + 2 * z, w * 2 - 4 * z, h * 0.5, 3 * z)
  ctx.fill()
  const lcdW = w * 1.5, lcdH = h * 0.4
  const lcdX = -lcdW / 2, lcdY = -h + 5 * z
  ctx.fillStyle = '#1a1a2e'
  roundRect(ctx, lcdX - 2 * z, lcdY - 2 * z, lcdW + 4 * z, lcdH + 4 * z, 2 * z)
  ctx.fill()
  const lcdGrad = ctx.createLinearGradient(lcdX, lcdY, lcdX, lcdY + lcdH)
  lcdGrad.addColorStop(0, '#c0c8a0')
  lcdGrad.addColorStop(1, '#a8b890')
  ctx.fillStyle = lcdGrad
  roundRect(ctx, lcdX, lcdY, lcdW, lcdH, 2 * z)
  ctx.fill()
  if (running) {
    let displayVal = '0.000'
    let displayUnit = ''
    if (mode === 'voltage') {
      const v = Math.abs(comp.voltage)
      if (v < 1e-3) { displayVal = (v * 1e6).toFixed(0); displayUnit = 'ÂµV' }
      else if (v < 1) { displayVal = (v * 1e3).toFixed(1); displayUnit = 'mV' }
      else if (v < 1000) { displayVal = v.toFixed(2); displayUnit = 'V' }
      else { displayVal = (v / 1e3).toFixed(2); displayUnit = 'kV' }
    } else if (mode === 'current') {
      const a = Math.abs(comp.current)
      if (a < 1e-3) { displayVal = (a * 1e6).toFixed(0); displayUnit = 'ÂµA' }
      else if (a < 1) { displayVal = (a * 1e3).toFixed(1); displayUnit = 'mA' }
      else { displayVal = a.toFixed(3); displayUnit = 'A' }
    } else if (mode === 'resistance') {
      const r = Math.abs(comp.current) > 1e-10 ? Math.abs(comp.voltage / comp.current) : 0
      if (r < 1) { displayVal = r.toFixed(2); displayUnit = 'Î©' }
      else if (r < 1000) { displayVal = r.toFixed(1); displayUnit = 'Î©' }
      else if (r < 1e6) { displayVal = (r / 1e3).toFixed(2); displayUnit = 'kÎ©' }
      else { displayVal = (r / 1e6).toFixed(2); displayUnit = 'MÎ©' }
    }
    ctx.fillStyle = '#1a2a1a'
    ctx.font = `bold ${9 * z}px monospace`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const valY = lcdY + lcdH / 2
    ctx.fillText(displayVal, lcdX + lcdW - 7 * z, valY)
    ctx.font = `bold ${5.5 * z}px monospace`
    ctx.textAlign = 'left'
    ctx.fillText(displayUnit, lcdX + lcdW - 6 * z, valY)
    ctx.textBaseline = 'alphabetic'
  } else {
    ctx.fillStyle = '#5a6a4a'
    ctx.font = `bold ${7 * z}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('---', lcdX + lcdW / 2, lcdY + lcdH / 2)
    ctx.textBaseline = 'alphabetic'
  }
  const dialY = h * 0.35
  const dialR = 8 * z
  const dialGrad = ctx.createRadialGradient(0, dialY, 0, 0, dialY, dialR)
  dialGrad.addColorStop(0, '#334155')
  dialGrad.addColorStop(1, '#1e293b')
  ctx.fillStyle = dialGrad
  ctx.beginPath()
  ctx.arc(0, dialY, dialR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1 * z
  ctx.stroke()
  const modes = [
    { label: 'V', angle: -Math.PI / 2, color: mode === 'voltage' ? '#38bdf8' : '#64748b' },
    { label: 'A', angle: 0, color: mode === 'current' ? '#38bdf8' : '#64748b' },
    { label: 'Î©', angle: Math.PI / 2, color: mode === 'resistance' ? '#38bdf8' : '#64748b' },
  ]
  for (const m of modes) {
    const lx = Math.cos(m.angle) * (dialR + 4 * z)
    const ly = dialY + Math.sin(m.angle) * (dialR + 4 * z)
    ctx.fillStyle = m.color
    ctx.font = `bold ${5 * z}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(m.label, lx, ly + 2 * z)
  }
  const activeAngle = mode === 'voltage' ? -Math.PI / 2 : mode === 'current' ? 0 : Math.PI / 2
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.moveTo(0, dialY)
  ctx.lineTo(Math.cos(activeAngle) * dialR * 0.7, dialY + Math.sin(activeAngle) * dialR * 0.7)
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'
  ctx.beginPath()
  ctx.arc(0, dialY, 1.5 * z, 0, Math.PI * 2)
  ctx.fill()
  const jackY = h - 3 * z
  const jackR = 3 * z
  const redGrad = ctx.createRadialGradient(-8 * z, jackY, 0, -8 * z, jackY, jackR)
  redGrad.addColorStop(0, '#fca5a5')
  redGrad.addColorStop(1, '#dc2626')
  ctx.fillStyle = redGrad
  ctx.beginPath()
  ctx.arc(-8 * z, jackY, jackR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#7f1d1d'
  ctx.lineWidth = 1 * z
  ctx.stroke()
  const blackGrad = ctx.createRadialGradient(8 * z, jackY, 0, 8 * z, jackY, jackR)
  blackGrad.addColorStop(0, '#64748b')
  blackGrad.addColorStop(1, '#1e293b')
  ctx.fillStyle = blackGrad
  ctx.beginPath()
  ctx.arc(8 * z, jackY, jackR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1 * z
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'
  ctx.font = `bold ${4 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('DMM', 0, -h + 3 * z)
}
