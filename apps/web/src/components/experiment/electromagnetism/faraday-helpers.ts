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

export function computeFaradayPhysics(
  x: number, B: number, N: number, A: number,
  v: number, R: number, d: number, magnetDir: number,
) {
  const dSafe = Math.max(d, 1e-6)
  const velocity = v * magnetDir
  const flux = (B * A) / (1 + (x / dSafe) ** 2)
  const dFluxDx = (-2 * B * A * x) / (dSafe * dSafe * (1 + (x / dSafe) ** 2) ** 2)
  const emf = -N * dFluxDx * velocity
  const i = emf / Math.max(R, 1e-6)
  const direction = dFluxDx * velocity > 0 ? 'opposing' : 'assisting'
  return { flux, emf, i, direction }
}

export function drawFieldLines(
  ctx: CanvasRenderingContext2D,
  magnetPxX: number, cy: number, scale: number, B: number,
) {
  if (B <= 0.01) return
  const fieldAlpha = Math.min(0.4, B * 0.3)
  ctx.strokeStyle = `rgba(59,130,246,${fieldAlpha})`
  ctx.lineWidth = 1.5
  for (let r = 1; r <= 4; r++) {
    const ringR = r * 25 * scale
    ctx.beginPath()
    ctx.ellipse(magnetPxX, cy, ringR, ringR * 0.6, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.fillStyle = `rgba(59,130,246,${fieldAlpha * 1.5})`
  drawArrow(ctx, magnetPxX + 50 * scale, cy - 15 * scale, 0, `rgba(59,130,246,${fieldAlpha * 1.5})`, 5)
  drawArrow(ctx, magnetPxX - 50 * scale, cy + 15 * scale, Math.PI, `rgba(59,130,246,${fieldAlpha * 1.5})`, 5)
}

export function drawCoil(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, coilW: number, coilR: number, N: number,
) {
  ctx.strokeStyle = 'rgba(200,137,90,0.3)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilW, coilR, 0, Math.PI / 2, Math.PI * 3 / 2)
  ctx.stroke()

  const grad = ctx.createLinearGradient(cx - coilW, 0, cx + coilW, 0)
  grad.addColorStop(0, '#8B5E3C')
  grad.addColorStop(0.5, '#D49A6E')
  grad.addColorStop(1, '#8B5E3C')
  ctx.strokeStyle = grad
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(cx, cy, coilW, coilR, 0, -Math.PI / 2, Math.PI / 2)
  ctx.stroke()

  const numTurnsVis = Math.min(Math.max(3, Math.round(N / 15)), 12)
  for (let n = 0; n < numTurnsVis; n++) {
    const t = n / Math.max(1, numTurnsVis - 1)
    const yOffset = (t - 0.5) * coilR * 1.8
    const alpha = 0.2 + Math.abs(t - 0.5) * 0.3
    ctx.strokeStyle = `rgba(200,137,90,${alpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(cx, cy + yOffset, coilW * 0.8, coilR * 0.15, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
}

export function drawInducedField(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, scale: number,
  emf: number, i: number, direction: string, isLenz: boolean,
) {
  if (Math.abs(emf) <= 1e-10 || !isLenz) return
  const inducedAlpha = Math.min(0.5, Math.abs(i) * 20)
  const inducedColor = direction === 'opposing'
    ? `rgba(239,68,68,${inducedAlpha})`
    : `rgba(34,197,94,${inducedAlpha})`
  ctx.strokeStyle = inducedColor
  ctx.lineWidth = 2
  for (let r = 1; r <= 3; r++) {
    const ringR = r * 20 * scale
    ctx.beginPath()
    ctx.ellipse(cx, cy, ringR, ringR * 0.5, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  const fieldDir = direction === 'opposing' ? -1 : 1
  drawArrow(ctx, cx + 40 * scale, cy - 12 * scale, fieldDir > 0 ? 0 : Math.PI, inducedColor, 5)
  drawArrow(ctx, cx - 40 * scale, cy + 12 * scale, fieldDir > 0 ? Math.PI : 0, inducedColor, 5)
}

export function drawBarMagnet(
  ctx: CanvasRenderingContext2D,
  magnetPxX: number, cy: number, magnetW: number, magnetH: number, scale: number,
) {
  const magLeft = magnetPxX - magnetW / 2
  const magTop = cy - magnetH / 2

  const nGrad = ctx.createLinearGradient(magLeft, magTop, magLeft + magnetW, magTop + magnetH / 2)
  nGrad.addColorStop(0, '#dc2626')
  nGrad.addColorStop(0.5, '#ef4444')
  nGrad.addColorStop(1, '#dc2626')
  ctx.fillStyle = nGrad
  ctx.fillRect(magLeft, magTop, magnetW, magnetH / 2)

  const sGrad = ctx.createLinearGradient(magLeft, magTop + magnetH / 2, magLeft + magnetW, magTop + magnetH)
  sGrad.addColorStop(0, '#2563eb')
  sGrad.addColorStop(0.5, '#3b82f6')
  sGrad.addColorStop(1, '#2563eb')
  ctx.fillStyle = sGrad
  ctx.fillRect(magLeft, magTop + magnetH / 2, magnetW, magnetH / 2)

  ctx.strokeStyle = '#1e2530'
  ctx.lineWidth = 2
  ctx.strokeRect(magLeft, magTop, magnetW, magnetH)

  ctx.fillStyle = '#fff'
  ctx.font = `bold ${12 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('N', magnetPxX, magTop + magnetH * 0.3)
  ctx.fillText('S', magnetPxX, magTop + magnetH * 0.8)
}

export function drawEmfGraph(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  emfHistory: number[], emfMaxCached: number, EMF_HISTORY_LEN: number,
  isLenz: boolean,
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

  if (emfHistory.length > 1) {
    let maxEmf = 0.001
    for (let j = 0; j < emfHistory.length; j++) {
      const absVal = Math.abs(emfHistory[j])
      if (absVal > maxEmf) maxEmf = absVal
    }
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let j = 0; j < emfHistory.length; j++) {
      const px = graphX + (j / EMF_HISTORY_LEN) * graphW
      const py = graphY + graphH / 2 - (emfHistory[j] / maxEmf) * (graphH / 2 - 5)
      if (j === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()

    if (isLenz) {
      ctx.fillStyle = 'rgba(239,68,68,0.15)'
      ctx.beginPath()
      ctx.moveTo(graphX, graphY + graphH / 2)
      for (let j = 0; j < emfHistory.length; j++) {
        const px = graphX + (j / EMF_HISTORY_LEN) * graphW
        const py = graphY + graphH / 2 - Math.max(0, emfHistory[j] / maxEmf) * (graphH / 2 - 5)
        ctx.lineTo(px, py)
      }
      ctx.lineTo(graphX + (emfHistory.length / EMF_HISTORY_LEN) * graphW, graphY + graphH / 2)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = 'rgba(34,197,94,0.15)'
      ctx.beginPath()
      ctx.moveTo(graphX, graphY + graphH / 2)
      for (let j = 0; j < emfHistory.length; j++) {
        const px = graphX + (j / EMF_HISTORY_LEN) * graphW
        const py = graphY + graphH / 2 - Math.min(0, emfHistory[j] / maxEmf) * (graphH / 2 - 5)
        ctx.lineTo(px, py)
      }
      ctx.lineTo(graphX + (emfHistory.length / EMF_HISTORY_LEN) * graphW, graphY + graphH / 2)
      ctx.closePath()
      ctx.fill()
    }
  }

  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(isLenz ? t('experiments.emCanvasLenzLaw') : t('experiments.emCanvasFaradayLaw'), graphX + 5, graphY + 12)
  if (isLenz) {
    ctx.fillStyle = '#ef4444'
    ctx.font = '8px sans-serif'
    ctx.fillText(t('experiments.emCanvasOpposingRed'), graphX + graphW - 80, graphY + 12)
    ctx.fillStyle = '#22c55e'
    ctx.fillText(t('experiments.emCanvasAssistingGreen'), graphX + graphW - 35, graphY + 12)
  }
  ctx.fillStyle = '#64748b'
  ctx.font = '8px sans-serif'
  ctx.fillText(`peak: ${emfMaxCached.toExponential(2)} V`, graphX + 5, graphY + graphH - 5)
}

export function drawLabelsPanel(
  ctx: CanvasRenderingContext2D,
  w: number,
  currentB: number, currentN: number, currentV: number, currentR: number,
  emf: number, i: number,
  running: boolean, paused: boolean,
  t: (key: string) => string,
) {
  ctx.fillStyle = 'rgba(15,22,40,0.85)'
  ctx.strokeStyle = 'rgba(100,116,139,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(8, 8, 175, 140, 8)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`B = ${currentB.toFixed(2)} T`, 16, 30)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, 16, 50)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(`v = ${currentV.toFixed(2)} m/s`, 16, 70)
  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`R = ${currentR.toFixed(0)} Ω`, 16, 90)
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 14px monospace'
  ctx.fillText(`EMF = ${emf.toExponential(2)} V`, 16, 112)
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 13px monospace'
  ctx.fillText(`I = ${i.toExponential(2)} A`, 16, 132)

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
