import { ref, reactive, computed, watch } from 'vue'
import { useAnomalyWatcher } from '../experiment/useAnomalyWatcher'
import { usePrismLayout } from './usePrismLayout'
import { usePrismTrials } from './usePrismTrials'
import { calculatePrismAngles, linearRegression, getMaterialList } from './usePrismCalculations'

export function usePrismExperiment() {
  const watcher = useAnomalyWatcher('prism', [
    {
      name: 'nan-infinity',
      check: (s) => Object.values(s).some((v) => typeof v === 'number' && (!Number.isFinite(v))),
      severity: 'fatal',
      message: 'NaN or Infinity detected in prism calculation',
    },
    {
      name: 'negative-refractive-index',
      check: (s) => (s.n !== undefined && typeof s.n === 'number' && s.n < 0),
      severity: 'error',
      message: 'Negative refractive index (n < 0)',
    },
    {
      name: 'invalid-prism-angle',
      check: (s) => (s.prismAngle !== undefined && typeof s.prismAngle === 'number' && (s.prismAngle <= 0 || s.prismAngle >= 180)),
      severity: 'error',
      message: 'Prism angle outside valid range (0°, 180°)',
    },
    {
      name: 'impossible-deviation',
      check: (s) => (s.deviation !== undefined && typeof s.deviation === 'number' && Math.abs(s.deviation) > 180),
      severity: 'warn',
      message: 'Deviation angle exceeds 180° — check incidence angle',
    },
  ])
  const layout = usePrismLayout()

  const params = reactive({
    prismAngle: 60,
    angleIncidence: 45,
    wavelength: 580,
    material: 'glass',
    hitRatio: 0.5,
  })

  watch(() => params.prismAngle, (v) => { params.prismAngle = Math.max(30, Math.min(90, Math.round(v))) })
  watch(() => params.angleIncidence, (v) => { params.angleIncidence = Math.max(0, Math.min(89, Math.round(v))) })
  watch(() => params.wavelength, (v) => { params.wavelength = Math.max(380, Math.min(700, Math.round(v / 5) * 5)) })
  watch(() => params.hitRatio, (v) => { params.hitRatio = Math.max(0.05, Math.min(0.95, v)) })

  const running = ref(false)
  const paused = ref(false)
  const colWidths = reactive({ data: 280, ctrl: 280 })

  const angles = computed(() => calculatePrismAngles(params.prismAngle, params.angleIncidence, params.wavelength, params.material))

  // Anomaly check after every angle recalculation
  watcher.inspect({
    prismAngle: params.prismAngle,
    angleIncidence: params.angleIncidence,
    wavelength: params.wavelength,
    n: angles.value.n,
    angleRefraction1: angles.value.angleRefraction1,
    angleIncidence2: angles.value.angleIncidence2,
    angleEmergence: angles.value.angleEmergence,
    deviation: angles.value.deviation,
    tir: angles.value.tir,
  })

  const angleRefraction1 = computed(() => angles.value.angleRefraction1)
  const angleIncidence2 = computed(() => angles.value.angleIncidence2)
  const angleEmergence = computed(() => angles.value.angleEmergence)
  const deviation = computed(() => angles.value.deviation)
  const nValue = computed(() => angles.value.n)
  const totalInternalReflection = computed(() => angles.value.tir)

  const speedInMedium = computed(() => {
    const n = nValue.value
    if (!n || n <= 0) return null
    return 3e8 / n
  })
  const criticalAngle = computed(() => {
    const n = nValue.value
    if (n <= 1) return null
    return Math.round(Math.asin(1 / n) * 180 / Math.PI * 10) / 10
  })

  const trials = usePrismTrials(
    { get value() { return params } },
    angleEmergence,
    deviation,
    nValue
  )

  const regression = computed(() => {
    const valid = trials.trials.value.filter(t => t.deviation !== null)
    if (valid.length < 2) return { m: 0, b: 0, r2: 0 }
    const pts = valid.map(t => ({ x: t.wavelength, y: t.deviation as number }))
    return linearRegression(pts)
  })

  const avgN = computed(() => {
    if (trials.trials.value.length === 0) return null
    const sum = trials.trials.value.reduce((s, t) => s + t.n, 0)
    return sum / trials.trials.value.length
  })

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else { paused.value = !paused.value }
  }

  function recordTrial() {
    trials.recordTrial()
  }

  function resetSim() {
    running.value = false
    paused.value = false
    params.prismAngle = 60
    params.angleIncidence = 45
    params.wavelength = 580
    params.material = 'glass'
    trials.clearTrials()
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
      if (fi >= 0 && ti >= 0) {
        const temp = arr[fi]
        arr[fi] = arr[ti]
        arr[ti] = temp
      }
    }
  }

  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload = { experiment: 'prism', trials: trials.trials.value, regression: regression.value }
    localStorage.setItem('analysis_payload', JSON.stringify(payload))
    window.open('/analysis', '_blank')
  }

  function downloadCsv() {
    const csv = trials.exportCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prism-trials.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const materials = getMaterialList()

  function getColumnPanels(col: string) {
    return layout.columnMap[col] ?? []
  }

  const lab = {
    running,
    paused,
    angleRefraction1,
    angleIncidence2,
    angleEmergence,
    deviation,
    nValue,
    totalInternalReflection,
    criticalAngle,
    speedInMedium,
    togglePause,
  }

  return {
    params,
    lab,
    layout,
    trials,
    materials,
    regression,
    avgN,
    downloadCsv,
    recordTrial,
    resetSim,
    handleDrop,
    exportToAnalysis,
    colWidths,
    getColumnPanels,
    onResizeStart: (col: string, e: MouseEvent) => {
      const startX = e.clientX
      const startW = colWidths[col as keyof typeof colWidths] as number
      function move(ev: MouseEvent) {
        const delta = ev.clientX - startX
        colWidths[col as keyof typeof colWidths] = Math.max(220, startW + delta) as number
      }
      function up() {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    },
  }
}
