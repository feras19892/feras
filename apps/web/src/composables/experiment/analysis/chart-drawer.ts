import { watch, type Ref, type ComputedRef } from 'vue'

export function fmtTick(n: number): string {
  const absN = Math.abs(n)
  if (absN >= 10000) return n.toExponential(1)
  if (absN >= 1000) return n.toFixed(0)
  if (absN >= 100) return n.toFixed(0)
  if (absN >= 10) return n.toFixed(1)
  if (absN >= 1) return n.toFixed(2)
  if (absN >= 0.1) return n.toFixed(3)
  return n.toPrecision(2)
}

export function useChartDrawer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  containerRef: Ref<HTMLDivElement | null>,
  points: ComputedRef<{ x: number; y: number }[]>,
  xKey: Ref<string>,
  yKey: Ref<string>,
  regression: ComputedRef<{ slope: number; intercept: number; r2: number } | null>,
  xAxisLabel: ComputedRef<string>,
  yAxisLabel: ComputedRef<string>,
  t: (key: string) => string,
  hoverPoint: Ref<{ x: number; y: number; px: number; py: number } | null>,
  tooltip: Ref<string>,
) {
  function getChartMetrics() {
    const xs = points.value.map(p => p.x); const ys = points.value.map(p => p.y)
    const dataMinX = Math.min(...xs); const dataMaxX = Math.max(...xs)
    const dataMinY = Math.min(...ys); const dataMaxY = Math.max(...ys)
    const dataRangeX = dataMaxX === dataMinX ? 1 : dataMaxX - dataMinX
    const dataRangeY = dataMaxY === dataMinY ? 1 : dataMaxY - dataMinY
    const pad = 70
    const minX = dataMinX - dataRangeX * 0.10
    const maxX = dataMaxX + dataRangeX * 0.10
    const minY = dataMinY - dataRangeY * 0.10
    const maxY = dataMaxY + dataRangeY * 0.10
    const rangeX = maxX === minX ? 1 : maxX - minX
    const rangeY = maxY === minY ? 1 : maxY - minY
    return { pad, minX, maxX, minY, maxY, rangeX, rangeY, dataMinX, dataMinY, dataRangeX, dataRangeY }
  }

  function draw() {
    const canvas = canvasRef.value
    if (!canvas || !containerRef.value) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = containerRef.value.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor((rect.height - 32) * dpr)
    canvas.style.width = rect.width + 'px'
    canvas.style.height = (rect.height - 32) + 'px'
    ctx.scale(dpr, dpr)

    const w = canvas.clientWidth
    const h = canvas.clientHeight - 4

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    if (points.value.length === 0) {
      ctx.fillStyle = '#64748b'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(t('analysis.chooseAxes'), w / 2, h / 2)
      return
    }

    const metrics = getChartMetrics()
    const { pad, minX, maxX, minY, rangeX, rangeY, dataMinX, dataMinY, dataRangeX, dataRangeY } = metrics

    const toPx = (x: number, y: number) => ({
      px: pad + ((x - minX) / rangeX) * (w - pad * 2),
      py: h - pad - ((y - minY) / rangeY) * (h - pad * 2),
    })

    const xTickCount = Math.max(3, Math.min(6, Math.floor((w - pad * 2) / 90)))
    const yTickCount = Math.max(3, Math.min(6, Math.floor((h - pad * 2) / 50)))

    // grid
    ctx.save()
    ctx.strokeStyle = 'rgba(148,163,184,0.18)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    for (let i = 1; i < xTickCount; i++) {
      const gx = pad + (i / xTickCount) * (w - pad * 2)
      ctx.beginPath(); ctx.moveTo(gx, pad); ctx.lineTo(gx, h - pad); ctx.stroke()
    }
    for (let i = 1; i < yTickCount; i++) {
      const gy = pad + (i / yTickCount) * (h - pad * 2)
      ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(w - pad, gy); ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.restore()

    // axes
    ctx.save()
    ctx.strokeStyle = 'rgba(203,213,225,0.8)'
    ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.stroke()
    ctx.restore()

    // X ticks
    ctx.save()
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2
    for (let i = 0; i <= xTickCount; i++) {
      const px = pad + (i / xTickCount) * (w - pad * 2)
      ctx.beginPath(); ctx.moveTo(px, h - pad); ctx.lineTo(px, h - pad + 6); ctx.stroke()
    }
    ctx.restore()

    // X labels
    ctx.save()
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 15px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let i = 0; i <= xTickCount; i++) {
      const xv = dataMinX + (i / xTickCount) * dataRangeX
      const px = pad + ((xv - minX) / rangeX) * (w - pad * 2)
      ctx.fillText(fmtTick(xv), px, h - pad + 14)
    }
    ctx.restore()

    // Y ticks
    ctx.save()
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2
    for (let i = 0; i <= yTickCount; i++) {
      const yv = dataMinY + (i / yTickCount) * dataRangeY
      const py = h - pad - ((yv - minY) / rangeY) * (h - pad * 2)
      ctx.beginPath(); ctx.moveTo(pad - 6, py); ctx.lineTo(pad, py); ctx.stroke()
    }
    ctx.restore()

    // Y labels
    ctx.save()
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 15px "Segoe UI", sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= yTickCount; i++) {
      const yv = dataMinY + (i / yTickCount) * dataRangeY
      const py = h - pad - ((yv - minY) / rangeY) * (h - pad * 2)
      ctx.fillText(fmtTick(yv), pad - 14, py)
    }
    ctx.restore()

    // X axis title
    ctx.save()
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 15px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(xAxisLabel.value, w / 2, h - pad + 44)
    ctx.restore()

    // Y axis title
    ctx.save()
    ctx.translate(pad - 58, h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 15px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(yAxisLabel.value, 0, 0)
    ctx.restore()

    // regression line
    if (regression.value) {
      const { slope, intercept } = regression.value
      const { px: px1, py: py1 } = toPx(minX, slope * minX + intercept)
      const { px: px2, py: py2 } = toPx(maxX, slope * maxX + intercept)
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke()
    }

    // points
    for (const p of points.value) {
      const { px, py } = toPx(p.x, p.y)
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fillStyle = 'rgba(34,197,94,0.25)'; ctx.fill()
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fillStyle = '#22c55e'; ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
    }

    // hover highlight
    if (hoverPoint.value) {
      const { px, py } = hoverPoint.value
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fillStyle = 'rgba(34,197,94,0.3)'; ctx.fill()
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.stroke()
      const txt = tooltip.value
      ctx.font = 'bold 14px "Segoe UI", sans-serif'
      const tw = ctx.measureText(txt).width + 24
      const tx = Math.min(Math.max(px - tw / 2, 6), w - tw - 6)
      const ty = py - 44
      ctx.fillStyle = 'rgba(15,23,42,0.95)'; ctx.fillRect(tx, ty, tw, 32)
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.strokeRect(tx, ty, tw, 32)
      ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center'; ctx.fillText(txt, tx + tw / 2, ty + 22)
    }
  }

  function onMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (points.value.length === 0) return
    const { pad, minX, minY, rangeX, rangeY } = getChartMetrics()
    const mx = e.clientX - rect.left; const my = e.clientY - rect.top
    let closest: { x: number; y: number; px: number; py: number; dist: number } | null = null
    for (const p of points.value) {
      const px = pad + ((p.x - minX) / rangeX) * (rect.width - pad * 2)
      const py = rect.height - pad - ((p.y - minY) / rangeY) * (rect.height - pad * 2)
      const dist = Math.hypot(mx - px, my - py)
      if (!closest || dist < closest.dist) closest = { x: p.x, y: p.y, px, py, dist }
    }
    if (closest && closest.dist < 20) {
      hoverPoint.value = { x: closest.x, y: closest.y, px: closest.px, py: closest.py }
      tooltip.value = `${xKey.value}=${closest.x.toFixed(3)}, ${yKey.value}=${closest.y.toFixed(3)}`
    } else {
      hoverPoint.value = null; tooltip.value = ''
    }
    draw()
  }

  watch([points, xKey, yKey], () => { draw() }, { deep: true })

  return { draw, onMouseMove }
}
