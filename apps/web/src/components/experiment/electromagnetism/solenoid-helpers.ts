const MU0 = 4 * Math.PI * 1e-7
export { MU0 }

export function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 'right' | 'left', color: string, size = 5) {
  ctx.fillStyle = color
  ctx.beginPath()
  if (dir === 'right') {
    ctx.moveTo(x + size, y)
    ctx.lineTo(x - size * 0.6, y - size * 0.8)
    ctx.lineTo(x - size * 0.6, y + size * 0.8)
  } else {
    ctx.moveTo(x - size, y)
    ctx.lineTo(x + size * 0.6, y - size * 0.8)
    ctx.lineTo(x + size * 0.6, y + size * 0.8)
  }
  ctx.closePath()
  ctx.fill()
}

export function drawSolenoidWires(
  ctx: CanvasRenderingContext2D,
  genX: number, genY: number, genW: number,
  solenoidLeftX: number, solenoidRightX: number,
  cy: number, railY: number,
) {
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(genX + 10, genY); ctx.lineTo(genX + 10, railY)
  ctx.lineTo(solenoidLeftX - 10, railY); ctx.lineTo(solenoidLeftX - 10, cy); ctx.lineTo(solenoidLeftX, cy)
  ctx.moveTo(genX + genW - 10, genY); ctx.lineTo(genX + genW - 10, railY)
  ctx.lineTo(solenoidRightX + 10, railY); ctx.lineTo(solenoidRightX + 10, cy); ctx.lineTo(solenoidRightX, cy)
  ctx.stroke()
}

export function drawSolenoidFieldLines(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  solenoidLeftX: number, solenoidRightX: number,
  solenoidLen: number, solenoidR: number, solenoidFlatR: number,
  phase: number, isPositive: boolean,
  currentI: number, currentN: number,
) {
  const dir: 'right' | 'left' = isPositive ? 'right' : 'left'
  const fieldColor = (opacity: number) => `rgba(34, 197, 94, ${opacity})`
  const baseLineWidth = 1.5

  const L_coil = 0.2
  const B_actual = (MU0 * Math.abs(currentI) * currentN) / L_coil
  const B_max = (MU0 * 50 * 500) / L_coil
  const B_ratio = Math.min(1, B_actual / B_max)
  const B_vis = Math.sqrt(B_ratio)

  const totalLines = Math.max(2, Math.round(2 + B_vis * 10))
  const lineSpacing = (solenoidFlatR * 0.6) / Math.max(totalLines - 1, 1)
  for (let i = 0; i < totalLines; i++) {
    const offset = (i - (totalLines - 1) / 2) * lineSpacing
    const opacity = 0.4
    ctx.strokeStyle = fieldColor(opacity)
    ctx.lineWidth = baseLineWidth
    ctx.setLineDash([8, 4])
    ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 15
    ctx.beginPath()
    ctx.moveTo(solenoidLeftX, cy + offset)
    ctx.lineTo(solenoidRightX, cy + offset)
    ctx.stroke()
    ctx.setLineDash([])
    const arrowX = solenoidLeftX + solenoidLen / 2
    drawArrow(ctx, arrowX, cy + offset, dir, fieldColor(0.8), 5)
  }

  const outerLineCount = Math.max(1, Math.round(1 + B_vis * 6))
  for (let i = 0; i < outerLineCount; i++) {
    const outerR = solenoidR + 20 + i * 25
    const opacity = 0.2
    ctx.strokeStyle = fieldColor(opacity)
    ctx.lineWidth = 1.2
    ctx.setLineDash([6, 4])
    ctx.lineDashOffset = phase * (isPositive ? 1 : -1) * 10

    ctx.beginPath()
    ctx.moveTo(solenoidLeftX, cy - solenoidFlatR)
    ctx.bezierCurveTo(
      solenoidLeftX - outerR, cy - solenoidFlatR - outerR * 0.8,
      solenoidRightX + outerR, cy - solenoidFlatR - outerR * 0.8,
      solenoidRightX, cy - solenoidFlatR
    )
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(solenoidRightX, cy + solenoidFlatR)
    ctx.bezierCurveTo(
      solenoidRightX + outerR, cy + solenoidFlatR + outerR * 0.8,
      solenoidLeftX - outerR, cy + solenoidFlatR + outerR * 0.8,
      solenoidLeftX, cy + solenoidFlatR
    )
    ctx.stroke()
    ctx.setLineDash([])
  }
}

