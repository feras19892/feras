const MU0 = 4 * Math.PI * 1e-7
export { MU0 }

export function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 'down' | 'up', color: string, size = 5) {
  ctx.fillStyle = color
  ctx.beginPath()
  if (dir === 'down') {
    ctx.moveTo(x, y + size)
    ctx.lineTo(x - size * 0.8, y - size * 0.6)
    ctx.lineTo(x + size * 0.8, y - size * 0.6)
  } else {
    ctx.moveTo(x, y - size)
    ctx.lineTo(x - size * 0.8, y + size * 0.6)
    ctx.lineTo(x + size * 0.8, y + size * 0.6)
  }
  ctx.closePath()
  ctx.fill()
}

export function drawWires(
  ctx: CanvasRenderingContext2D,
  genX: number, genY: number, genW: number,
  wireLeftX: number, wireRightX: number,
  cy: number, railY: number,
) {
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(genX + 10, genY); ctx.lineTo(genX + 10, railY)
  ctx.lineTo(wireLeftX - 15, railY); ctx.lineTo(wireLeftX - 15, cy); ctx.lineTo(wireLeftX, cy)
  ctx.moveTo(genX + genW - 10, genY); ctx.lineTo(genX + genW - 10, railY)
  ctx.lineTo(wireRightX + 15, railY); ctx.lineTo(wireRightX + 15, cy); ctx.lineTo(wireRightX, cy)
  ctx.stroke()
}

