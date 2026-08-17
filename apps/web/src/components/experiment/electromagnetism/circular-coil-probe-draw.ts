import type { ProbeStateManager } from './circular-coil-probe'

export function drawProbe(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  cx: number, cy: number,
  zoom: number, panX: number, panY: number,
  probe: ProbeStateManager,
  currentI: number, currentN: number,
  t: (key: string) => string,
) {
  probe.iconPos = { x: w - 50, y: 50 }
  const probeState = probe.state
  const probePos = probe.pos
  const probeMeasured = probe.measured
  const probeIconPos = probe.iconPos

  if (probeState === 'idle') {
    ctx.fillStyle = 'rgba(168,85,247,.15)'
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.roundRect(probeIconPos.x - 22, probeIconPos.y - 22, 44, 44, 8)
    ctx.fill()
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#a855f7'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📡', probeIconPos.x, probeIconPos.y + 7)
    ctx.fillStyle = '#a855f7'
    ctx.font = '8px sans-serif'
    ctx.fillText(t('experiments.emCanvasHallProbe'), probeIconPos.x, probeIconPos.y + 35)
    ctx.fillStyle = '#64748b'
    ctx.font = '7px sans-serif'
    ctx.fillText(t('experiments.emProbeDragHint'), probeIconPos.x, probeIconPos.y + 45)
  }

  if (probeState === 'dragging' || probeState === 'placed') {
    const sx = (probePos.x - w / 2) * zoom + w / 2 + panX
    const sy = (probePos.y - h / 2) * zoom + h / 2 + panY

    const wireScreenX = (cx - w / 2) * zoom + w / 2 + panX
    const wireScreenY = (cy - h / 2) * zoom + h / 2 + panY
    ctx.strokeStyle = 'rgba(168,85,247,.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(wireScreenX, wireScreenY)
    ctx.lineTo(sx, sy)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#1E2530'
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(sx - 16, sy - 16, 32, 32, 6)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#a855f7'
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📡', sx, sy + 6)

    if (probeState === 'placed') {
      const Rcm = probeMeasured.R * 100
      const BuT = probeMeasured.B * 1e6
      ctx.fillStyle = 'rgba(168,85,247,.1)'
      ctx.strokeStyle = 'rgba(168,85,247,.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(sx + 20, sy - 25, 140, 50, 6)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`R = ${Rcm.toFixed(1)} cm`, sx + 26, sy - 8)
      ctx.fillText(`B = ${BuT.toFixed(2)} μT`, sx + 26, sy + 8)
      ctx.fillStyle = '#64748b'
      ctx.font = '7px sans-serif'
      ctx.fillText(t('experiments.emCanvasStableRecord'), sx + 26, sy + 20)
    }

    if (probeState === 'dragging') {
      ctx.fillStyle = '#a855f7'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(t('experiments.emCanvasReleaseToMeasure'), sx, sy + 28)
    }
  }

  ctx.fillStyle = '#64748b'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🔍 ${zoom.toFixed(1)}x  |  ${t('experiments.emZoomHint')}`, 10, h - 8)
}

export function computeProbeReading(
  probePos: { x: number; y: number },
  canvasW: number, canvasH: number,
  currentI: number, currentN: number,
): { R: number; B: number } {
  const MU0 = 4 * Math.PI * 1e-7
  const cx = canvasW / 2
  const cy = canvasH / 2
  const dxPx = probePos.x - cx
  const dyPx = probePos.y - cy
  const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx)
  const Rmeters = distPx * (0.05 / 90)
  const B = (MU0 * currentN * currentI) / (2 * Math.max(Rmeters, 1e-6))
  return { R: Rmeters, B }
}
