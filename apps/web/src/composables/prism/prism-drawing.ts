/**
 * Canvas 2D drawing helpers — Prism Lab v3 (interactive workspace).
 */
import type { Point } from './prism-geometry'

export function wavelengthToColor(nm: number): string {
  let r = 0, g = 0, b = 0
  if (nm < 440)      { r = -(nm - 440) / 60; b = 1 }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1 }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20 }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1 }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65 }
  else               { r = 1 }
  const fade = nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 680 ? 0.3 + 0.7 * (700 - nm) / 20 : 1
  const f = (nm < 380 || nm > 700) ? 0 : fade
  return `rgb(${Math.round(255 * r * f)},${Math.round(255 * g * f)},${Math.round(255 * b * f)})`
}

export function clearCanvas(ctx: CanvasRenderingContext2D, W: number, H: number, showGrid = true) {
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H)
  bg.addColorStop(0, '#0d1117'); bg.addColorStop(1, '#161B22')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
  if (!showGrid) return
  ctx.save(); ctx.fillStyle = 'rgba(100,116,139,0.09)'
  const sp = 28
  for (let x = sp; x < W; x += sp)
    for (let y = sp; y < H; y += sp) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
    }
  ctx.restore()
}

export function drawPrismShape(ctx: CanvasRenderingContext2D, pA: Point, pB: Point, pC: Point, isDragging = false) {
  ctx.save()
  const mx = (pA.x + pB.x + pC.x) / 3, my = (pA.y + pB.y + pC.y) / 3
  const grad = ctx.createRadialGradient(mx - 20, my - 30, 15, mx, my, 130)
  grad.addColorStop(0, 'rgba(180,230,255,0.22)')
  grad.addColorStop(0.4, 'rgba(103,232,249,0.14)')
  grad.addColorStop(1, 'rgba(59,130,246,0.05)')
  ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.lineTo(pC.x, pC.y); ctx.closePath()
  ctx.fillStyle = grad; ctx.fill()
  ctx.shadowColor = isDragging ? 'rgba(251,191,36,0.7)' : 'rgba(103,232,249,0.55)'; ctx.shadowBlur = isDragging ? 14 : 8
  ctx.strokeStyle = isDragging ? 'rgba(251,191,36,0.9)' : 'rgba(103,232,249,0.78)'; ctx.lineWidth = isDragging ? 2.2 : 1.8
  ctx.stroke(); ctx.shadowBlur = 0; ctx.restore()
}

export function drawLaserRay(ctx: CanvasRenderingContext2D, srcX: number, srcY: number, p1: Point) {
  ctx.save()
  ctx.shadowColor = '#e0f2fe'; ctx.shadowBlur = 16
  ctx.strokeStyle = '#f0f9ff'; ctx.lineWidth = 2.6
  ctx.beginPath(); ctx.moveTo(srcX, srcY); ctx.lineTo(p1.x, p1.y); ctx.stroke()
  ctx.shadowBlur = 0; ctx.restore()
}

export function drawRefractedRay(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, color: string, lineWidth = 1.5, shadow = false) {
  ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y)
  ctx.strokeStyle = color; ctx.lineWidth = lineWidth
  ctx.shadowBlur = shadow ? 10 : 0; ctx.shadowColor = color
  ctx.stroke(); ctx.shadowBlur = 0
}

export function drawTIRRay(ctx: CanvasRenderingContext2D, p2: Point, end: Point | null, color: string, ra: number, len = 100) {
  ctx.save(); ctx.setLineDash([4, 4])
  ctx.beginPath(); ctx.moveTo(p2.x, p2.y)
  ctx.lineTo(end ? end.x : p2.x + Math.cos(ra) * len, end ? end.y : p2.y + Math.sin(ra) * len)
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore()
}

export function drawNormal(ctx: CanvasRenderingContext2D, p: Point, normalAngle: number, length = 55) {
  ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(148,163,184,0.3)'; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(p.x - Math.cos(normalAngle) * length, p.y - Math.sin(normalAngle) * length)
  ctx.lineTo(p.x + Math.cos(normalAngle) * length, p.y + Math.sin(normalAngle) * length)
  ctx.stroke(); ctx.restore()
}

export function drawAngleLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
  ctx.save(); ctx.font = 'bold 10.5px Inter,Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const w = ctx.measureText(text).width
  ctx.fillStyle = 'rgba(13,17,23,0.88)'; ctx.fillRect(x - w / 2 - 4, y - 8, w + 8, 16)
  ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore()
}

export function drawLabel(ctx: CanvasRenderingContext2D, text: string, p: Point, dx = -4, dy = -10) {
  ctx.save(); ctx.font = 'bold 12px Inter,Arial'; ctx.fillStyle = 'rgba(103,232,249,0.9)'
  ctx.fillText(text, p.x + dx, p.y + dy); ctx.restore()
}

