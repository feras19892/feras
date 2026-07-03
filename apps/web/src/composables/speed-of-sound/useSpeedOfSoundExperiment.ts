import { ref, reactive, computed, watch } from 'vue'
import type { AnalysisPayload } from '../../types/physics'
import { useSpeedOfSoundLayout } from './useSpeedOfSoundLayout'
import { useSpeedOfSoundTrials } from './useSpeedOfSoundTrials'
import { speedOfSoundAir, wavelengthClosedEnd, speedFromResonance } from './useSpeedOfSoundCalculations'

export function useSpeedOfSoundExperiment() {
  const params = reactive({
    tubeLength: 0.25,
    frequency: 343,
    temperature: 20,
    harmonic: 1 as 1 | 3,
  })

  watch(() => params.tubeLength, (v) => { params.tubeLength = Math.max(0.05, Math.min(2.0, v)) })
  watch(() => params.frequency, (v) => { params.frequency = Math.max(20, Math.min(2000, Math.round(v / 5) * 5)) })
  watch(() => params.temperature, (v) => { params.temperature = Math.max(-10, Math.min(50, Math.round(v))) })

  const running = ref(false)
  const paused = ref(false)

  const wavelength = computed(() => wavelengthClosedEnd(params.tubeLength, params.harmonic))
  const vMeasured = computed(() => speedFromResonance(params.tubeLength, params.frequency, params.harmonic))
  const vTheory = computed(() => speedOfSoundAir(params.temperature))
  const percentError = computed(() => vTheory.value > 0 ? Math.abs((vMeasured.value - vTheory.value) / vTheory.value) * 100 : 0)

  const waveformData = computed(() => {
    const pts: { x: number; y: number }[] = []
    const L = params.tubeLength
    const N = 200
    const amp = 30
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * L
      const k = (Math.PI * params.harmonic) / (2 * L)
      const y = amp * Math.sin(k * x + (running.value ? Date.now() / 200 : 0))
      pts.push({ x, y })
    }
    return pts
  })

  const layout = useSpeedOfSoundLayout()

  const trials = useSpeedOfSoundTrials(
    { get value() { return params } },
    { get value() { return wavelength.value } },
    { get value() { return vMeasured.value } },
    { get value() { return vTheory.value } }
  )

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false
    params.tubeLength = 0.25; params.frequency = 343; params.temperature = 20; params.harmonic = 1
    trials.clearTrials()
  }
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload: AnalysisPayload = {
      sourceExperiment: 'speed-of-sound',
      sourceNameAr: 'سرعة الصوت',
      readings: trials.trials.value.map(t => ({ L: t.tubeLength, f: t.frequency, T: t.temperature, lambda: t.wavelength, v: t.vMeasured })),
      columns: [
        { key: 'L', label: 'L (m)', unit: 'm' },
        { key: 'f', label: 'f (Hz)', unit: 'Hz' },
        { key: 'T', label: 'T (°C)', unit: '°C' },
        { key: 'lambda', label: 'λ (m)', unit: 'm' },
        { key: 'v', label: 'v (m/s)', unit: 'm/s' },
      ],
      equations: [
        { name: 'Speed of Sound', formula: 'v = f * lambda', variables: [{ symbol: 'v', label: 'Speed' }, { symbol: 'f', label: 'Frequency' }, { symbol: 'λ', label: 'Wavelength' }], solveFor: ['v'] },
      ],
      suggestedPlots: [{ xKey: 'L', yKey: 'v', xLabel: 'L (m)', yLabel: 'v (m/s)', type: 'scatter' }],
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

  const lab = { running, paused, wavelength, vMeasured, vTheory, percentError, waveformData, togglePause }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
