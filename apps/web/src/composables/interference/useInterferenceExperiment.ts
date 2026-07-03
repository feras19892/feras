import { ref, reactive, computed, watch } from 'vue'
import { useAnomalyWatcher } from '../experiment/useAnomalyWatcher'
import { useInterferenceLayout } from './useInterferenceLayout'
import { useInterferenceTrials } from './useInterferenceTrials'
import { calculateInterference, wavelengthToColor } from './useInterferenceCalculations'
import type { AnalysisPayload } from '../../types/physics'

export function useInterferenceExperiment() {
  const watcher = useAnomalyWatcher('interference', [
    {
      name: 'nan-infinity',
      check: (s) => Object.values(s).some((v) => typeof v === 'number' && (!Number.isFinite(v))),
      severity: 'fatal',
      message: 'NaN or Infinity in interference calculation',
    },
    {
      name: 'negative-slit-distance',
      check: (s) => (s.slitDistance !== undefined && typeof s.slitDistance === 'number' && s.slitDistance <= 0),
      severity: 'error',
      message: 'Slit distance must be positive',
    },
    {
      name: 'zero-screen-distance',
      check: (s) => (s.screenDistance !== undefined && typeof s.screenDistance === 'number' && s.screenDistance <= 0),
      severity: 'error',
      message: 'Screen distance must be positive',
    },
  ])
  const layout = useInterferenceLayout()

  const params = reactive({
    slitDistance: 0.1,
    slitWidth: 0.02,
    screenDistance: 1.5,
    wavelength: 580,
  })

  watch(() => params.slitDistance, (v) => { params.slitDistance = Math.max(0.01, Math.min(2, v)) })
  watch(() => params.slitWidth, (v) => { params.slitWidth = Math.max(0.01, Math.min(0.5, v)) })
  watch(() => params.screenDistance, (v) => { params.screenDistance = Math.max(0.1, Math.min(5, v)) })
  watch(() => params.wavelength, (v) => { params.wavelength = Math.max(380, Math.min(700, Math.round(v / 5) * 5)) })

  const running = ref(false)
  const paused = ref(false)

  const result = computed(() => calculateInterference(params.slitDistance, params.screenDistance, params.wavelength, params.slitWidth))

  watcher.inspect({
    slitDistance: params.slitDistance,
    screenDistance: params.screenDistance,
    wavelength: params.wavelength,
    slitWidth: params.slitWidth,
    fringeSpacing: result.value.fringeSpacingMm,
  })

  const fringeSpacing = computed(() => result.value.fringeSpacingMm)
  const angularSeparation = computed(() => result.value.angularSeparationDeg)
  const intensityPattern = computed(() => result.value.intensityPattern)
  const orderPositions = computed(() => result.value.orderPositionsMm)
  const constructiveOrders = computed(() => result.value.constructiveOrders)
  const destructiveOrders = computed(() => result.value.destructiveOrders)

  const trials = useInterferenceTrials(
    { get value() { return params } },
    fringeSpacing
  )

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else { paused.value = !paused.value }
  }

  function resetSim() {
    running.value = false
    paused.value = false
    params.slitDistance = 0.5
    params.slitWidth = 0.05
    params.screenDistance = 1.0
    params.wavelength = 580
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
    const payload: AnalysisPayload = {
      sourceExperiment: 'interference',
      sourceNameAr: 'تداخل يونغ',
      readings: trials.trials.value.map(t => ({
        d: t.slitDistance,
        D: t.screenDistance,
        lambda: t.wavelength,
        delta_y: t.fringeSpacing,
      })),
      columns: [
        { key: 'd', label: 'd (mm)', unit: 'mm' },
        { key: 'D', label: 'D (m)', unit: 'm' },
        { key: 'lambda', label: 'λ (nm)', unit: 'nm' },
        { key: 'delta_y', label: 'Δy (mm)', unit: 'mm' },
      ],
      equations: [
        {
          name: 'Fringe Spacing',
          formula: 'delta_y = lambda * D / d',
          variables: [
            { symbol: 'Δy', label: 'Fringe spacing' },
            { symbol: 'λ', label: 'Wavelength' },
            { symbol: 'D', label: 'Screen distance' },
            { symbol: 'd', label: 'Slit separation' },
          ],
          solveFor: ['lambda'],
        },
      ],
      suggestedPlots: [
        { xKey: 'd', yKey: 'delta_y', xLabel: 'd (mm)', yLabel: 'Δy (mm)', type: 'scatter' },
      ],
    }
    localStorage.setItem('analysis_payload', JSON.stringify(payload))
    window.open('/analysis', '_blank')
  }

  const lightColor = computed(() => wavelengthToColor(params.wavelength))

  const lab = {
    running,
    paused,
    fringeSpacing,
    angularSeparation,
    intensityPattern,
    orderPositions,
    constructiveOrders,
    destructiveOrders,
    lightColor,
    togglePause,
  }

  function onResizeStart(col: string, e: MouseEvent) {
    if (!(col in layout.widths)) return
    const startX = e.clientX
    const startW = layout.widths[col as keyof typeof layout.widths] as number
    function move(ev: MouseEvent) {
      const delta = ev.clientX - startX
      layout.widths[col as keyof typeof layout.widths] = Math.max(220, startW + delta) as number
    }
    function up() {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return {
    params,
    lab,
    layout,
    trials,
    fringeSpacing,
    angularSeparation,
    intensityPattern,
    orderPositions,
    constructiveOrders,
    destructiveOrders,
    resetSim,
    handleDrop,
    exportToAnalysis,
    onResizeStart,
  }
}
