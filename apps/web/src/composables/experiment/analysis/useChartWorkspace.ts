import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import type { AnalysisColumnMeta, AnalysisPlotConfig } from '../../../types/physics'

export function useChartWorkspace(
  getReadings: () => Record<string, number>[],
  getColumns: () => AnalysisColumnMeta[],
  getSuggestedPlots: () => AnalysisPlotConfig[],
) {
  const xKey = ref('')
  const yKey = ref('')
  const containerRef = ref<HTMLDivElement | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const hoverPoint = ref<{ x: number; y: number; px: number; py: number } | null>(null)
  const tooltip = ref('')
  const showSlopeResult = ref(false)
  const showAxisControls = ref(false)

  const numericKeys = computed(() => getColumns().map(c => c.key))

  const xAxisLabel = computed(() => {
    const col = getColumns().find(c => c.key === xKey.value)
    return col ? `${col.label}${col.unit ? ` (${col.unit})` : ''}` : (xKey.value || 'X')
  })
  const yAxisLabel = computed(() => {
    const col = getColumns().find(c => c.key === yKey.value)
    return col ? `${col.label}${col.unit ? ` (${col.unit})` : ''}` : (yKey.value || 'Y')
  })

  function fmtTick(n: number): string {
    const absN = Math.abs(n)
    if (absN >= 10000) return n.toExponential(1)
    if (absN >= 1000) return n.toFixed(0)
    if (absN >= 100) return n.toFixed(0)
    if (absN >= 10) return n.toFixed(1)
    if (absN >= 1) return n.toFixed(2)
    if (absN >= 0.1) return n.toFixed(3)
    return n.toPrecision(2)
  }

  watch(() => getSuggestedPlots(), (plots) => {
    if (plots.length) { xKey.value = plots[0].xKey; yKey.value = plots[0].yKey }
    else if (getColumns().length >= 2) { xKey.value = getColumns()[0].key; yKey.value = getColumns()[1].key }
  }, { immediate: true })

  const points = computed(() => {
    if (!xKey.value || !yKey.value) return []
    return getReadings()
      .map(r => ({ x: r[xKey.value], y: r[yKey.value] }))
      .filter(p => typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y))
  })

  const sumX = computed(() => points.value.reduce((s, p) => s + p.x, 0))
  const sumY = computed(() => points.value.reduce((s, p) => s + p.y, 0))
  const sumXY = computed(() => points.value.reduce((s, p) => s + p.x * p.y, 0))
  const sumX2 = computed(() => points.value.reduce((s, p) => s + p.x * p.x, 0))

  const regression = computed(() => {
    const n = points.value.length
    if (n < 2) return null
    const sx = sumX.value, sy = sumY.value, sxy = sumXY.value, sx2 = sumX2.value
    const sumY2 = points.value.reduce((s, p) => s + p.y * p.y, 0)
    const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx)
    const intercept = (sy - slope * sx) / n
    const rNumerator = n * sxy - sx * sy
    const rDenominator = Math.sqrt((n * sx2 - sx * sx) * (n * sumY2 - sy * sy))
    const r = rDenominator === 0 ? 0 : rNumerator / rDenominator
    return { slope, intercept, r2: r * r }
  })

  const slopeWarning = computed(() => {
    if (!regression.value || points.value.length < 2) return null
    const slope = regression.value.slope
    if (slope < -0.001) {
      return '⚠️ الميل سالب — قد تشير البيانات إلى قياسات غير متناسقة. تأكد من تشغيل المحاكاة بعد تغيير المعاملات.'
    }
    if (Math.abs(slope) < 0.0001 && regression.value.r2 > 0.5) {
      return '⚠️ الميل شبه معدوم — ربما المتغير المستقل لا يؤثر في المتغير التابع.'
    }
    return null
  })

  const slopeCalc = computed(() => {
    if (!regression.value || points.value.length < 2) return null
    const s = regression.value.slope
    const x = xKey.value; const y = yKey.value
    if ((x === 'mass' || x === 'm') && (y === 'T2' || y === 'T²')) {
      const k = (4 * Math.PI * Math.PI) / s
      return { label: 'k من الانحدار', formula: 'k = 4π² / ميل(T² vs m)', value: k, unit: 'N/m', expr: `4π² / ${s.toFixed(4)}` }
    }
    if ((x === 'length' || x === 'L') && (y === 'T2' || y === 'T²')) {
      const g = (4 * Math.PI * Math.PI) / s
      return { label: 'g من الانحدار', formula: 'g = 4π² / ميل(T² vs L)', value: g, unit: 'm/s²', expr: `4π² / ${s.toFixed(4)}` }
    }
    if ((x === 't2' || x === 't²') && y === 'h') {
      const g = 2 * s
      return { label: 'g من الانحدار', formula: 'g = 2 · ميل(h vs t²)', value: g, unit: 'm/s²', expr: `2 × ${s.toFixed(4)}` }
    }
    if (x === 'sinTheta' && y === 'acceleration') {
      return { label: 'g من المنحدر', formula: 'g = ميل(a vs sinθ)', value: s, unit: 'm/s²', expr: `${s.toFixed(4)}` }
    }
    if (x === 'KEi' && y === 'KEf') {
      return { label: 'نسبة حفظ الطاقة', formula: 'KEf/KEi = ميل', value: s, unit: '', expr: `${s.toFixed(4)}` }
    }
    if (x === 'Pi' && y === 'Pf') {
      return { label: 'نسبة حفظ الزخم', formula: 'Pf/Pi = ميل', value: s, unit: '', expr: `${s.toFixed(4)}` }
    }
    // Projectile: H vs R → tanθ = 4×slope → θ = arctan(4s)
    if ((x === 'rangeMeters' || x === 'R') && (y === 'maxHeightMeters' || y === 'H')) {
      const tanTheta = 4 * s
      const thetaDeg = Math.atan(tanTheta) * 180 / Math.PI
      return {
        label: 'θ من الانحدار',
        formula: 'tanθ = 4·ميل(H vs R) → θ = arctan(4s)',
        value: thetaDeg,
        unit: '°',
        expr: `arctan(4×${s.toFixed(4)}) = ${thetaDeg.toFixed(2)}°`
      }
    }
    // Projectile: v0² vs R → slope = sin(2θ)/g → g = sin(2θ)/slope
    if (x === 'v0Squared' && (y === 'rangeMeters' || y === 'R')) {
      return { label: 'sin(2θ)/g من الانحدار', formula: 'ميل = sin(2θ)/g', value: s, unit: 's²/m', expr: `${s.toFixed(4)}` }
    }
    // Projectile: sin2Theta vs R → slope = v₀²/g
    if (x === 'sin2Theta' && (y === 'rangeMeters' || y === 'R')) {
      return { label: 'v₀²/g من الانحدار', formula: 'ميل = v₀²/g', value: s, unit: 'm', expr: `${s.toFixed(4)}` }
    }
    // Lever: massLeft vs invXLeft → slope = m₂·d₂
    if ((x === 'invXLeft' || x === '1/xLeft') && (y === 'massLeft' || y === 'm1')) {
      return { label: 'm₂·d₂ من الانحدار', formula: 'ميل = m₂·d₂', value: s, unit: 'kg·m', expr: `${s.toFixed(4)}` }
    }
    if ((x === 'invXRight' || x === '1/xRight') && (y === 'massRight' || y === 'm2')) {
      return { label: 'm₁·d₁ من الانحدار', formula: 'ميل = m₁·d₁', value: s, unit: 'kg·m', expr: `${s.toFixed(4)}` }
    }
    return null
  })

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
      ctx.fillText('اختر محورين للرسم', w / 2, h / 2)
      return
    }

    const metrics = getChartMetrics()
    const { pad, minX, maxX, minY, rangeX, rangeY, dataMinX, dataMinY, dataRangeX, dataRangeY } = metrics

    const toPx = (x: number, y: number) => ({
      px: pad + ((x - minX) / rangeX) * (w - pad * 2),
      py: h - pad - ((y - minY) / rangeY) * (h - pad * 2),
    })

    // Calculate tick counts based on available space
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

  let ro: ResizeObserver | null = null
  onMounted(() => {
    setTimeout(() => draw(), 100)
    if (containerRef.value) {
      ro = new ResizeObserver(() => draw())
      ro.observe(containerRef.value)
    }
    const canvas = canvasRef.value
    if (canvas) {
      canvas.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('mouseleave', () => { hoverPoint.value = null; tooltip.value = ''; draw() })
    }
  })
  onUnmounted(() => {
    if (ro) ro.disconnect()
    const canvas = canvasRef.value
    if (canvas) { canvas.removeEventListener('mousemove', onMouseMove) }
  })

  return {
    xKey,
    yKey,
    containerRef,
    canvasRef,
    numericKeys,
    regression,
    slopeWarning,
    slopeCalc,
    showSlopeResult,
    showAxisControls,
    xAxisLabel,
    yAxisLabel,
    draw,
  }
}