export function drawLaserSource(ctx: CanvasRenderingContext2D, x: number, y: number, isDragging: boolean, isHovered: boolean) {
  ctx.save()
  const glow = isDragging ? 28 : 18

  // 1. Spreading light rays behind the lamp (scattered photons)
  ctx.strokeStyle = isDragging ? 'rgba(251,191,36,0.30)' : 'rgba(255,255,220,0.12)'
  ctx.lineWidth = 1.2
  ctx.lineCap = 'round'
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue
    const ang = i * 0.16
    const rayLen = isDragging ? 55 : 38
    const x1 = x - 26
    const y1 = y + Math.tan(ang) * 6
    const x2 = x1 - rayLen * Math.cos(ang)
    const y2 = y1 + rayLen * Math.sin(ang)
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }

  // 2. Shadow under the body
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.ellipse(x - 10, y + 13, 20, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // 3. Flashlight body (metallic tube)
  ctx.fillStyle = isDragging ? '#334155' : '#1e293b'
  ctx.strokeStyle = isDragging ? 'rgba(251,191,36,0.50)' : '#475569'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  const bw = 28, bh = 13
  if (ctx.roundRect) ctx.roundRect(x - bw - 3, y - bh / 2, bw, bh, 5)
  else ctx.rect(x - bw - 3, y - bh / 2, bw, bh)
  ctx.fill(); ctx.stroke()

  // 4. Grip ridges on body
  ctx.strokeStyle = isDragging ? 'rgba(251,191,36,0.20)' : 'rgba(148,163,184,0.20)'
  ctx.lineWidth = 1
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(x - 24 + i * 7, y - 4); ctx.lineTo(x - 24 + i * 7, y + 4)
    ctx.stroke()
  }

  // 5. Lens housing (dark ring)
  ctx.fillStyle = '#334155'
  ctx.beginPath(); ctx.arc(x, y, 9.5, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(x, y, 9.5, 0, Math.PI * 2); ctx.stroke()

  // 6. Lens glass (glowing disc)
  ctx.fillStyle = isDragging ? '#fef3c7' : '#fffbe6'
  ctx.shadowColor = isDragging ? '#fbbf24' : '#fff59d'
  ctx.shadowBlur = glow
  ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill()
  ctx.shadowBlur = 0

  // 7. Filament / LED hotspot
  ctx.fillStyle = isDragging ? '#fbbf24' : '#ffffff'
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
  // inner white spark
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill()

  // 8. Red power button on top
  ctx.fillStyle = isDragging ? '#ef4444' : '#b91c1c'
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x - 17, y - 10, 5, 3, 1.5)
  else ctx.rect(x - 17, y - 10, 5, 3)
  ctx.fill()
  ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 0.5
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x - 17, y - 10, 5, 3, 1.5)
  else ctx.rect(x - 17, y - 10, 5, 3)
  ctx.stroke()

  // 9. Hover / drag hint
  if (isHovered || isDragging) {
    ctx.fillStyle = isDragging ? '#fbbf24' : '#94a3b8'
    ctx.font = 'bold 11px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText('↕↔', x + 14, y)
  }

  ctx.restore()
}

export function drawApexHandle(ctx: CanvasRenderingContext2D, pA: Point, isHovered: boolean, isDragging: boolean) {
  ctx.save()
  const r = isDragging ? 10 : isHovered ? 9 : 7
  ctx.beginPath(); ctx.arc(pA.x, pA.y, r, 0, Math.PI * 2)
  ctx.fillStyle = isDragging ? 'rgba(251,191,36,0.9)' : isHovered ? 'rgba(103,232,249,0.8)' : 'rgba(103,232,249,0.35)'
  ctx.fill()
  ctx.strokeStyle = isDragging ? '#fbbf24' : '#67e8f9'; ctx.lineWidth = 1.5; ctx.stroke()
  ctx.fillStyle = '#0d1117'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('A', pA.x, pA.y)
  if (isHovered || isDragging) {
    ctx.fillStyle = isDragging ? '#fbbf24' : '#64748b'; ctx.font = '9px Arial'; ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'; ctx.fillText('↕ A', pA.x, pA.y - r - 6)
  }
  ctx.restore()
}

export function drawAngleArc(ctx: CanvasRenderingContext2D, center: Point, a1: number, a2: number, r: number, color: string, label: string) {
  let diff = a2 - a1
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  if (Math.abs(diff) < 0.018) return
  ctx.save()
  ctx.beginPath(); ctx.arc(center.x, center.y, r, a1, a1 + diff, diff < 0)
  ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.stroke()
  const mid = a1 + diff / 2
  drawAngleLabel(ctx, label, center.x + (r + 18) * Math.cos(mid), center.y + (r + 18) * Math.sin(mid), color)
  ctx.restore()
}

export function drawVirtualScreen(ctx: CanvasRenderingContext2D, screenX: number, H: number, hits: { y: number; color: string }[]) {
  if (!hits.length) return
  ctx.save()
  ctx.strokeStyle = 'rgba(100,116,139,0.22)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4])
  ctx.beginPath(); ctx.moveTo(screenX, 22); ctx.lineTo(screenX, H - 22); ctx.stroke(); ctx.setLineDash([])
  ctx.fillStyle = 'rgba(100,116,139,0.12)'; ctx.fillRect(screenX, 22, 4, H - 44)
  hits.forEach(({ y, color }) => {
    if (y < 10 || y > H - 10) return
    const g = ctx.createRadialGradient(screenX + 2, y, 0, screenX + 2, y, 15)
    g.addColorStop(0, color); g.addColorStop(1, 'transparent')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(screenX + 2, y, 15, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = color; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(screenX - 1, y); ctx.lineTo(screenX + 6, y); ctx.stroke()
  })
  ctx.fillStyle = 'rgba(100,116,139,0.45)'; ctx.font = '8px Inter'; ctx.textAlign = 'center'
  ctx.textBaseline = 'top'; ctx.fillText('SCREEN', screenX + 2, 8); ctx.restore()
}

export function drawTIRFlash(ctx: CanvasRenderingContext2D, pA: Point, pB: Point, pC: Point) {
  ctx.save()
  const mx = (pA.x + pB.x + pC.x) / 3, my = (pA.y + pB.y + pC.y) / 3
  const g = ctx.createRadialGradient(mx, my, 0, mx, my, 80)
  g.addColorStop(0, 'rgba(248,113,113,0.22)'); g.addColorStop(1, 'transparent')
  ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.lineTo(pC.x, pC.y); ctx.closePath()
  ctx.fillStyle = g; ctx.fill(); ctx.restore()
}
