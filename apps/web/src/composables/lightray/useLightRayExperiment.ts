import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useLightRayLayout, type ColumnId } from './useLightRayLayout'
import { useLightRayTrials } from './useLightRayTrials'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export interface LightRayTrial {
  id: number
  angleIncidence: number
  angleReflection: number
  angleRefraction: number
  sinI: number
  sinT: number
  n1: number
  n2: number
}

export interface LightRayParams {
  angleIncidence: number
  n1: number
  n2: number
}

const SPEED_OF_LIGHT_C = 3e8

function toRad(deg: number) { return (deg * Math.PI) / 180 }

function getMediumName(n2: number): string {
  const map: Record<number, string> = { 1.0: 'هواء', 1.33: 'ماء', 1.5: 'زجاج', 2.42: 'ألماس' }
  return map[n2] ?? `وسط (${n2.toFixed(2)})`
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return { m: 0, b: 0, r2: 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (const p of points) {
    sumX += p.x; sumY += p.y; sumXY += p.x * p.y
    sumX2 += p.x * p.x; sumY2 += p.y * p.y
  }
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - m * sumX) / n
  const ssTot = sumY2 - (sumY * sumY) / n
  const ssRes = sumY2 - 2 * m * sumXY - 2 * b * sumY + m * m * sumX2 + 2 * m * b * sumX + n * b * b
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  return { m, b, r2 }
}

export function useLightRayExperiment() {
  const params = reactive<LightRayParams>({ angleIncidence: 45, n1: 1.0, n2: 1.5 })
  const running = ref(false)
  const paused = ref(false)
  const colWidths = reactive({ data: 280, ctrl: 280 })

  const angleReflection = computed(() => params.angleIncidence)
  const angleRefraction = computed(() => {
    const rad = toRad(params.angleIncidence)
    const sinT2 = (params.n1 / params.n2) * Math.sin(rad)
    if (sinT2 > 1) return null
    return (Math.asin(sinT2) * 180) / Math.PI
  })
  const totalInternalReflection = computed(() => angleRefraction.value === null)
  const criticalAngle = computed(() => {
    if (params.n1 <= params.n2) return null
    return (Math.asin(params.n2 / params.n1) * 180) / Math.PI
  })
  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else { paused.value = !paused.value }
  }

  const lab = {
    running,
    paused,
    angleReflection,
    angleRefraction,
    totalInternalReflection,
    criticalAngle,
    togglePause,
  }

  const layout = useLightRayLayout()
  const trials = useLightRayTrials(
    { get value() { return params } },
    { get value() { return lab.angleRefraction.value } },
    { get value() { return lab.angleReflection.value } }
  )

  const regression = computed(() => {
    const pts = trials.trials.value.map((t) => ({ x: t.sinT, y: t.sinI }))
    return linearRegression(pts)
  })

  const calculatedN2 = computed(() => {
    const m = regression.value.m
    if (m <= 0 || !isFinite(m)) return null
    // slope m = n₂/n₁  →  n₂ = m × n₁
    return m * params.n1
  })

  const speedInMedium = computed(() => {
    const n2 = calculatedN2.value
    if (!n2 || n2 <= 0) return null
    return SPEED_OF_LIGHT_C / n2
  })

  function resetSim() {
    running.value = false
    paused.value = false
    params.angleIncidence = 45
    params.n1 = 1.0
    params.n2 = 1.5
    trials.clearTrials()
  }

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX
    const startData = colWidths.data
    const startCtrl = colWidths.ctrl
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      if (side === 'data') colWidths.data = Math.max(160, Math.min(500, startData + dx))
      else colWidths.ctrl = Math.max(160, Math.min(500, startCtrl - dx))
    }
    function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleDrop(id: string, x: number, y: number) {
    const cols: ColumnId[] = ['data', 'vis', 'ctrl']
    const colClasses: Record<string, string> = { data: 'data-col', vis: 'vis-col', ctrl: 'ctrl-col' }
    for (const col of cols) {
      const colEl = document.querySelector(`.${colClasses[col]}`)
      if (!colEl) continue
      const colRect = colEl.getBoundingClientRect()
      if (x >= colRect.left && x < colRect.right && y >= colRect.top && y < colRect.bottom) {
        const panelEls = Array.from(colEl.querySelectorAll('.draggable-panel[data-id]'))
        let insertAfterId: string | null = null
        for (const el of panelEls) {
          const pid = el.getAttribute('data-id')
          if (!pid || pid === id) continue
          const rect = el.getBoundingClientRect()
          if (y >= rect.top && y <= rect.bottom) { if (y > rect.top + rect.height / 2) insertAfterId = pid; break }
          if (y > rect.bottom) insertAfterId = pid
        }
        layout.movePanel(id, col, insertAfterId)
        return
      }
    }
  }

  function getColumnPanels(col: ColumnId) { return layout.columnOrder[col] }

  const router = useRouter()
  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { console.warn('[exportToAnalysis] no trials recorded'); return }

    const readings = tList.map((t) => ({
      theta_i: t.angleIncidence,
      theta_t: t.angleRefraction,
      sin_i: t.sinI,
      sin_t: t.sinT,
    }))

    const payload: AnalysisPayload = {
      sourceExperiment: 'light-ray',
      sourceNameAr: 'شعاع الضوء',
      readings,
      columns: [
        { key: 'theta_i', label: 'زاوية السقوط', unit: 'deg' },
        { key: 'theta_t', label: 'زاوية الانكسار', unit: 'deg' },
        { key: 'sin_i', label: 'sin θᵢ', unit: '' },
        { key: 'sin_t', label: 'sin θₜ', unit: '' },
      ],
      equations: [
        {
          name: 'قانون الانعكاس',
          formula: 'θᵣ = θᵢ',
          variables: [
            { symbol: 'θᵢ', label: 'زاوية السقوط' },
            { symbol: 'θᵣ', label: 'زاوية الانعكاس' },
          ],
          solveFor: ['θᵣ'],
        },
        {
          name: 'قانون سنل',
          formula: 'n₁ sin θᵢ = n₂ sin θₜ',
          variables: [
            { symbol: 'n₁', label: 'معامل الانكسار 1' },
            { symbol: 'n₂', label: 'معامل الانكسار 2' },
            { symbol: 'θᵢ', label: 'زاوية السقوط' },
            { symbol: 'θₜ', label: 'زاوية الانكسار' },
          ],
          solveFor: ['n₂'],
        },
      ],
      suggestedPlots: [
        { xKey: 'sin_t', yKey: 'sin_i', xLabel: 'sin θₜ', yLabel: 'sin θᵢ', type: 'scatter' as const },
      ],
      mediumType: getMediumName(params.n2),
      mediumN2: params.n2,
      calculatedN2: calculatedN2.value ?? undefined,
      expectedN2: params.n2,
    }

    sendToAnalysis(router, payload)
  }

  return {
    params,
    lab,
    layout,
    trials,
    regression,
    calculatedN2,
    speedInMedium,
    resetSim,
    colWidths,
    onResizeStart,
    handleDrop,
    getColumnPanels,
    exportToAnalysis,
  }
}
