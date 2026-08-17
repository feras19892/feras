export function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, size = 8) {
  ctx.fillStyle = color
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(size, 0)
  ctx.lineTo(-size * 0.6, -size * 0.5)
  ctx.lineTo(-size * 0.3, 0)
  ctx.lineTo(-size * 0.6, size * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function computeTorquePhysics(
  currentN: number, currentI: number, currentA_dim: number, currentB_dim: number,
  currentB_val: number, currentTheta: number,
) {
  const A_val = currentA_dim * currentB_dim
  const mu_val = currentN * currentI * A_val
  const thetaRad = currentTheta * Math.PI / 180
  const tau_val = mu_val * currentB_val * Math.sin(thetaRad)
  return { A_val, mu_val, tau_val }
}

export function drawFieldLinesVertical(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, cx: number, cy: number,
  currentB_val: number, _t: (key: string) => string,
) {
  if (currentB_val <= 0.001) return
  const fieldAlpha = Math.min(0.5, currentB_val * 3)
  const numLines = 7
  const fieldSpacing = Math.min(w, h) * 0.12
  ctx.strokeStyle = `rgba(59,130,246,${fieldAlpha * 0.3})`
  ctx.lineWidth = 1
  for (let i = -Math.floor(numLines / 2); i <= Math.floor(numLines / 2); i++) {
    const x = cx + i * fieldSpacing
    ctx.beginPath()
    ctx.moveTo(x, h * 0.1)
    ctx.lineTo(x, h * 0.9)
    ctx.stroke()
    ctx.fillStyle = `rgba(59,130,246,${fieldAlpha})`
    for (let y = h * 0.15; y < h * 0.9; y += 60) {
      drawArrow(ctx, x, y, -Math.PI / 2, `rgba(59,130,246,${fieldAlpha})`, 5)
    }
  }
  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`B = ${currentB_val.toFixed(3)} T →`, cx + fieldSpacing * 3.5, h * 0.12)
}

export function drawRotationAxis(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, h: number,
  t: (key: string) => string,
) {
  ctx.strokeStyle = 'rgba(100,116,139,0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(cx, cy - h * 0.35)
  ctx.lineTo(cx, cy + h * 0.35)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#64748b'
  ctx.font = '9px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(t('experiments.emCanvasRotationAxis'), cx, cy - h * 0.36)
}

export function drawCoil(
  ctx: CanvasRenderingContext2D,
  coilCenterX: number, coilCenterY: number,
  coilW: number, coilH: number,
  displayAngle: number, currentN: number, currentI: number,
  running: boolean,
) {
  const perspW = Math.abs(coilW * Math.cos(displayAngle))
  const halfW = perspW / 2
  const halfH = coilH / 2

  const backOffset = coilW * Math.sin(displayAngle) * 0.15
  ctx.strokeStyle = 'rgba(200,137,90,0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(coilCenterX - halfW + backOffset, coilCenterY - halfH)
  ctx.lineTo(coilCenterX + halfW + backOffset, coilCenterY - halfH)
  ctx.lineTo(coilCenterX + halfW + backOffset, coilCenterY + halfH)
  ctx.lineTo(coilCenterX - halfW + backOffset, coilCenterY + halfH)
  ctx.closePath()
  ctx.stroke()

  const numTurnsVis = Math.min(Math.max(3, Math.round(currentN / 8)), 15)
  for (let n = 0; n < numTurnsVis; n++) {
    const t = n / Math.max(1, numTurnsVis - 1)
    const offsetY = (t - 0.5) * coilH * 0.9
    const alpha = 0.15 + t * 0.15
    ctx.strokeStyle = `rgba(200,137,90,${alpha})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(coilCenterX - halfW, coilCenterY + offsetY)
    ctx.lineTo(coilCenterX + halfW, coilCenterY + offsetY)
    ctx.stroke()
  }

  const grad = ctx.createLinearGradient(coilCenterX - halfW, 0, coilCenterX + halfW, 0)
  grad.addColorStop(0, '#8B5E3C')
  grad.addColorStop(0.5, '#D49A6E')
  grad.addColorStop(1, '#8B5E3C')
  ctx.strokeStyle = grad
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(coilCenterX - halfW, coilCenterY - halfH)
  ctx.lineTo(coilCenterX + halfW, coilCenterY - halfH)
  ctx.lineTo(coilCenterX + halfW, coilCenterY + halfH)
  ctx.lineTo(coilCenterX - halfW, coilCenterY + halfH)
  ctx.closePath()
  ctx.stroke()

  if (Math.abs(currentI) > 0.01 && running) {
    const arrowDir = currentI >= 0 ? 1 : -1
    drawArrow(ctx, coilCenterX, coilCenterY - halfH, arrowDir > 0 ? 0 : Math.PI, '#22c55e', 6)
    drawArrow(ctx, coilCenterX, coilCenterY + halfH, arrowDir > 0 ? Math.PI : 0, '#22c55e', 6)
  }

  return { halfW, halfH }
}

export function drawNormalAndTorque(
  ctx: CanvasRenderingContext2D,
  coilCenterX: number, coilCenterY: number,
  coilH: number, displayAngle: number,
  tau_val: number, currentTheta: number,
) {
  const normalLen = coilH * 0.6
  const nx = coilCenterX + normalLen * Math.sin(displayAngle)
  const ny = coilCenterY - normalLen * Math.cos(displayAngle)
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(coilCenterX, coilCenterY)
  ctx.lineTo(nx, ny)
  ctx.stroke()
  drawArrow(ctx, nx, ny, Math.atan2(ny - coilCenterY, nx - coilCenterX), '#f59e0b', 8)
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('μ', nx + 10, ny - 5)

  if (Math.abs(tau_val) > 1e-10) {
    const torqueRadius = 35
    const torqueDir = tau_val > 0 ? 1 : -1
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(coilCenterX, coilCenterY, torqueRadius, -Math.PI / 2, -Math.PI / 2 + torqueDir * Math.PI * 0.6, torqueDir < 0)
    ctx.stroke()
    const endAngle = -Math.PI / 2 + torqueDir * Math.PI * 0.6
    const ex = coilCenterX + torqueRadius * Math.cos(endAngle)
    const ey = coilCenterY + torqueRadius * Math.sin(endAngle)
    drawArrow(ctx, ex, ey, endAngle + torqueDir * Math.PI / 2, '#ef4444', 7)
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('τ', coilCenterX + torqueDir * 45, coilCenterY + 5)
  }

  if (Math.abs(currentTheta) > 1) {
    const arcR = 50
    ctx.strokeStyle = 'rgba(168,85,247,0.5)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.arc(coilCenterX, coilCenterY, arcR, -Math.PI / 2, -Math.PI / 2 + displayAngle, displayAngle < 0)
    ctx.stroke()
    ctx.setLineDash([])
    const labelAngle = -Math.PI / 2 + displayAngle * 0.5
    const lx = coilCenterX + (arcR + 12) * Math.cos(labelAngle)
    const ly = coilCenterY + (arcR + 12) * Math.sin(labelAngle)
    ctx.fillStyle = '#a855f7'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`θ=${currentTheta.toFixed(0)}°`, lx, ly)
  }
}

export function drawLabelsPanel(
  ctx: CanvasRenderingContext2D,
  w: number,
  currentI: number, currentN: number, currentB_val: number,
  currentA_dim: number, currentB_dim: number,
  mu_val: number, tau_val: number,
  running: boolean, paused: boolean,
  t: (key: string) => string,
) {
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`I = ${currentI.toFixed(2)} A`, 15, 25)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, 15, 42)
  ctx.fillStyle = '#3b82f6'
  ctx.fillText(`B = ${currentB_val.toFixed(3)} T`, 15, 59)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(`A = ${(currentA_dim * 100).toFixed(1)}×${(currentB_dim * 100).toFixed(1)} cm`, 15, 76)
  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`μ = ${mu_val.toExponential(2)} A·m²`, 15, 93)
  ctx.fillStyle = '#ef4444'
  ctx.fillText(`τ = ${tau_val.toExponential(2)} N·m`, 15, 110)

  ctx.textAlign = 'right'
  if (running && !paused) {
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(t('experiments.emSimActive'), w - 15, 25)
  } else {
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(t('experiments.emSimStopped'), w - 15, 25)
  }
}
