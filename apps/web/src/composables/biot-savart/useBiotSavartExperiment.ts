import { ref, reactive, computed, watch } from 'vue'
import type { AnalysisPayload } from '../../types/physics'
import { useBiotSavartLayout } from './useBiotSavartLayout'
import { useBiotSavartTrials } from './useBiotSavartTrials'
import { magneticFieldWire, magneticFieldLoop, magneticFieldSolenoid } from './useBiotSavartCalculations'

export function useBiotSavartExperiment() {
  const params = reactive({
    I: 5,        // A
    r: 0.05,     // m
    R: 0.1,      // m (loop radius)
    n: 100,      // turns per meter
    shape: 'wire' as 'wire' | 'loop' | 'solenoid',
  })

  watch(() => params.I, (v) => { params.I = Math.max(0.1, Math.min(20, Math.round(v * 10) / 10)) })
  watch(() => params.r, (v) => { params.r = Math.max(0.001, Math.min(1, Math.round(v * 1000) / 1000)) })
  watch(() => params.R, (v) => { params.R = Math.max(0.01, Math.min(1, Math.round(v * 100) / 100)) })
  watch(() => params.n, (v) => { params.n = Math.max(10, Math.min(1000, Math.round(v / 10) * 10)) })

  const running = ref(false)
  const paused = ref(false)
  const simTime = ref(0)
  const phase = ref<'ready' | 'running' | 'done'>('ready')

  const B = computed(() => {
    switch (params.shape) {
      case 'wire': return magneticFieldWire(params.I, params.r)
      case 'loop': return magneticFieldLoop(params.I, params.R, 0)
      case 'solenoid': return magneticFieldSolenoid(params.I, params.n)
      default: return 0
    }
  })

  function updateSim(dt: number) {
    if (!running.value || paused.value) return
    simTime.value += dt
    phase.value = 'running'
    if (simTime.value > 5) phase.value = 'done'
  }

  function togglePause() {
    if (!running.value) {
      running.value = true; paused.value = false; simTime.value = 0
      phase.value = 'running'
    } else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false; simTime.value = 0; phase.value = 'ready'
  }

  const layout = useBiotSavartLayout()
  const trials = useBiotSavartTrials(
    { get value() { return { I: params.I, r: params.r, B: B.value, shape: params.shape } } }
  )

  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload: AnalysisPayload = {
      sourceExperiment: 'biot-savart', sourceNameAr: 'بيوسافار',
      readings: trials.trials.value.map(t => ({ I: t.I, r: t.r, B: t.B, shape: t.shape })),
      columns: [
        { key: 'I', label: 'I (A)', unit: 'A' },
        { key: 'r', label: 'r (m)', unit: 'm' },
        { key: 'B', label: 'B (T)', unit: 'T' },
        { key: 'shape', label: 'Shape', unit: '' },
      ],
      equations: [
        { name: 'Biot-Savart (Wire)', formula: 'B = μ₀I / 2πr', variables: [{ symbol: 'B', label: 'Magnetic field' }, { symbol: 'I', label: 'Current' }, { symbol: 'r', label: 'Distance' }], solveFor: ['B'] },
      ],
      suggestedPlots: [{ xKey: 'r', yKey: 'B', xLabel: 'r (m)', yLabel: 'B (T)', type: 'scatter' }],
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
      const fi = arr.indexOf(fromId), ti = arr.indexOf(toId)
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

  const lab = { running, paused, simTime, phase, B, togglePause, updateSim }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