export function drawFieldLines(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  coilR: number, coilFlatR: number,
  wireLeftX: number, wireRightX: number,
  phase: number, isPositive: boolean,
  currentI: number, currentN: number,
) {
  const dir: 'down' | 'up' = isPositive ? 'down' : 'up'
  const fieldColor = (opacity: number) => `rgba(34, 197, 94, ${opacity})`
  const baseLineWidth = 1.5

  ctx.strokeStyle = fieldColor(0.4)
  ctx.lineWidth = baseLineWidth
  ctx.setLineDash([6, 4])
  ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 12
  ctx.beginPath()
  ctx.moveTo(cx, cy - coilR * 2.2)
  ctx.lineTo(cx, cy + coilR * 2.2)
  ctx.stroke()
  ctx.setLineDash([])
  drawArrow(ctx, cx, cy - coilFlatR - 3, dir, fieldColor(0.8), 4)

  const R_coil = 0.05
  const B_actual = (MU0 * Math.abs(currentI) * currentN) / (2 * R_coil)
  const B_max = (MU0 * 50 * 50) / (2 * R_coil)
  const B_ratio = Math.min(1, B_actual / B_max)
  const B_vis = Math.sqrt(B_ratio)
  const numSideLines = Math.max(1, Math.round(1 + B_vis * 7))
  for (let i = 0; i < numSideLines; i++) {
    const t = (i + 1) / (numSideLines + 1)
    const offset = coilR * t * 0.9
    const curve = coilR * 0.3 * t * t
    const lineH = coilR * (2.2 - t * 1.4)
    const opacity = 0.4 - t * 0.1

    ctx.strokeStyle = fieldColor(opacity)
    ctx.lineWidth = baseLineWidth
    ctx.setLineDash([6, 4])
    ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 12

    ctx.beginPath()
    ctx.moveTo(cx + offset + curve, cy - lineH)
    ctx.bezierCurveTo(cx + offset - curve, cy - lineH * 0.5, cx + offset - curve, cy + lineH * 0.5, cx + offset + curve, cy + lineH)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(cx - offset - curve, cy - lineH)
    ctx.bezierCurveTo(cx - offset + curve, cy - lineH * 0.5, cx - offset + curve, cy + lineH * 0.5, cx - offset - curve, cy + lineH)
    ctx.stroke()
    ctx.setLineDash([])

    drawArrow(ctx, cx + offset, cy - coilFlatR - 3, dir, fieldColor(0.7), 4)
    drawArrow(ctx, cx - offset, cy - coilFlatR - 3, dir, fieldColor(0.7), 4)
  }

  const numCircles = Math.max(1, Math.round(1 + B_vis * 5))
  for (let i = 0; i < numCircles; i++) {
    const r = 8 + i * 7
    const opacity = 0.4
    ctx.strokeStyle = fieldColor(opacity)
    ctx.lineWidth = baseLineWidth
    ctx.setLineDash([6, 4])
    ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 12

    ctx.beginPath()
    ctx.arc(wireLeftX, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(wireRightX, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    const ay = isPositive ? cy - r : cy + r
    drawArrow(ctx, wireLeftX, ay, dir, fieldColor(0.8), 4)
    drawArrow(ctx, wireRightX, ay, dir, fieldColor(0.8), 4)
  }
}

export function drawCoil(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  coilR: number, coilFlatR: number, wireW: number,
  currentN: number,
) {
  ctx.strokeStyle = 'rgba(100,116,139,.35)'
  ctx.lineWidth = wireW
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilR, coilFlatR, 0, Math.PI, Math.PI * 2)
  ctx.stroke()

  const coilGrad = ctx.createLinearGradient(cx - coilR, 0, cx + coilR, 0)
  coilGrad.addColorStop(0, '#8B5E3C')
  coilGrad.addColorStop(0.2, '#C8895A')
  coilGrad.addColorStop(0.5, '#E8A87C')
  coilGrad.addColorStop(0.7, '#C8895A')
  coilGrad.addColorStop(1, '#8B5E3C')
  ctx.strokeStyle = coilGrad
  ctx.lineWidth = wireW
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilR, coilFlatR, 0, 0, Math.PI)
  ctx.stroke()

  if (currentN > 1) {
    const spacing = Math.min(3, 30 / currentN)
    const turns = Math.min(Math.round(currentN), 12)
    for (let n = 1; n < turns; n++) {
      const oy = n * spacing
      ctx.strokeStyle = `rgba(100,116,139,${Math.max(0.12, 0.35 - n * 0.025)})`
      ctx.lineWidth = wireW * 0.8
      ctx.beginPath()
      ctx.ellipse(cx, cy - oy, coilR, coilFlatR, 0, Math.PI, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = `rgba(200,137,90,${Math.max(0.18, 0.45 - n * 0.025)})`
      ctx.beginPath()
      ctx.ellipse(cx, cy - oy, coilR, coilFlatR, 0, 0, Math.PI)
      ctx.stroke()
    }
  }
}

export function drawCurrentArrows(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  coilR: number, coilFlatR: number,
  phase: number, isPositive: boolean,
) {
  const arrowCount = 6
  const arrowSpeed = 0.3
  const arrowSize = 6
  for (let i = 0; i < arrowCount; i++) {
    const angle = (i / arrowCount) * Math.PI * 2 + phase * (isPositive ? arrowSpeed : -arrowSpeed)
    if (Math.sin(angle) < -0.1) continue
    const ax = cx + coilR * Math.cos(angle)
    const ay = cy + coilFlatR * Math.sin(angle)
    ctx.fillStyle = isPositive ? 'rgba(245,158,11,.7)' : 'rgba(59,130,246,.7)'
    const d = isPositive ? 1 : -1
    const tanX = -Math.sin(angle) * d
    const tanY = Math.cos(angle) * 0.32 * d
    const len = arrowSize
    ctx.beginPath()
    ctx.moveTo(ax + tanX * len, ay + tanY * len)
    ctx.lineTo(ax - tanX * len * 0.4 + tanY * len * 0.6, ay - tanY * len * 0.4 - tanX * len * 0.6)
    ctx.lineTo(ax - tanX * len * 0.4 - tanY * len * 0.6, ay - tanY * len * 0.4 + tanX * len * 0.6)
    ctx.closePath()
    ctx.fill()
  }
}

export function drawBatteryAndLabels(
  ctx: CanvasRenderingContext2D,
  genX: number, genY: number, genW: number,
  cx: number, cy: number,
  coilR: number, coilFlatR: number,
  currentI: number, currentN: number, isPositive: boolean,
  t: (key: string) => string,
) {
  ctx.fillStyle = '#1E2530'
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(genX, genY, genW, 40, 6)
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#f59e0b'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🔋', genX + genW / 2 - 10, genY + 22)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '8px sans-serif'
  ctx.fillText(t('experiments.emCanvasGenerator'), genX + genW / 2 + 12, genY + 22)
  ctx.fillStyle = isPositive ? '#f59e0b' : '#3b82f6'
  ctx.font = 'bold 12px monospace'
  ctx.fillText(`I = ${currentI.toFixed(1)} A`, genX + genW / 2, genY - 8)

  ctx.fillStyle = '#a855f7'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, cx, cy - coilFlatR - 15)

  ctx.strokeStyle = 'rgba(168,85,247,.25)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(cx, cy); ctx.lineTo(cx + coilR, cy)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(168,85,247,.5)'
  ctx.font = '9px sans-serif'
  ctx.fillText('R', cx + coilR / 2, cy - 4)

  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.arc(cx, cy, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#64748b'
  ctx.font = '9px sans-serif'
  ctx.fillText(t('experiments.emCanvasCoilCenter'), cx, cy + 16)
}
