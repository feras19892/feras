import { ref, reactive, computed, watch } from 'vue'
import type { AnalysisPayload } from '../../types/physics'
import { useGratingLayout } from './useGratingLayout'
import { useGratingTrials } from './useGratingTrials'
import { wavelengthToColor } from './useGratingCalculations'

export function useGratingExperiment() {
  const params = reactive({
    linesPerMm: 500,
    screenDistance: 1.0,
    wavelength: 580,
  })

  watch(() => params.linesPerMm, (v) => { params.linesPerMm = Math.max(100, Math.min(5000, Math.round(v / 50) * 50)) })
  watch(() => params.screenDistance, (v) => { params.screenDistance = Math.max(0.1, Math.min(5.0, v)) })
  watch(() => params.wavelength, (v) => { params.wavelength = Math.max(380, Math.min(700, Math.round(v / 5) * 5)) })

  const running = ref(false)
  const paused = ref(false)

  const d = computed(() => 1 / params.linesPerMm) // mm
  const lam = computed(() => params.wavelength)
  const D = computed(() => params.screenDistance)

  // Grating equation: d*sinθ = m*λ → sinθ = m*λ/d
  const maxOrder = computed(() => {
    const sinMax = d.value / (lam.value / 1e6) // d(mm) / λ(mm)
    return Math.max(0, Math.floor(sinMax))
  })

  const orderPositions = computed(() => {
    const pts: { m: number; yMm: number; intensity: number }[] = []
    const maxM = maxOrder.value
    for (let m = -maxM; m <= maxM; m++) {
      const sinTheta = (m * lam.value / 1e6) / d.value
      if (Math.abs(sinTheta) > 1) continue
      const theta = Math.asin(sinTheta)
      const y = Math.tan(theta) * D.value * 1000 // mm
      pts.push({ m, yMm: y, intensity: m === 0 ? 1 : 0.3 })
    }
    return pts
  })

  const firstOrderAngle = computed(() => {
    const sinTheta = (lam.value / 1e6) / d.value
    return Math.abs(sinTheta) > 1 ? 0 : Math.asin(sinTheta) * (180 / Math.PI)
  })

  const firstOrderY = computed(() => {
    const sinTheta = (lam.value / 1e6) / d.value
    if (Math.abs(sinTheta) > 1) return 0
    return Math.tan(Math.asin(sinTheta)) * D.value * 1000
  })

  const lightColor = computed(() => wavelengthToColor(lam.value))

  const layout = useGratingLayout()

  const trials = useGratingTrials(
    { get value() { return params } },
    { get value() { return maxOrder.value } },
    { get value() { return firstOrderAngle.value } },
    { get value() { return firstOrderY.value } }
  )

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else { paused.value = !paused.value }
  }

  function resetSim() {
    running.value = false; paused.value = false
    params.linesPerMm = 500; params.screenDistance = 1.0; params.wavelength = 580
    trials.clearTrials()
  }

  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload: AnalysisPayload = {
      sourceExperiment: 'grating',
      sourceNameAr: 'محبز الحيود',
      readings: trials.trials.value.map(t => ({
        N: t.linesPerMm, D: t.screenDistance, lambda: t.wavelength,
        theta1: t.firstOrderAngle, y1: t.firstOrderY,
      })),
      columns: [
        { key: 'N', label: 'N (lines/mm)', unit: 'lines/mm' },
        { key: 'D', label: 'D (m)', unit: 'm' },
        { key: 'lambda', label: 'λ (nm)', unit: 'nm' },
        { key: 'theta1', label: 'θ₁ (°)', unit: '°' },
        { key: 'y1', label: 'y₁ (mm)', unit: 'mm' },
      ],
      equations: [
        { name: 'Grating Equation', formula: 'd*sin(theta)=m*lambda', variables: [{ symbol: 'd', label: 'Grating spacing' }, { symbol: 'θ', label: 'Diffraction angle' }, { symbol: 'm', label: 'Order' }, { symbol: 'λ', label: 'Wavelength' }], solveFor: ['lambda'] },
      ],
      suggestedPlots: [{ xKey: 'N', yKey: 'theta1', xLabel: 'N (lines/mm)', yLabel: 'θ₁ (°)', type: 'scatter' }],
    }
    localStorage.setItem('analysis_payload', JSON.stringify(payload))
    window.open('/analysis', '_blank')
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
    const startX = e.clientX, startW = (layout.widths as any)[col] as number
    function move(ev: MouseEvent) { (layout.widths as any)[col] = Math.max(220, startW + (ev.clientX - startX)) }
    function up() { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }

  const lab = { running, paused, orderPositions, maxOrder, firstOrderAngle, firstOrderY, lightColor, togglePause }

  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
