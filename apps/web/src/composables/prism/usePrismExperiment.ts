import { ref, reactive, computed } from 'vue'
import { usePrismLayout } from './usePrismLayout'
import { usePrismTrials } from './usePrismTrials'
import { calculatePrismAngles, linearRegression, getMaterialList } from './usePrismCalculations'

export function usePrismExperiment() {
  const layout = usePrismLayout()

  const params = reactive({
    prismAngle: 60,
    angleIncidence: 45,
    wavelength: 580,
    material: 'glass',
  })

  const running = ref(false)
  const paused = ref(false)
  const colWidths = reactive({ data: 280, ctrl: 280 })

  const angles = computed(() => calculatePrismAngles(params.prismAngle, params.angleIncidence, params.wavelength, params.material))

  const angleRefraction1 = computed(() => angles.value.angleRefraction1)
  const angleIncidence2 = computed(() => angles.value.angleIncidence2)
  const angleEmergence = computed(() => angles.value.angleEmergence)
  const deviation = computed(() => angles.value.deviation)
  const nValue = computed(() => angles.value.n)
  const totalInternalReflection = computed(() => angles.value.tir)

  const speedInMedium = computed(() => {
    const n = nValue.value
    if (!n || n <= 0) return null
    return Math.round(3e8 / n / 1e4) / 100
  })
  const criticalAngle = computed(() => {
    const n = nValue.value
    if (n <= 1) return null
    return Math.round(Math.asin(1 / n) * 180 / Math.PI * 10) / 10
  })

  const trials = usePrismTrials(
    { get value() { return params } },
    { get value() { return lab.angleEmergence.value } },
    { get value() { return lab.deviation.value } },
    { get value() { return lab.nValue.value } }
  )

  const regression = computed(() => {
    if (trials.trials.value.length < 2) return { m: 0, b: 0, r2: 0 }
    const pts = trials.trials.value.map(t => ({ x: t.wavelength, y: t.deviation }))
    return linearRegression(pts)
  })

  const nFromRegression = computed(() => {
    if (!regression.value || trials.trials.value.length < 2) return null
    const m = regression.value.m
    if (Math.abs(m) < 1e-12) return null
    return -regression.value.b / m
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

  function handleDrop(fromId: string, toId: string) {
    for (const col of Object.keys(layout.columnMap)) {
      const arr = layout.columnMap[col]
      const fi = arr.indexOf(fromId)
      const ti = arr.indexOf(toId)
      if (fi >= 0 && ti >= 0) {
        arr.splice(fi, 1)
        arr.splice(ti, 0, fromId)
      }
    }
  }

  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload = { experiment: 'prism', trials: trials.trials.value, regression: regression.value }
    localStorage.setItem('analysis_payload', JSON.stringify(payload))
    window.open('/analysis', '_blank')
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
    nFromRegression,
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
        colWidths[col as keyof typeof colWidths] = Math.max(220, startW + delta) as any
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
