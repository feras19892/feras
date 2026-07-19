import type { WorkshopComponent } from './types'
import { roundRect, type DrawCtx, type RenderMode } from './drawHelpers'

export function drawACSource3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 22 * z, h = 14 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#60a5fa')
  grad.addColorStop(0.5, '#3b82f6')
  grad.addColorStop(1, '#1e40af')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fbbf24' : '#1e40af'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = '#dbeafe'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  const sw = w * 0.7, sh = h * 0.4
  for (let i = 0; i <= 30; i++) {
    const x = -sw + (2 * sw * i / 30)
    const y = sh * Math.sin((i / 30) * Math.PI * 2)
    if (i === 0) { ctx.moveTo(x, y) } else { ctx.lineTo(x, y) }
  }
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${8 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('~', -w + 6 * z, 3 * z)
  ctx.fillText('~', w - 6 * z, 3 * z)
  const freq = comp.acFrequency ?? 50
  const vamp = comp.acAmplitude ?? comp.value
  ctx.fillStyle = '#93c5fd'; ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(`${vamp}V ${freq}Hz`, 0, h + 10 * z)
}

export function drawTransformer3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 28 * z, h = 18 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#a78bfa')
  grad.addColorStop(0.5, '#8b5cf6')
  grad.addColorStop(1, '#5b21b6')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fbbf24' : '#5b21b6'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 2 * z
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(-w * 0.3, -h * 0.2 + i * h * 0.2, w * 0.15, Math.PI / 2, Math.PI * 1.5, false)
    ctx.stroke()
  }
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(w * 0.3, -h * 0.2 + i * h * 0.2, w * 0.15, -Math.PI / 2, Math.PI / 2, false)
    ctx.stroke()
  }
  ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 1.5 * z
  ctx.beginPath(); ctx.moveTo(-2 * z, -h * 0.5); ctx.lineTo(-2 * z, h * 0.5); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(2 * z, -h * 0.5); ctx.lineTo(2 * z, h * 0.5); ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${6 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('P', -w, -h - 4 * z)
  ctx.fillText('S', w, -h - 4 * z)
  const ratio = comp.transformerRatio ?? comp.value
  ctx.fillStyle = '#c4b5fd'; ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(`1:${ratio}`, 0, h + 10 * z)
}

export function drawOscilloscope3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 34 * z, h = 22 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#22d3ee')
  grad.addColorStop(0.5, '#06b6d4')
  grad.addColorStop(1, '#0e7490')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fbbf24' : '#0e7490'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#0c1117'
  ctx.fillRect(-w * 0.8, -h * 0.7, w * 1.6, h * 1.2)
  ctx.strokeStyle = '#155e63'; ctx.lineWidth = 1 * z
  ctx.strokeRect(-w * 0.8, -h * 0.7, w * 1.6, h * 1.2)
  ctx.strokeStyle = 'rgba(34,211,238,0.15)'; ctx.lineWidth = 0.5 * z
  for (let i = 1; i < 8; i++) {
    const gx = -w * 0.8 + (w * 1.6 * i / 8)
    ctx.beginPath(); ctx.moveTo(gx, -h * 0.7); ctx.lineTo(gx, h * 0.5); ctx.stroke()
  }
  for (let i = 1; i < 5; i++) {
    const gy = -h * 0.7 + (h * 1.2 * i / 5)
    ctx.beginPath(); ctx.moveTo(-w * 0.8, gy); ctx.lineTo(w * 0.8, gy); ctx.stroke()
  }
  const trace = comp.oscilloscopeTrace
  if (trace && trace.length > 1) {
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.5 * z
    ctx.beginPath()
    const maxV = Math.max(...trace.map(p => Math.abs(p.v)), 0.1)
    const screenW = w * 1.6, screenH = h * 1.2, screenTop = -h * 0.7
    for (let i = 0; i < trace.length; i++) {
      const px = -w * 0.8 + (screenW * i / (trace.length - 1))
      const py = screenTop + screenH / 2 - (trace[i].v / maxV) * screenH * 0.4
      if (i === 0) { ctx.moveTo(px, py) } else { ctx.lineTo(px, py) }
    }
    ctx.stroke()
  } else {
    ctx.strokeStyle = 'rgba(74,222,128,0.4)'; ctx.lineWidth = 1.5 * z
    ctx.beginPath()
    for (let i = 0; i <= 40; i++) {
      const px = -w * 0.8 + (w * 1.6 * i / 40)
      const py = -h * 0.1 + h * 0.3 * Math.sin((i / 40) * Math.PI * 4)
      if (i === 0) { ctx.moveTo(px, py) } else { ctx.lineTo(px, py) }
    }
    ctx.stroke()
  }
  ctx.fillStyle = '#4ade80'; ctx.font = `bold ${6 * z}px sans-serif`; ctx.textAlign = 'left'
  ctx.fillText('CH1', -w * 0.75, -h * 0.55)
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${7 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('OSC', 0, h + 10 * z)
}

