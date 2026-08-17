import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useI18n } from '../useI18n'
import { useFaradayLayout } from './useFaradayLayout'
import { useFaradayTrials } from './useFaradayTrials'
import { magneticFlux, inducedEMF } from './useFaradayCalculations'

export function useFaradayExperiment() {
  const { t } = useI18n()
  const router = useRouter()
  const params = reactive({
    N: 100,      // turns
    B: 0.5,      // T
    A: 0.01,     // m²
    omega: 2,    // rad/s
  })

  watch(() => params.N, (v) => { params.N = Math.max(10, Math.min(500, Math.round(v / 10) * 10)) })
  watch(() => params.B, (v) => { params.B = Math.max(0.1, Math.min(2, Math.round(v * 10) / 10)) })
  watch(() => params.A, (v) => { params.A = Math.max(0.001, Math.min(0.1, Math.round(v * 1000) / 1000)) })
  watch(() => params.omega, (v) => { params.omega = Math.max(0.5, Math.min(10, Math.round(v * 10) / 10)) })

  const running = ref(false)
  const paused = ref(false)
  const simTime = ref(0)
  const phase = ref<'ready' | 'running' | 'done'>('ready')

  const theta = computed(() => (simTime.value * params.omega * 180 / Math.PI) % 360)
  const flux = computed(() => magneticFlux(params.B, params.A, theta.value))
  const emf = computed(() => {
    const dPhi = params.B * params.A * params.omega * Math.sin((theta.value * Math.PI) / 180)
    return Math.abs(inducedEMF(params.N, dPhi, 1))
  })

  function updateSim(dt: number) {
    if (!running.value || paused.value) return
    simTime.value += dt
    phase.value = 'running'
    if (simTime.value > 20) phase.value = 'done'
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

  const layout = useFaradayLayout()
  const trials = useFaradayTrials(
    { get value() { return { N: params.N, B: params.B, A: params.A, omega: params.omega, emf: emf.value } } }
  )

  function exportToAnalysis() {
    if (trials.trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const payload: AnalysisPayload = {
      sourceExperiment: 'faraday', sourceNameAr: t('experiments.expFaraday'),
      hasCalcTab: true,
      readings: trials.trials.value.map(tr => ({ N: tr.N, B: tr.B, A: tr.A, omega: tr.omega, emf: tr.emf })),
      columns: [
        { key: 'N', label: 'N', unit: 'turns' },
        { key: 'B', label: 'B (T)', unit: 'T' },
        { key: 'A', label: 'A (m²)', unit: 'm²' },
        { key: 'omega', label: 'ω (rad/s)', unit: 'rad/s' },
        { key: 'emf', label: 'EMF (V)', unit: 'V' },
      ],
      equations: [
        { name: "Faraday's Law", formula: 'ε = -N · dΦ/dt', variables: [{ symbol: 'ε', label: 'EMF' }, { symbol: 'N', label: 'Turns' }, { symbol: 'Φ', label: 'Flux' }], solveFor: ['emf'] },
      ],
      suggestedPlots: [{ xKey: 'omega', yKey: 'emf', xLabel: 'ω (rad/s)', yLabel: 'EMF (V)', type: 'scatter' }],
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
      const fi = arr.indexOf(fromId), ti = arr.indexOf(toId)
      if (fi >= 0 && ti >= 0) { const tmp = arr[fi]; arr[fi] = arr[ti]; arr[ti] = tmp }
    }
  }
  function onResizeStart(col: string, e: MouseEvent) {
    if (!(col in layout.widths)) return
    const startX = e.clientX, startW = (layout.widths as Record<string, number>)[col] as number
    function move(ev: MouseEvent) { (layout.widths as Record<string, number>)[col] = Math.max(220, startW + (ev.clientX - startX)) }
    function up() { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }

  const lab = { running, paused, simTime, phase, theta, flux, emf, togglePause, updateSim }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
