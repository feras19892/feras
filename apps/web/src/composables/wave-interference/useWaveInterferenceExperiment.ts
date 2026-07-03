import { ref, reactive, computed, watch } from 'vue'
import type { AnalysisPayload } from '../../types/physics'
import { useWaveInterferenceLayout } from './useWaveInterferenceLayout'
import { useWaveInterferenceTrials } from './useWaveInterferenceTrials'
import { waveSpeed, constructivePoints, destructivePoints } from './useWaveInterferenceCalculations'

export function useWaveInterferenceExperiment() {
  const params = reactive({
    sourceDistance: 0.05,
    wavelength: 0.02,
    frequency: 20,
    screenDistance: 1.0,
  })
  const mode = ref<'ripple' | 'young' | 'sources'>('ripple')

  watch(() => params.sourceDistance, (v) => { params.sourceDistance = Math.max(0.01, Math.min(0.5, v)) })
  watch(() => params.wavelength, (v) => { params.wavelength = Math.max(0.005, Math.min(0.1, v)) })
  watch(() => params.frequency, (v) => { params.frequency = Math.max(1, Math.min(100, Math.round(v))) })
  watch(() => params.screenDistance, (v) => { params.screenDistance = Math.max(0.1, Math.min(5, v)) })

  const running = ref(false)
  const paused = ref(false)

  const vWave = computed(() => waveSpeed(params.frequency, params.wavelength))
  const pathDiffCentral = computed(() => 0)
  const constructive = computed(() => constructivePoints(params.sourceDistance, params.screenDistance, params.wavelength, 5))
  const destructive = computed(() => destructivePoints(params.sourceDistance, params.screenDistance, params.wavelength, 5))

  const amplitudeMap = computed(() => {
    const pts: { yMm: number; amplitude: number }[] = []
    const range = 200
    const N = 400
    const t = running.value ? Date.now() / 500 : 0
    for (let i = 0; i <= N; i++) {
      const yMm = -range + (i / N) * 2 * range
      const y = yMm / 1000
      const d = params.sourceDistance
      const D = params.screenDistance
      const lambda = params.wavelength
      const k = (2 * Math.PI) / lambda
      const w = 2 * Math.PI * params.frequency
      const r1 = Math.sqrt(D * D + Math.pow(y - d / 2, 2))
      const r2 = Math.sqrt(D * D + Math.pow(y + d / 2, 2))
      const amp = Math.cos(k * r1 - w * t) + Math.cos(k * r2 - w * t)
      pts.push({ yMm, amplitude: amp })
    }
    return pts
  })

  const layout = useWaveInterferenceLayout()

  const trials = useWaveInterferenceTrials(
    { get value() { return params } },
    { get value() { return pathDiffCentral.value } }
  )

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false
    params.sourceDistance = 0.05; params.wavelength = 0.02; params.frequency = 20; params.screenDistance = 1.0
    trials.clearTrials()
  }
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload: AnalysisPayload = {
      sourceExperiment: 'wave-interference',
      sourceNameAr: 'تداخل الموجات',
      readings: trials.trials.value.map(t => ({ d: t.sourceDistance, lambda: t.wavelength, f: t.frequency, D: t.screenDistance })),
      columns: [
        { key: 'd', label: 'd (m)', unit: 'm' },
        { key: 'lambda', label: 'lambda (m)', unit: 'm' },
        { key: 'f', label: 'f (Hz)', unit: 'Hz' },
        { key: 'D', label: 'D (m)', unit: 'm' },
      ],
      equations: [
        { name: 'Wave Speed', formula: 'v = f * lambda', variables: [{ symbol: 'v', label: 'Speed' }, { symbol: 'f', label: 'Frequency' }, { symbol: 'lambda', label: 'Wavelength' }], solveFor: ['v'] },
      ],
      suggestedPlots: [{ xKey: 'd', yKey: 'lambda', xLabel: 'd (m)', yLabel: 'lambda (m)', type: 'scatter' }],
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

  const lab = { running, paused, vWave, pathDiffCentral, constructive, destructive, amplitudeMap, mode, togglePause }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
