export function drawTrail(c: CanvasRenderingContext2D, trail: { x: number; t: number }[], cy: number, colorBase: string) {
  if (trail.length < 2) return
  c.save()
  for (let i = 1; i < trail.length; i++) {
    const alpha = i / trail.length * 0.4
    c.strokeStyle = colorBase + alpha + ')'
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(trail[i - 1].x, cy)
    c.lineTo(trail[i].x, cy)
    c.stroke()
  }
  c.restore()
}

export function drawArrow(c: CanvasRenderingContext2D, x: number, y: number, v: number, color: string, r: number) {
  if (Math.abs(v) < 0.3) return
  const len = Math.min(70, Math.abs(v) * 12)
  const dir = v > 0 ? 1 : -1
  const ay = y - r - 14
  c.save()
  c.strokeStyle = color; c.lineWidth = 3; c.globalAlpha = 0.85
  c.beginPath(); c.moveTo(x, ay); c.lineTo(x + len * dir, ay); c.stroke()
  c.fillStyle = color; c.globalAlpha = 0.85
  c.beginPath()
  c.moveTo(x + len * dir, ay)
  c.lineTo(x + len * dir - 7 * dir, ay - 5)
  c.lineTo(x + len * dir - 7 * dir, ay + 5)
  c.closePath(); c.fill()
  c.fillStyle = color; c.font = 'bold 11px "Segoe UI"'; c.textAlign = 'center'; c.textBaseline = 'bottom'
  c.fillText(`${v.toFixed(1)}`, x + (len * dir) / 2, ay - 6)
  c.restore()
}

export function drawBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, sr: number, colors: string[], label: string) {
  ctx.save()
  const g = ctx.createRadialGradient(cx - sr * 0.3, cy - sr * 0.3, sr * 0.1, cx, cy, sr)
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c))
  ctx.beginPath(); ctx.arc(cx, cy, sr, 0, Math.PI * 2)
  ctx.fillStyle = g; ctx.fill()
  ctx.strokeStyle = colors[colors.length - 1]; ctx.lineWidth = 3; ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.beginPath(); ctx.arc(cx - sr * 0.25, cy - sr * 0.25, sr * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.max(16, sr * 0.35)}px "Segoe UI"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy + 2)
  ctx.restore()
}

export function drawWalls(ctx: CanvasRenderingContext2D, w: number, cy: number, wallLabel: string) {
  ctx.save()
  ctx.fillStyle = 'rgba(71,85,105,0.5)'
  const wallW = 12
  ctx.fillRect(0, cy - 60, wallW, 120)
  ctx.fillRect(w - wallW, cy - 60, wallW, 120)
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2
  ctx.strokeRect(0, cy - 60, wallW, 120)
  ctx.strokeRect(w - wallW, cy - 60, wallW, 120)
  ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 10px "Segoe UI"'; ctx.textAlign = 'center'
  ctx.save(); ctx.translate(6, cy); ctx.rotate(-Math.PI / 2); ctx.fillText(wallLabel, 0, 0); ctx.restore()
  ctx.save(); ctx.translate(w - 6, cy); ctx.rotate(Math.PI / 2); ctx.fillText(wallLabel, 0, 0); ctx.restore()
  ctx.restore()
}
