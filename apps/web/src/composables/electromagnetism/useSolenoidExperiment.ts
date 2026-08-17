import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export interface SolenoidParams {
  I: number
  N: number
  L: number
}

export interface SolenoidTrial {
  id: number
  I: number
  N: number
  L: number
  B: number
}

const MU0 = 4 * Math.PI * 1e-7

const _state = {
  running: ref(false),
  paused: ref(false),
  trials: ref<SolenoidTrial[]>([]),
  nextId: 1,
  params: reactive<SolenoidParams>({ I: 5, N: 100, L: 0.2 }),
  probeData: ref<{ L: number; B: number } | null>(null),
}

export function useSolenoidExperiment() {
  const router = useRouter()
  const { running, paused, trials, params, probeData } = _state

  const B = computed(() => (MU0 * params.N * params.I) / Math.max(params.L, 1e-6))

  function setProbeData(L: number, measuredB: number) {
    probeData.value = { L, B: measuredB }
    params.L = L
  }

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else paused.value = !paused.value
  }

  function resetSim() {
    running.value = false
    paused.value = false
    probeData.value = null
  }

  function recordTrial() {
    const L = probeData.value ? probeData.value.L : params.L
    const measuredB = probeData.value ? probeData.value.B : B.value
    trials.value.push({
      id: _state.nextId++,
      I: params.I,
      N: params.N,
      L,
      B: measuredB,
    })
  }

  function removeTrial(id: number) {
    trials.value = trials.value.filter(t => t.id !== id)
  }

  function clearTrials() {
    trials.value = []
    _state.nextId = 1
  }

  function exportCsv() {
    if (!trials.value.length) return
    const headers = 'I (A),N,L (m),B (T)'
    const rows = trials.value.map(t => `${t.I},${t.N},${t.L.toFixed(4)},${t.B.toExponential(4)}`)
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'solenoid-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportToAnalysis() {
    if (trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const readings = trials.value.map(t => ({
      I: t.I,
      N: t.N,
      L: t.L,
      B: t.B,
      'N/L': t.N / t.L,
      'N*I': t.N * t.I,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'electromagnetism-solenoid',
      sourceNameAr: 'المجال المغناطيسي لملف حلزوني',
      hasCalcTab: true,
      readings,
      columns: [
        { key: 'I', label: 'I', unit: 'A' },
        { key: 'N', label: 'N', unit: '' },
        { key: 'L', label: 'L', unit: 'm' },
        { key: 'B', label: 'B', unit: 'T' },
        { key: 'N/L', label: 'N/L', unit: '1/m' },
        { key: 'N*I', label: 'NI', unit: 'A' },
      ],
      equations: [
        {
          name: 'Solenoid (Ampère\'s Law)',
          formula: 'B = μ₀NI / L',
          variables: [
            { symbol: 'B', label: 'Magnetic Field' },
            { symbol: 'I', label: 'Current' },
            { symbol: 'N', label: 'Turns' },
            { symbol: 'L', label: 'Length' },
            { symbol: 'μ₀', label: 'Permeability' },
          ],
          solveFor: ['B', 'I', 'N', 'L', 'μ₀'],
        },
      ],
      suggestedPlots: [
        { xKey: 'N/L', yKey: 'B', xLabel: 'N/L (1/m)', yLabel: 'B (T)', type: 'scatter' as const },
        { xKey: 'N*I', yKey: 'B', xLabel: 'NI (A)', yLabel: 'B (T)', type: 'scatter' as const },
        { xKey: 'I', yKey: 'B', xLabel: 'I (A)', yLabel: 'B (T)', type: 'scatter' as const },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, running, paused, B, trials, probeData,
    togglePause, resetSim, recordTrial, removeTrial, clearTrials,
    exportCsv, exportToAnalysis, setProbeData,
  }
}
