import type { WorkshopComponent } from './types'
import { roundRect } from './drawHelpers'

export function drawLED(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const Vf = comp.value || 2
  const isOn = running && Math.abs(comp.current) > 0.001

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-14 * z, 0)
  ctx.lineTo(-8 * z, 0)
  ctx.moveTo(8 * z, 0)
  ctx.lineTo(14 * z, 0)
  ctx.stroke()

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12 * z)
  if (isOn) {
    grad.addColorStop(0, '#fca5a5')
    grad.addColorStop(0.5, '#ef4444')
    grad.addColorStop(1, '#991b1b')
  } else {
    grad.addColorStop(0, '#475569')
    grad.addColorStop(0.5, '#334155')
    grad.addColorStop(1, '#1e293b')
  }
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(0, 0, 10 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = sel ? '#0ea5e9' : '#1e293b'
  ctx.lineWidth = 1.5 * z
  ctx.stroke()

  if (isOn) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.arc(-3 * z, -3 * z, 3 * z, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#64748b'
  ctx.font = `${8 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${Vf}V`, 0, 20 * z)
}

export function drawPotentiometer(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const R = comp.value || 1000

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-25 * z, 0)
  ctx.lineTo(-18 * z, 0)
  ctx.moveTo(18 * z, 0)
  ctx.lineTo(25 * z, 0)
  ctx.moveTo(0, 25 * z)
  ctx.lineTo(0, 18 * z)
  ctx.stroke()

  ctx.fillStyle = '#f59e0b'
  ctx.strokeStyle = sel ? '#0ea5e9' : '#92400e'
  ctx.lineWidth = 1.5 * z
  roundRect(ctx, -18 * z, -12 * z, 36 * z, 24 * z, 4 * z)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.arc(0, 0, 6 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, 14 * z)
  ctx.stroke()

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${R}Ω`, 0, -16 * z)
}

export function drawMotor(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const V = comp.value || 6
  const isRunning = running && Math.abs(comp.current) > 0.001

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-22 * z, 0)
  ctx.lineTo(-16 * z, 0)
  ctx.moveTo(16 * z, 0)
  ctx.lineTo(22 * z, 0)
  ctx.stroke()

  const grad = ctx.createRadialGradient(-3 * z, -3 * z, 0, 0, 0, 16 * z)
  grad.addColorStop(0, '#94a3b8')
  grad.addColorStop(0.7, '#64748b')
  grad.addColorStop(1, '#334155')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#0ea5e9' : '#1e293b'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.arc(0, 0, 14 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  if (isRunning) {
    const angle = (Date.now() / 50) % (Math.PI * 2)
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2 * z
    for (let i = 0; i < 3; i++) {
      const a = angle + (i * Math.PI * 2 / 3)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * 10 * z, Math.sin(a) * 10 * z)
      ctx.stroke()
    }
  } else {
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 2 * z
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * 10 * z, Math.sin(a) * 10 * z)
      ctx.stroke()
    }
  }

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('M', 0, 3 * z)
  ctx.fillText(`${V}V`, 0, 24 * z)
}

export function drawThermistor(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const R = comp.value || 10000

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-25 * z, 0)
  ctx.lineTo(-18 * z, 0)
  ctx.moveTo(18 * z, 0)
  ctx.lineTo(25 * z, 0)
  ctx.stroke()

  ctx.fillStyle = '#f97316'
  ctx.strokeStyle = sel ? '#0ea5e9' : '#9a3412'
  ctx.lineWidth = 1.5 * z
  roundRect(ctx, -18 * z, -10 * z, 36 * z, 20 * z, 4 * z)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-12 * z, -4 * z)
  ctx.lineTo(-6 * z, 4 * z)
  ctx.lineTo(0, -4 * z)
  ctx.lineTo(6 * z, 4 * z)
  ctx.lineTo(12 * z, -4 * z)
  ctx.stroke()

  ctx.strokeStyle = '#dc2626'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.moveTo(-14 * z, -12 * z)
  ctx.lineTo(-8 * z, -16 * z)
  ctx.stroke()

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${R >= 1000 ? (R / 1000) + 'k' : R}Ω`, 0, 22 * z)
}

export function drawBuzzer(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const isOn = running && Math.abs(comp.current) > 0.001

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-14 * z, 0)
  ctx.lineTo(-10 * z, 0)
  ctx.moveTo(10 * z, 0)
  ctx.lineTo(14 * z, 0)
  ctx.stroke()

  const grad = ctx.createRadialGradient(-3 * z, -3 * z, 0, 0, 0, 12 * z)
  if (isOn) {
    grad.addColorStop(0, '#fde047')
    grad.addColorStop(0.7, '#eab308')
    grad.addColorStop(1, '#a16207')
  } else {
    grad.addColorStop(0, '#94a3b8')
    grad.addColorStop(0.7, '#64748b')
    grad.addColorStop(1, '#334155')
  }
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#0ea5e9' : '#1e293b'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.arc(0, 0, 10 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = isOn ? '#fff' : '#475569'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.arc(0, 0, 6 * z, -Math.PI / 4, Math.PI / 4)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 6 * z, Math.PI - Math.PI / 4, Math.PI + Math.PI / 4)
  ctx.stroke()

  if (isOn) {
    const t = Date.now() / 100
    for (let i = 0; i < 3; i++) {
      const r = 12 * z + ((t + i * 4) % 10) * z
      ctx.strokeStyle = `rgba(234,179,8,${Math.max(0, 0.5 - (r - 12 * z) / (10 * z) * 0.5)})`
      ctx.lineWidth = 1.5 * z
      ctx.beginPath()
      ctx.arc(0, 0, r, -Math.PI / 4, Math.PI / 4)
      ctx.stroke()
    }
  }

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}Ω`, 0, 24 * z)
}

export function drawSolarCell(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const V = comp.value || 5

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-22 * z, 0)
  ctx.lineTo(-18 * z, 0)
  ctx.moveTo(18 * z, 0)
  ctx.lineTo(22 * z, 0)
  ctx.stroke()

  ctx.fillStyle = '#1e40af'
  ctx.strokeStyle = sel ? '#0ea5e9' : '#1e293b'
  ctx.lineWidth = 1.5 * z
  roundRect(ctx, -18 * z, -12 * z, 36 * z, 24 * z, 3 * z)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 1 * z
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 10 * z, -12 * z)
    ctx.lineTo(i * 10 * z, 12 * z)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(-18 * z, 0)
  ctx.lineTo(18 * z, 0)
  ctx.stroke()

  ctx.fillStyle = '#fbbf24'
  ctx.font = `${10 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('☀', 0, -16 * z)

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${V}V`, 0, 22 * z)
}
