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

export function drawFieldLinesHorizontal(
  ctx: CanvasRenderingContext2D,
  w: number, cx: number, cy: number,
  scale: number, currentB: number,
) {
  if (currentB <= 0.01) return
  const fieldAlpha = Math.min(0.5, currentB * 0.35)
  ctx.strokeStyle = `rgba(59,130,246,${fieldAlpha})`
  ctx.lineWidth = 1.5
  const numLines = 9
  const fieldSpread = 250 * scale
  for (let l = 0; l < numLines; l++) {
    const yOffset = (l - (numLines - 1) / 2) * (fieldSpread / numLines)
    const y = cy + yOffset
    ctx.beginPath()
    ctx.moveTo(40, y)
    ctx.lineTo(w - 40, y)
    ctx.stroke()
    if (l % 2 === 0) {
      const ax = cx
      ctx.fillStyle = `rgba(59,130,246,${fieldAlpha * 1.5})`
      ctx.beginPath()
      ctx.moveTo(ax + 5, y - 3)
      ctx.lineTo(ax + 5, y + 3)
      ctx.lineTo(ax + 10, y)
      ctx.closePath()
      ctx.fill()
    }
  }
}

export function drawFluxCoil(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, scale: number,
  theta: number, currentA: number,
) {
  const coilR = Math.max(15, Math.sqrt(Math.max(currentA, 1e-6) / Math.PI) * 1200 * scale)
  const minorAxis = coilR * Math.abs(Math.cos(theta))
  const isFront = Math.cos(theta) >= 0

  ctx.fillStyle = `rgba(200,137,90,${0.08 + 0.15 * Math.abs(Math.cos(theta))})`
  ctx.strokeStyle = isFront ? '#D49A6E' : 'rgba(200,137,90,0.5)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilR, Math.max(2, minorAxis), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  const numTurnsVis = 6
  for (let n = 0; n < numTurnsVis; n++) {
    const t = n / Math.max(1, numTurnsVis - 1)
    const yOffset = (t - 0.5) * minorAxis * 1.8
    const y = cy + yOffset
    const halfW = coilR * Math.sqrt(Math.max(0, 1 - (yOffset / minorAxis) ** 2))
    ctx.strokeStyle = `rgba(200,137,90,${0.2 + Math.abs(t - 0.5) * 0.3})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - halfW, y)
    ctx.lineTo(cx + halfW, y)
    ctx.stroke()
  }

  return { coilR, minorAxis }
}

export function drawNormalAndBAngle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, scale: number,
  theta: number, coilR: number, currentB: number,
) {
  const normalLen = coilR + 30 * scale
  const normalAngle = theta
  const nx = cx + normalLen * Math.cos(normalAngle)
  const ny = cy - normalLen * Math.sin(normalAngle)
  ctx.strokeStyle = '#22c55e'
  ctx.lineWidth = 2
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(nx, ny)
  ctx.stroke()
  drawArrow(ctx, nx, ny, normalAngle, '#22c55e', 7)
  ctx.fillStyle = '#22c55e'
  ctx.font = `bold ${10 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('n', nx + 12, ny - 5)

  const bLen = 60 * scale * currentB
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + bLen, cy)
  ctx.stroke()
  drawArrow(ctx, cx + bLen, cy, 0, '#3b82f6', 8)
  ctx.fillStyle = '#3b82f6'
  ctx.font = `bold ${10 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('B', cx + bLen + 12, cy - 5)

  if (Math.abs(theta) > 0.05) {
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    const arcR = 30 * scale
    ctx.arc(cx, cy, arcR, 0, -normalAngle, normalAngle < 0)
    ctx.stroke()
    ctx.fillStyle = '#f59e0b'
    ctx.font = `bold ${9 * scale}px sans-serif`
    ctx.textAlign = 'center'
    const midAngle = -normalAngle / 2
    ctx.fillText('θ', cx + (arcR + 10) * Math.cos(midAngle), cy + (arcR + 10) * Math.sin(midAngle) - 3)
  }
}

export function drawFluxLabels(
  ctx: CanvasRenderingContext2D,
  w: number,
  currentB: number, currentA: number, theta: number, flux: number,
  running: boolean, paused: boolean,
  t: (key: string) => string,
) {
  ctx.fillStyle = 'rgba(15,22,40,0.85)'
  ctx.strokeStyle = 'rgba(100,116,139,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(8, 8, 175, 115, 8)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`B = ${currentB.toFixed(2)} T`, 16, 30)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`A = ${(currentA * 10000).toFixed(0)} cm²`, 16, 50)
  ctx.fillStyle = '#f59e0b'
  const thetaDisp = theta % (2 * Math.PI)
  ctx.fillText(`θ = ${(thetaDisp * 180 / Math.PI).toFixed(1)}°`, 16, 70)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(`cos θ = ${Math.cos(theta).toFixed(3)}`, 16, 90)
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 14px monospace'
  ctx.fillText(`Φ = ${flux.toExponential(3)} Wb`, 16, 112)

  ctx.textAlign = 'right'
  if (running && !paused) {
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(t('experiments.emSimActive'), w - 15, 25)
  } else {
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(t('experiments.emSimStopped'), w - 15, 25)
  }
}

export function drawFluxGraph(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  fluxHistory: number[], fluxMaxCached: number, FLUX_HISTORY_LEN: number,
  t: (key: string) => string,
) {
  const graphH = 80
  const graphY = h - graphH - 20
  const graphW = w - 60
  const graphX = 30

  ctx.fillStyle = 'rgba(15,22,40,0.8)'
  ctx.strokeStyle = 'rgba(100,116,139,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(graphX, graphY, graphW, graphH, 6)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = 'rgba(100,116,139,0.2)'
  ctx.beginPath()
  ctx.moveTo(graphX, graphY + graphH / 2)
  ctx.lineTo(graphX + graphW, graphY + graphH / 2)
  ctx.stroke()

  if (fluxHistory.length > 1) {
    let maxFlux = 0.001
    for (let j = 0; j < fluxHistory.length; j++) {
      const absVal = Math.abs(fluxHistory[j])
      if (absVal > maxFlux) maxFlux = absVal
    }
    ctx.fillStyle = 'rgba(59,130,246,0.15)'
    ctx.beginPath()
    ctx.moveTo(graphX, graphY + graphH / 2)
    for (let j = 0; j < fluxHistory.length; j++) {
      const px = graphX + (j / FLUX_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - Math.max(0, fluxHistory[j] / maxFlux) * (graphH / 2 - 5)
      ctx.lineTo(px, py)
    }
    ctx.lineTo(graphX + (fluxHistory.length / FLUX_HISTORY_LEN) * graphW, graphY + graphH / 2)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgba(239,68,68,0.15)'
    ctx.beginPath()
    ctx.moveTo(graphX, graphY + graphH / 2)
    for (let j = 0; j < fluxHistory.length; j++) {
      const px = graphX + (j / FLUX_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - Math.min(0, fluxHistory[j] / maxFlux) * (graphH / 2 - 5)
      ctx.lineTo(px, py)
    }
    ctx.lineTo(graphX + (fluxHistory.length / FLUX_HISTORY_LEN) * graphW, graphY + graphH / 2)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let j = 0; j < fluxHistory.length; j++) {
      const px = graphX + (j / FLUX_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - (fluxHistory[j] / maxFlux) * (graphH / 2 - 5)
      if (j === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(t('experiments.emCanvasFluxGraph'), graphX + 5, graphY + 12)
  ctx.fillStyle = '#64748b'
  ctx.font = '8px sans-serif'
  ctx.fillText(`peak: ${fluxMaxCached.toExponential(3)} Wb`, graphX + 5, graphY + graphH - 5)
}
