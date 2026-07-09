import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { usePolarizationLayout } from './usePolarizationLayout'
import { usePolarizationTrials } from './usePolarizationTrials'
import { malusLaw, degToRad, linearRegression } from './usePolarizationCalculations'

export function usePolarizationExperiment() {
  const params = reactive({
    polarizerAngle: 0,
    analyzerAngle: 45,
    I0: 100,
  })

  watch(() => params.polarizerAngle, (v) => { params.polarizerAngle = ((v % 360) + 360) % 360 })
  watch(() => params.analyzerAngle, (v) => { params.analyzerAngle = ((v % 360) + 360) % 360 })
  watch(() => params.I0, (v) => { params.I0 = Math.max(10, Math.min(200, v)) })

  const running = ref(false)
  const paused = ref(false)

  const relativeAngle = computed(() => {
    const d = params.analyzerAngle - params.polarizerAngle
    return ((d % 360) + 360) % 360
  })

  const outputIntensity = computed(() => malusLaw(params.I0, relativeAngle.value))
  const transmissionPercent = computed(() => params.I0 > 0 ? (outputIntensity.value / params.I0) * 100 : 0)

  const intensityCurve = computed(() => {
    const pts: { theta: number; intensity: number }[] = []
    for (let i = 0; i <= 360; i += 2) {
      pts.push({ theta: i, intensity: malusLaw(params.I0, i - params.polarizerAngle) / Math.max(params.I0, 1) })
    }
    return pts
  })

  // Regression: I vs cos²θ  →  I = I₀ · cos²θ
  // slope = I₀, intercept ≈ 0
  const regression = computed(() => {
    const valid = trials.trials.value.filter((t) => t.outputIntensity >= 0)
    if (valid.length < 2) return { m: 0, b: 0, r2: 0 }
    const pts = valid.map((t) => ({
      x: Math.pow(Math.cos(degToRad(t.relativeAngle)), 2),
      y: t.outputIntensity,
    }))
    return linearRegression(pts)
  })

  const i0FromRegression = computed(() => {
    const m = regression.value.m
    if (!isFinite(m) || m <= 0) return null
    return m
  })

  const layout = usePolarizationLayout()

  const trials = usePolarizationTrials(
    { get value() { return params } },
    { get value() { return outputIntensity.value } },
    { get value() { return relativeAngle.value } }
  )

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false
  }
  const router = useRouter()
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload: AnalysisPayload = {
      sourceExperiment: 'polarization',
      sourceNameAr: 'استقطاب الضوء',
      hasCalcTab: true,
      readings: trials.trials.value.map(t => ({
        theta1: t.polarizerAngle, theta2: t.analyzerAngle, I0: t.I0, Iout: t.outputIntensity, delta: t.relativeAngle,
      })),
      columns: [
        { key: 'theta1', label: 'θ₁ (°)', unit: '°' },
        { key: 'theta2', label: 'θ₂ (°)', unit: '°' },
        { key: 'I0', label: 'I₀', unit: 'a.u.' },
        { key: 'Iout', label: 'I_out', unit: 'a.u.' },
        { key: 'delta', label: 'Δθ (°)', unit: '°' },
      ],
      equations: [
        { name: "Malus's Law", formula: 'I = I0*cos(theta)^2', variables: [{ symbol: 'I', label: 'Output intensity' }, { symbol: 'I₀', label: 'Input intensity' }, { symbol: 'θ', label: 'Relative angle' }], solveFor: ['I0'] },
      ],
      suggestedPlots: [{ xKey: 'delta', yKey: 'Iout', xLabel: 'Δθ (°)', yLabel: 'I_out', type: 'scatter' }],
    }
    sendToAnalysis(router, payload)
  }
  function handleDrop(fromId: string, x?: number, y?: number) {
    if (x === undefined || y === undefined) return
    const el = document.elementFromPoint(x, y)
    const toPanel = el?.closest('.draggable-panel')
    const toId = toPanel?.getAttribute('data-id')
    if (!toId || fromId === toId) return
    for (const col of Object.keys(layout.columnMap)) {
      const arr = layout.columnMap[col]
      const fi = arr.indexOf(fromId)
      const ti = arr.indexOf(toId)
      if (fi >= 0 && ti >= 0) { const t = arr[fi]; arr[fi] = arr[ti]; arr[ti] = t }
    }
  }
  function onResizeStart(col: string, e: MouseEvent) {
    if (!(col in layout.widths)) return
    const startX = e.clientX, startW = (layout.widths as Record<string, number>)[col] as number
    function move(ev: MouseEvent) { (layout.widths as Record<string, number>)[col] = Math.max(220, startW + (ev.clientX - startX)) }
    function up() { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }

  const lab = { running, paused, outputIntensity, relativeAngle, transmissionPercent, intensityCurve, regression, i0FromRegression, togglePause }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
