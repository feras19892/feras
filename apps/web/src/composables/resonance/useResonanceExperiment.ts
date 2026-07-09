import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useResonanceLayout } from './useResonanceLayout'
import { useResonanceTrials } from './useResonanceTrials'
import { standingWaveFreq, wavelengthOpenString, waveSpeedFromTension } from './useResonanceCalculations'

export function useResonanceExperiment() {
  const params = reactive({
    stringLength: 1.0,
    tension: 10,
    harmonic: 1,
    damping: 0,
  })

  watch(() => params.stringLength, (v) => { params.stringLength = Math.max(0.1, Math.min(3.0, v)) })
  watch(() => params.tension, (v) => { params.tension = Math.max(1, Math.min(100, Math.round(v))) })
  watch(() => params.harmonic, (v) => { params.harmonic = Math.max(1, Math.min(10, Math.round(v))) })
  watch(() => params.damping, (v) => { params.damping = Math.max(0, Math.min(2.0, Math.round(v * 100) / 100)) })

  const running = ref(false)
  const paused = ref(false)
  const startTime = ref(0)

  const frequency = computed(() => standingWaveFreq(params.stringLength, params.harmonic, params.tension))
  const wavelength = computed(() => wavelengthOpenString(params.stringLength, params.harmonic))
  const waveSpeed = computed(() => waveSpeedFromTension(params.tension))

  const waveformData = computed(() => {
    const pts: { x: number; y: number }[] = []
    const L = params.stringLength
    const N = 200
    const amp = 40
    const omega = 2 * Math.PI * frequency.value
    const elapsed = running.value && !paused.value ? (Date.now() - startTime.value) / 1000 : 0
    const dampingFactor = Math.exp(-params.damping * elapsed)
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * L
      const k = (Math.PI * params.harmonic) / L
      const y = amp * dampingFactor * Math.sin(k * x) * Math.cos(omega * elapsed)
      pts.push({ x, y })
    }
    return pts
  })

  const layout = useResonanceLayout()

  const trials = useResonanceTrials(
    { get value() { return params } },
    { get value() { return frequency.value } },
    { get value() { return wavelength.value } }
  )

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false; startTime.value = Date.now() }
    else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false; startTime.value = 0
  }
  const router = useRouter()
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload: AnalysisPayload = {
      sourceExperiment: 'resonance',
      sourceNameAr: 'الموجات القائمة',
      hasCalcTab: true,
      readings: trials.trials.value.map(t => ({ L: t.stringLength, T: t.tension, n: t.harmonic, f: t.frequency, lambda: t.wavelength })),
      columns: [
        { key: 'L', label: 'L (m)', unit: 'm' },
        { key: 'T', label: 'T (N)', unit: 'N' },
        { key: 'n', label: 'n', unit: '' },
        { key: 'f', label: 'f (Hz)', unit: 'Hz' },
        { key: 'lambda', label: 'λ (m)', unit: 'm' },
      ],
      equations: [
        { name: 'Standing Wave', formula: 'f = n*v/(2*L)', variables: [{ symbol: 'f', label: 'Frequency' }, { symbol: 'n', label: 'Harmonic' }, { symbol: 'L', label: 'String length' }], solveFor: ['f'] },
      ],
      suggestedPlots: [{ xKey: 'L', yKey: 'f', xLabel: 'L (m)', yLabel: 'f (Hz)', type: 'scatter' }],
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

  const lab = { running, paused, frequency, wavelength, waveSpeed, waveformData, togglePause }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
