import { ref, reactive, computed, watch } from 'vue'
import type { AnalysisPayload } from '../../types/physics'
import { useDiffractionLayout } from './useDiffractionLayout'
import { useDiffractionTrials } from './useDiffractionTrials'
import { sincSq, wavelengthToColor } from './useDiffractionCalculations'

export function useDiffractionExperiment() {
  const mode = ref<'single' | 'grating'>('single')

  const params = reactive({
    slitWidth: 0.10,
    screenDistance: 1.0,
    wavelength: 580,
    linesPerMm: 500,
  })

  watch(() => params.slitWidth, (v) => { params.slitWidth = Math.max(0.02, Math.min(1.0, v)) })
  watch(() => params.screenDistance, (v) => { params.screenDistance = Math.max(0.1, Math.min(5.0, v)) })
  watch(() => params.wavelength, (v) => { params.wavelength = Math.max(380, Math.min(700, Math.round(v / 5) * 5)) })
  watch(() => params.linesPerMm, (v) => { params.linesPerMm = Math.max(100, Math.min(5000, Math.round(v / 50) * 50)) })

  const running = ref(false)
  const paused = ref(false)

  const a = computed(() => params.slitWidth)
  const D = computed(() => params.screenDistance)
  const lam = computed(() => params.wavelength)

  /* ── single slit ── */
  const intensityPattern = computed(() => {
    const pts: { yMm: number; intensity: number }[] = []
    const yMax = (lam.value * D.value) / (1000 * a.value) * 4
    for (let i = -200; i <= 200; i++) {
      const y = (i / 200) * yMax
      const beta = (1000 * Math.PI * a.value * Math.abs(y)) / (lam.value * D.value)
      pts.push({ yMm: y, intensity: sincSq(beta) })
    }
    return pts
  })

  const darkFringes = computed(() => {
    const fringes: { m: number; yMm: number }[] = []
    const y1 = (lam.value * D.value) / (1000 * a.value)
    for (let m = 1; m <= 5; m++) {
      fringes.push({ m, yMm: m * y1 })
      fringes.push({ m: -m, yMm: -m * y1 })
    }
    return fringes.sort((a, b) => a.yMm - b.yMm)
  })

  const centralWidth = computed(() => (2 * lam.value * D.value) / (1000 * a.value))

  /* ── grating ── */
  const d = computed(() => 1 / params.linesPerMm)
  const maxOrder = computed(() => {
    const sinMax = d.value / (lam.value / 1e6)
    return Math.max(0, Math.floor(sinMax))
  })
  const orderPositions = computed(() => {
    const pts: { m: number; yMm: number; intensity: number }[] = []
    const maxM = maxOrder.value
    for (let m = -maxM; m <= maxM; m++) {
      const sinTheta = (m * lam.value / 1e6) / d.value
      if (Math.abs(sinTheta) > 1) continue
      const theta = Math.asin(sinTheta)
      const y = Math.tan(theta) * D.value * 1000
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

  const layout = useDiffractionLayout()

  const trials = useDiffractionTrials(
    { get value() { return params } },
    mode,
    { get value() { return centralWidth.value } },
    { get value() { return darkFringes.value.find(f => f.m === 1)?.yMm ?? 0 } },
    { get value() { return firstOrderAngle.value } },
    { get value() { return firstOrderY.value } }
  )

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else { paused.value = !paused.value }
  }

  function resetSim() {
    running.value = false; paused.value = false
    mode.value = 'single'
    params.slitWidth = 0.10; params.screenDistance = 1.0; params.wavelength = 580; params.linesPerMm = 500
    trials.clearTrials()
  }

  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const isGrating = mode.value === 'grating'
    const payload: AnalysisPayload = {
      sourceExperiment: 'diffraction',
      sourceNameAr: isGrating ? 'محبز الحيود' : 'حيود الشق الواحد',
      readings: trials.trials.value.map(t => ({
        a: isGrating ? t.linesPerMm : t.slitWidth,
        D: t.screenDistance, lambda: t.wavelength,
        w: isGrating ? t.firstOrderAngle : t.centralWidth,
        y1: isGrating ? t.firstOrderY : t.darkFringe1,
      })),
      columns: [
        { key: 'a', label: isGrating ? 'N (lines/mm)' : 'a (mm)', unit: isGrating ? 'lines/mm' : 'mm' },
        { key: 'D', label: 'D (m)', unit: 'm' },
        { key: 'lambda', label: 'λ (nm)', unit: 'nm' },
        { key: 'w', label: isGrating ? 'θ₁ (°)' : 'w (mm)', unit: isGrating ? '°' : 'mm' },
        { key: 'y1', label: 'y₁ (mm)', unit: 'mm' },
      ],
      equations: [
        { name: isGrating ? 'Grating Equation' : 'Central Width', formula: isGrating ? 'd*sinθ=m*λ' : 'w = 2*lambda*D/a', variables: [{ symbol: 'w', label: isGrating ? 'First order angle' : 'Central width' }, { symbol: 'λ', label: 'Wavelength' }, { symbol: 'D', label: 'Screen distance' }, { symbol: 'a', label: isGrating ? 'Lines per mm' : 'Slit width' }], solveFor: ['lambda'] },
      ],
      suggestedPlots: [{ xKey: 'a', yKey: 'w', xLabel: isGrating ? 'N (lines/mm)' : 'a (mm)', yLabel: isGrating ? 'θ₁ (°)' : 'w (mm)', type: 'scatter' }],
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

  const lab = { running, paused, intensityPattern, darkFringes, centralWidth, lightColor, orderPositions, maxOrder, firstOrderAngle, firstOrderY, togglePause }

  return {
    mode, params, lab, layout, trials,
    resetSim, exportToAnalysis,
    onResizeStart, handleDrop,
  }
}
