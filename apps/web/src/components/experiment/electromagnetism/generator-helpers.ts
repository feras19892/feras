export function computeGeneratorPhysics(
  angle: number, N: number, B: number, A: number, omega: number, R: number,
) {
  const flux = N * B * A * Math.cos(angle)
  const emf = N * B * A * omega * Math.sin(angle)
  const i = emf / Math.max(R, 1e-6)
  return { flux, emf, i }
}

export function drawMagnetPoles(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, scale: number,
) {
  const poleW = 50 * scale
  const poleH = 120 * scale
  const gap = 140 * scale

  const nGrad = ctx.createLinearGradient(cx - gap / 2 - poleW, 0, cx - gap / 2, 0)
  nGrad.addColorStop(0, '#dc2626')
  nGrad.addColorStop(0.5, '#ef4444')
  nGrad.addColorStop(1, '#dc2626')
  ctx.fillStyle = nGrad
  ctx.fillRect(cx - gap / 2 - poleW, cy - poleH / 2, poleW, poleH)
  ctx.strokeStyle = '#1e2530'
  ctx.lineWidth = 2
  ctx.strokeRect(cx - gap / 2 - poleW, cy - poleH / 2, poleW, poleH)
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${16 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('N', cx - gap / 2 - poleW / 2, cy + 5)

  const sGrad = ctx.createLinearGradient(cx + gap / 2, 0, cx + gap / 2 + poleW, 0)
  sGrad.addColorStop(0, '#2563eb')
  sGrad.addColorStop(0.5, '#3b82f6')
  sGrad.addColorStop(1, '#2563eb')
  ctx.fillStyle = sGrad
  ctx.fillRect(cx + gap / 2, cy - poleH / 2, poleW, poleH)
  ctx.strokeStyle = '#1e2530'
  ctx.strokeRect(cx + gap / 2, cy - poleH / 2, poleW, poleH)
  ctx.fillStyle = '#fff'
  ctx.fillText('S', cx + gap / 2 + poleW / 2, cy + 5)

  return { gap, poleW, poleH }
}

export function drawFieldLines(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, scale: number, gap: number, poleH: number, B: number,
) {
  if (B <= 0.01) return
  const fieldAlpha = Math.min(0.5, B * 0.35)
  ctx.strokeStyle = `rgba(59,130,246,${fieldAlpha})`
  ctx.lineWidth = 1.5
  const numLines = 7
  for (let l = 0; l < numLines; l++) {
    const yOffset = (l - (numLines - 1) / 2) * (poleH / numLines) * 0.8
    const y = cy + yOffset
    ctx.beginPath()
    ctx.moveTo(cx - gap / 2, y)
    ctx.lineTo(cx + gap / 2, y)
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

export function drawRotatingCoil(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, scale: number,
  theta: number, A: number, N: number,
) {
  const coilW = Math.max(20, Math.sqrt(Math.max(A, 1e-6)) * 800 * scale)
  const coilH = Math.max(20, Math.sqrt(Math.max(A, 1e-6)) * 800 * scale)
  const projW = coilW * Math.abs(Math.cos(theta))
  const isFront = Math.cos(theta) >= 0

  ctx.strokeStyle = isFront ? '#D49A6E' : 'rgba(200,137,90,0.4)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.rect(cx - projW / 2, cy - coilH / 2, projW, coilH)
  ctx.stroke()

  const numTurnsVis = Math.min(Math.max(3, Math.round(N / 20)), 8)
  for (let n = 0; n < numTurnsVis; n++) {
    const t = n / Math.max(1, numTurnsVis - 1)
    const yOffset = (t - 0.5) * coilH * 0.9
    ctx.strokeStyle = `rgba(200,137,90,${0.2 + Math.abs(t - 0.5) * 0.3})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - projW / 2, cy + yOffset)
    ctx.lineTo(cx + projW / 2, cy + yOffset)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(168,85,247,0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(cx, cy - coilH / 2 - 20)
  ctx.lineTo(cx, cy + coilH / 2 + 20)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.strokeStyle = '#a855f7'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy + coilH / 2 + 30, 15 * scale, 0.2, Math.PI * 1.5)
  ctx.stroke()
  const arrAngle = Math.PI * 1.5
  const arrX = cx + 15 * scale * Math.cos(arrAngle)
  const arrY = cy + coilH / 2 + 30 + 15 * scale * Math.sin(arrAngle)
  ctx.fillStyle = '#a855f7'
  ctx.beginPath()
  ctx.moveTo(arrX, arrY)
  ctx.lineTo(arrX - 6, arrY - 3)
  ctx.lineTo(arrX - 3, arrY + 5)
  ctx.closePath()
  ctx.fill()
  ctx.font = `bold ${9 * scale}px monospace`
  ctx.textAlign = 'center'
  ctx.fillText(`ω=${N.toFixed(1)}`, cx, cy + coilH / 2 + 55)

  return { projW, coilH }
}

export function drawCurrentIndicators(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, scale: number,
  projW: number, emf: number, i: number,
) {
  if (Math.abs(emf) <= 1e-8) return
  const currentDir = emf > 0 ? 1 : -1
  const intensity = Math.min(1, Math.abs(i) * 10)
  ctx.fillStyle = `rgba(245,158,11,${0.4 + intensity * 0.5})`
  ctx.font = `bold ${11 * scale}px sans-serif`
  ctx.textAlign = 'center'
  const leftSym = currentDir > 0 ? '↑' : '↓'
  const rightSym = currentDir > 0 ? '↓' : '↑'
  ctx.fillText(leftSym, cx - projW / 2 - 12, cy)
  ctx.fillText(rightSym, cx + projW / 2 + 12, cy)
}

export function drawLabelsPanel(
  ctx: CanvasRenderingContext2D,
  w: number,
  currentB: number, currentN: number, currentOmega: number, currentR: number,
  emf: number, i: number, flux: number,
  running: boolean, paused: boolean,
  t: (key: string) => string,
) {
  ctx.fillStyle = 'rgba(15,22,40,0.85)'
  ctx.strokeStyle = 'rgba(100,116,139,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(8, 8, 175, 160, 8)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`B = ${currentB.toFixed(2)} T`, 16, 30)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, 16, 50)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(`ω = ${currentOmega.toFixed(1)} rad/s`, 16, 70)
  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`R = ${currentR.toFixed(0)} Ω`, 16, 90)
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 14px monospace'
  ctx.fillText(`EMF = ${emf.toExponential(2)} V`, 16, 112)
  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`I = ${i.toExponential(2)} A`, 16, 132)
  ctx.fillStyle = '#3b82f6'
  ctx.fillText(`Φ = ${flux.toExponential(2)} Wb`, 16, 152)

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

export function drawEmfGraph(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  emfHistory: number[], emfMaxCached: number, EMF_HISTORY_LEN: number,
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
    ctx.fillStyle = 'rgba(239,68,68,0.12)'
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

    ctx.fillStyle = 'rgba(34,197,94,0.12)'
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
  }

  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(t('experiments.emCanvasAcGenerator'), graphX + 5, graphY + 12)
  ctx.fillStyle = '#ef4444'
  ctx.font = '8px sans-serif'
  ctx.fillText(t('experiments.emCanvasPositive'), graphX + graphW - 70, graphY + 12)
  ctx.fillStyle = '#22c55e'
  ctx.fillText(t('experiments.emCanvasNegative'), graphX + graphW - 30, graphY + 12)
  ctx.fillStyle = '#64748b'
  ctx.font = '8px sans-serif'
  ctx.fillText(`peak: ${emfMaxCached.toExponential(2)} V`, graphX + 5, graphY + graphH - 5)
}
