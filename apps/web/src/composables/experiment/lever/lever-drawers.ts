import type { LeverState } from '../../../modules/physics/experiments/lever/useLeverPhysics'
import { uniqueColorPerId } from '../../lever/leverUtils'

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h))
  grad.addColorStop(0, '#1e293b')
  grad.addColorStop(1, '#0f172a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(148,163,184,0.06)'
  const spacing = 30
  for (let x = 0; x < w; x += spacing) {
    for (let y = 0; y < h; y += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

export function drawRuler(ctx: CanvasRenderingContext2D, scale: number, tilt: number, beamLength: number) {
  const step = 1
  const half = beamLength / 2
  ctx.fillStyle = 'rgba(148,163,184,0.5)'
  for (let x = -half; x <= half + 0.001; x += step) {
    const px = x * scale
    const isMajor = Math.abs(x) % 1 < 0.001
    const tickH = isMajor ? 8 : 4
    ctx.fillRect(px - 0.5, 5, 1, tickH)
  }
  ctx.fillStyle = 'rgba(148,163,184,0.65)'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (let x = -half; x <= half + 0.001; x += step) {
    const isMajor = Math.abs(x) % 1 < 0.001
    if (!isMajor) continue
    const px = x * scale
    ctx.save()
    ctx.translate(px, 16)
    ctx.rotate(-tilt)
    ctx.fillText(Math.abs(x) < 0.01 ? '0' : String(Math.abs(x)), 0, 0)
    ctx.restore()
  }
}

export function drawFloor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const floorY = h - 20
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, floorY)
  ctx.lineTo(w - 40, floorY)
  ctx.stroke()
}

export function drawBeam(ctx: CanvasRenderingContext2D, halfLen: number) {
  const beamGrad = ctx.createLinearGradient(0, -4, 0, 4)
  beamGrad.addColorStop(0, '#475569')
  beamGrad.addColorStop(0.3, '#94a3b8')
  beamGrad.addColorStop(0.7, '#64748b')
  beamGrad.addColorStop(1, '#334155')
  ctx.strokeStyle = beamGrad
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-halfLen, 0)
  ctx.lineTo(halfLen, 0)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(-halfLen, -2)
  ctx.lineTo(halfLen, -2)
  ctx.stroke()
}

export function drawPivot(ctx: CanvasRenderingContext2D) {
  const baseW = 18
  const baseH = 22
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-baseW / 2 + 3, baseH + 3)
  ctx.lineTo(baseW / 2 + 3, baseH + 3)
  ctx.closePath()
  ctx.fill()

  const pGrad = ctx.createLinearGradient(-baseW / 2, 0, baseW / 2, 0)
  pGrad.addColorStop(0, '#b45309')
  pGrad.addColorStop(0.3, '#fbbf24')
  pGrad.addColorStop(0.7, '#d97706')
  pGrad.addColorStop(1, '#92400e')
  ctx.fillStyle = pGrad
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-baseW / 2, baseH)
  ctx.lineTo(baseW / 2, baseH)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, 2)
  ctx.lineTo(-baseW / 4, baseH - 4)
  ctx.stroke()
}

function adjustBrightness(hslStr: string, delta: number): string {
  const match = hslStr.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return hslStr
  const h = match[1], s = match[2]
  let l = parseInt(match[3]) + delta
  l = Math.max(10, Math.min(90, l))
  return `hsl(${h}, ${s}%, ${l}%)`
}

export function drawBall(ctx: CanvasRenderingContext2D, b: LeverState['balls'][0], scale: number, tilt: number) {
  const px = b.x * scale
  const r = 8 + b.mass * 4
  const by = -r - 6
  const uc = uniqueColorPerId(b.id)

  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(px, 3, r * 0.8, r * 0.25, 0, 0, Math.PI * 2)
  ctx.fill()

  const bGrad = ctx.createRadialGradient(px - r * 0.3, by - r * 0.3, r * 0.1, px, by, r)
  bGrad.addColorStop(0, '#fff')
  bGrad.addColorStop(0.2, uc)
  bGrad.addColorStop(1, adjustBrightness(uc, -40))
  ctx.fillStyle = bGrad
  ctx.beginPath()
  ctx.arc(px, by, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(px, by, r - 1, Math.PI * 1.1, Math.PI * 1.6)
  ctx.stroke()

  ctx.save()
  ctx.translate(px, by)
  ctx.rotate(-tilt)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 4
  ctx.fillText(b.isUnknown ? '?' : String(b.mass), 0, 0)
  ctx.shadowBlur = 0
  ctx.restore()
}

export function drawForce(ctx: CanvasRenderingContext2D, f: LeverState['forces'][0], scale: number) {
  const px = f.x * scale
  const arrowLen = (f.force / 100) * 60
  const isDown = f.direction === 1
  const endY = isDown ? arrowLen + 20 : -arrowLen - 20
  const uc = uniqueColorPerId(f.id)

  ctx.save()
  ctx.shadowColor = uc
  ctx.shadowBlur = 12
  ctx.strokeStyle = uc
  ctx.fillStyle = uc
  ctx.lineWidth = 3
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(px, -10)
  ctx.lineTo(px, endY)
  ctx.stroke()
  ctx.restore()

  const headSize = 8
  const headY = isDown ? endY - headSize : endY + headSize
  ctx.fillStyle = uc
  ctx.beginPath()
  ctx.moveTo(px, endY)
  ctx.lineTo(px - headSize / 2, headY)
  ctx.lineTo(px + headSize / 2, headY)
  ctx.closePath()
  ctx.fill()

  ctx.setLineDash([3, 4])
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(px, 0)
  ctx.lineTo(px, endY)
  ctx.stroke()
  ctx.setLineDash([])

  const labelY = isDown ? endY + 14 : endY - 14
  const text = f.isUnknown ? '?' : `${f.force}N`
  ctx.font = 'bold 10px sans-serif'
  const tw = ctx.measureText(text).width
  ctx.fillStyle = 'rgba(15,23,42,0.7)'
  ctx.beginPath()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(ctx as any).roundRect(px - tw / 2 - 4, labelY - 7, tw + 8, 14, 4)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, px, labelY)
}

export function drawStatusBadge(
  ctx: CanvasRenderingContext2D,
  w: number,
  isBal: boolean,
  netTorque: number,
  t: (key: string) => string,
) {
  const statusText = isBal ? '⚖️ ' + t('experiments.balanced') : `τ = ${netTorque.toFixed(2)} N·m`
  ctx.font = 'bold 13px sans-serif'
  const tw = ctx.measureText(statusText).width
  ctx.fillStyle = isBal ? 'rgba(34,197,94,0.15)' : 'rgba(91,141,184,0.15)'
  ctx.strokeStyle = isBal ? 'rgba(34,197,94,0.4)' : 'rgba(91,141,184,0.4)'
  ctx.lineWidth = 1
  const bx = w / 2 - tw / 2 - 12
  const by = 10
  const bw = tw + 24
  const bh = 26
  ctx.beginPath()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(ctx as any).roundRect(bx, by, bw, bh, 6)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = isBal ? '#22c55e' : '#5B8DB8'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(statusText, w / 2, by + bh / 2)
}
