import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useI18n } from '../useI18n'
import { useDiffractionLayout } from './useDiffractionLayout'
import { useDiffractionTrials } from './useDiffractionTrials'
import { sincSq, wavelengthToColor, linearRegression } from './useDiffractionCalculations'

export function useDiffractionExperiment() {
  const { t } = useI18n()
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

  // Regression for single slit: y (dark fringe 1) vs 1/a
  // Theory: y = (λD/1000) · (1/a)  →  slope = λD/1000,  λ(nm) = slope·1000/D
  const regression = computed(() => {
    const singleTrials = trials.trials.value.filter((tr) => tr.mode === 'single' && tr.darkFringe1 > 0)
    if (singleTrials.length < 2) return { m: 0, b: 0, r2: 0 }
    const pts = singleTrials.map((tr) => ({ x: 1 / tr.slitWidth, y: tr.darkFringe1 }))
    return linearRegression(pts)
  })

  const lambdaFromRegression = computed(() => {
    const m = regression.value.m
    const D = params.screenDistance
    if (!isFinite(m) || m <= 0 || D <= 0) return null
    return (m * 1000) / D
  })

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
  }

  const router = useRouter()
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) {
      alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل')
      return
    }
    const isGrating = mode.value === 'grating'
    const payload: AnalysisPayload = {
      sourceExperiment: 'diffraction',
      sourceNameAr: t('experiments.expDiffraction'),
      hasCalcTab: true,
      readings: trials.trials.value.map(tr => ({
        a: isGrating ? tr.linesPerMm : tr.slitWidth,
        D: tr.screenDistance, lambda: tr.wavelength,
        w: isGrating ? tr.firstOrderAngle : tr.centralWidth,
        y1: isGrating ? tr.firstOrderY : tr.darkFringe1,
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
    sendToAnalysis(router, payload)
  }

  function handleDrop(fromId: string, x?: number, y?: number) {
    if (x === undefined || y === undefined) return
    const el = document.elementFromPoint(x, y)
    const toPanel = el?.closest('.draggable-panel')
    const toId = toPanel?.getAttribute('data-id')
    if (!toId || fromId === toId) return
    let fromCol = '', toCol = ''
    for (const col of Object.keys(layout.columnMap)) {
      if (layout.columnMap[col].includes(fromId)) fromCol = col
      if (layout.columnMap[col].includes(toId)) toCol = col
    }
    if (fromCol === toCol) {
      const arr = layout.columnMap[fromCol]
      const fi = arr.indexOf(fromId)
      const ti = arr.indexOf(toId)
      if (fi >= 0 && ti >= 0) { const tmp = arr[fi]; arr[fi] = arr[ti]; arr[ti] = tmp }
    } else {
      const fromArr = layout.columnMap[fromCol]
      const toArr = layout.columnMap[toCol]
      const fi = fromArr.indexOf(fromId)
      if (fi >= 0) {
        fromArr.splice(fi, 1)
        toArr.push(fromId)
      }
    }
  }

  function onResizeStart(col: string, e: MouseEvent) {
    if (!(col in layout.widths)) return
    const startX = e.clientX, startW = (layout.widths as Record<string, number>)[col] as number
    function move(ev: MouseEvent) { (layout.widths as Record<string, number>)[col] = Math.max(220, startW + (ev.clientX - startX)) }
    function up() { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }

  const lab = { running, paused, intensityPattern, darkFringes, centralWidth, lightColor, orderPositions, maxOrder, firstOrderAngle, firstOrderY, regression, lambdaFromRegression, togglePause }

  return {
    mode, params, lab, layout, trials,
    resetSim, exportToAnalysis,
    onResizeStart, handleDrop,
  }
}