export function drawSolenoidCoils(
  ctx: CanvasRenderingContext2D,
  solenoidLeftX: number, cy: number,
  solenoidLen: number, solenoidR: number, solenoidFlatR: number,
  wireW: number, currentN: number,
) {
  const turns = Math.min(Math.round(currentN), 15)
  const turnSpacing = solenoidLen / turns
  for (let n = 0; n < turns; n++) {
    const tx = solenoidLeftX + n * turnSpacing + turnSpacing / 2
    ctx.strokeStyle = 'rgba(100,116,139,.4)'
    ctx.lineWidth = wireW
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.ellipse(tx, cy, solenoidR * 0.3, solenoidFlatR, 0, Math.PI, Math.PI * 2)
    ctx.stroke()

    const coilGrad = ctx.createLinearGradient(tx - solenoidR * 0.3, 0, tx + solenoidR * 0.3, 0)
    coilGrad.addColorStop(0, '#8B5E3C')
    coilGrad.addColorStop(0.3, '#C8895A')
    coilGrad.addColorStop(0.5, '#E8A87C')
    coilGrad.addColorStop(0.7, '#C8895A')
    coilGrad.addColorStop(1, '#8B5E3C')
    ctx.strokeStyle = coilGrad
    ctx.lineWidth = wireW
    ctx.beginPath()
    ctx.ellipse(tx, cy, solenoidR * 0.3, solenoidFlatR, 0, 0, Math.PI)
    ctx.stroke()
  }
  return { turns, turnSpacing }
}

export function drawSolenoidCurrentArrows(
  ctx: CanvasRenderingContext2D,
  solenoidLeftX: number, cy: number,
  solenoidLen: number, solenoidR: number, solenoidFlatR: number,
  turnSpacing: number, turns: number,
  phase: number, isPositive: boolean,
) {
  const arrowCount = Math.min(turns, 8)
  const arrowSpeed = 0.4
  const arrowSize = 5
  for (let i = 0; i < arrowCount; i++) {
    const tx = solenoidLeftX + (i / arrowCount) * solenoidLen + turnSpacing / 2
    const angle = phase * (isPositive ? arrowSpeed : -arrowSpeed)
    const ax = tx + solenoidR * 0.3 * Math.cos(angle)
    const ay = cy + solenoidFlatR * Math.sin(angle)
    if (Math.sin(angle) < -0.2) continue
    ctx.fillStyle = isPositive ? 'rgba(245,158,11,.7)' : 'rgba(59,130,246,.7)'
    const d = isPositive ? 1 : -1
    const tanX = -Math.sin(angle) * d
    const tanY = Math.cos(angle) * 0.35 * d
    const len = arrowSize
    ctx.beginPath()
    ctx.moveTo(ax + tanX * len, ay + tanY * len)
    ctx.lineTo(ax - tanX * len * 0.4 + tanY * len * 0.6, ay - tanY * len * 0.4 - tanX * len * 0.6)
    ctx.lineTo(ax - tanX * len * 0.4 - tanY * len * 0.6, ay - tanY * len * 0.4 + tanX * len * 0.6)
    ctx.closePath()
    ctx.fill()
  }
}

export function drawSolenoidBatteryAndLabels(
  ctx: CanvasRenderingContext2D,
  genX: number, genY: number, genW: number,
  cx: number, cy: number,
  solenoidLeftX: number, solenoidRightX: number, solenoidFlatR: number,
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
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, cx, cy - solenoidFlatR - 25)

  ctx.strokeStyle = 'rgba(168,85,247,.25)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(solenoidLeftX, cy + solenoidFlatR + 20)
  ctx.lineTo(solenoidRightX, cy + solenoidFlatR + 20)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.strokeStyle = 'rgba(168,85,247,.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(solenoidLeftX, cy + solenoidFlatR + 15)
  ctx.lineTo(solenoidLeftX, cy + solenoidFlatR + 25)
  ctx.moveTo(solenoidRightX, cy + solenoidFlatR + 15)
  ctx.lineTo(solenoidRightX, cy + solenoidFlatR + 25)
  ctx.stroke()

  ctx.fillStyle = 'rgba(168,85,247,.5)'
  ctx.font = '9px sans-serif'
  ctx.fillText('L', cx, cy + solenoidFlatR + 32)

  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.arc(cx, cy, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#64748b'
  ctx.font = '9px sans-serif'
  ctx.fillText(t('experiments.emCanvasCoilCenter'), cx, cy + 16)
}