export function drawProbesAndClamp(ctx: CanvasRenderingContext2D, comp: WorkshopComponent, dc: DrawCtx, renderMode: RenderMode) {
  const { worldToScreen, zoom } = dc
  const z = zoom * (comp.scale ?? 1)
  const fz = zoom
  const mode = comp.multimeterMode || 'voltage'
  const blackJackX = comp.x - 8 * z
  const blackJackY = comp.y + 28 * z
  const redJackX = comp.x + 8 * z
  const redJackY = comp.y + 28 * z
  if (mode === 'current') {
    drawClampRing(ctx, comp, dc, renderMode)
  } else {
    if (comp.probeBlack) {
      const [bx, by] = worldToScreen(comp.probeBlack.x, comp.probeBlack.y)
      const [jx, jy] = worldToScreen(blackJackX, blackJackY)
      drawProbeCable(ctx, jx, jy, bx, by, '#1e293b', '#64748b', fz, renderMode)
    }
    if (comp.probeRed) {
      const [rx, ry] = worldToScreen(comp.probeRed.x, comp.probeRed.y)
      const [jx, jy] = worldToScreen(redJackX, redJackY)
      drawProbeCable(ctx, jx, jy, rx, ry, '#dc2626', '#fca5a5', fz, renderMode)
    }
  }
}

function drawProbeCable(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, cableColor: string, tipColor: string, z: number, renderMode: RenderMode) {
  const dx = toX - fromX, dy = toY - fromY
  const dist = Math.sqrt(dx * dx + dy * dy)
  ctx.strokeStyle = cableColor
  ctx.lineWidth = 3 * z
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  const midX = (fromX + toX) / 2
  const midY = (fromY + toY) / 2 + Math.min(dist * 0.15, 20 * z)
  ctx.quadraticCurveTo(midX, midY, toX, toY)
  ctx.stroke()
  ctx.fillStyle = tipColor
  ctx.strokeStyle = cableColor
  ctx.lineWidth = 1.5 * z
  if (renderMode === '3d') {
    const grad = ctx.createRadialGradient(toX - 2 * z, toY - 2 * z, 0, toX, toY, 5 * z)
    grad.addColorStop(0, tipColor)
    grad.addColorStop(1, cableColor)
    ctx.fillStyle = grad
  }
  ctx.beginPath()
  ctx.arc(toX, toY, 5 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  const angle = Math.atan2(dy, dx)
  ctx.fillStyle = tipColor
  ctx.beginPath()
  ctx.moveTo(toX + Math.cos(angle) * 7 * z, toY + Math.sin(angle) * 7 * z)
  ctx.lineTo(toX + Math.cos(angle + 2.5) * 4 * z, toY + Math.sin(angle + 2.5) * 4 * z)
  ctx.lineTo(toX + Math.cos(angle - 2.5) * 4 * z, toY + Math.sin(angle - 2.5) * 4 * z)
  ctx.closePath()
  ctx.fill()
}

function drawClampRing(ctx: CanvasRenderingContext2D, comp: WorkshopComponent, dc: DrawCtx, renderMode: RenderMode) {
  const { worldToScreen, zoom } = dc
  const z = zoom * (comp.scale ?? 1)
  const fz = zoom
  const [jx, jy] = worldToScreen(comp.x, comp.y + 28 * z)
  const clampPos = comp.clampPos || { x: comp.x, y: comp.y + 80 }
  const [cx, cy] = worldToScreen(clampPos.x, clampPos.y)
  ctx.strokeStyle = '#dc2626'
  ctx.lineWidth = 3 * fz
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(jx, jy)
  const midX = (jx + cx) / 2
  const midY = (jy + cy) / 2 + 15 * fz
  ctx.quadraticCurveTo(midX, midY, cx, cy)
  ctx.stroke()
  const ringR = 18 * fz
  if (renderMode === '3d') {
    const grad = ctx.createLinearGradient(cx - ringR, cy - ringR, cx + ringR, cy + ringR)
    grad.addColorStop(0, '#475569')
    grad.addColorStop(0.5, '#334155')
    grad.addColorStop(1, '#1e293b')
    ctx.strokeStyle = grad
  } else {
    ctx.strokeStyle = '#475569'
  }
  ctx.lineWidth = 5 * fz
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, Math.PI * 0.15, Math.PI * 1.85, false)
  ctx.stroke()
  ctx.lineWidth = 3 * fz
  ctx.strokeStyle = '#64748b'
  const a1 = Math.PI * 0.15, a2 = Math.PI * 1.85
  ctx.beginPath()
  ctx.moveTo(cx + Math.cos(a1) * ringR, cy + Math.sin(a1) * ringR)
  ctx.lineTo(cx + Math.cos(a1) * (ringR + 6 * fz), cy + Math.sin(a1) * (ringR + 6 * fz))
  ctx.moveTo(cx + Math.cos(a2) * ringR, cy + Math.sin(a2) * ringR)
  ctx.lineTo(cx + Math.cos(a2) * (ringR + 6 * fz), cy + Math.sin(a2) * (ringR + 6 * fz))
  ctx.stroke()
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.arc(cx, cy, 2 * fz, 0, Math.PI * 2)
  ctx.fill()
}
