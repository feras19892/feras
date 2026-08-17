import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export interface CircularCoilParams {
  I: number
  N: number
  R: number
}

export interface CircularCoilTrial {
  id: number
  I: number
  N: number
  R: number
  B: number
}

const MU0 = 4 * Math.PI * 1e-7

const _state = {
  running: ref(false),
  paused: ref(false),
  trials: ref<CircularCoilTrial[]>([]),
  nextId: 1,
  params: reactive<CircularCoilParams>({ I: 5, N: 10, R: 0.05 }),
  probeData: ref<{ R: number; B: number } | null>(null),
}

export function useCircularCoilExperiment() {
  const router = useRouter()
  const { running, paused, trials, params, probeData } = _state

  const B = computed(() => (MU0 * params.N * params.I) / (2 * Math.max(params.R, 1e-6)))

  function setProbeData(R: number, measuredB: number) {
    probeData.value = { R, B: measuredB }
    params.R = R
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
    const R = probeData.value ? probeData.value.R : params.R
    const measuredB = probeData.value ? probeData.value.B : B.value
    trials.value.push({
      id: _state.nextId++,
      I: params.I,
      N: params.N,
      R,
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
    const headers = 'I (A),N,R (m),B (T)'
    const rows = trials.value.map(t => `${t.I},${t.N},${t.R.toFixed(4)},${t.B.toExponential(4)}`)
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'circular-coil-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportToAnalysis() {
    if (trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const readings = trials.value.map(t => ({
      I: t.I,
      N: t.N,
      R: t.R,
      B: t.B,
      'N*I': t.N * t.I,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'electromagnetism-circular-coil',
      sourceNameAr: 'المجال المغناطيسي لملف دائري',
      hasCalcTab: true,
      readings,
      columns: [
        { key: 'I', label: 'I', unit: 'A' },
        { key: 'N', label: 'N', unit: '' },
        { key: 'R', label: 'R', unit: 'm' },
        { key: 'B', label: 'B', unit: 'T' },
        { key: 'N*I', label: 'NI', unit: 'A' },
      ],
      equations: [
        {
          name: 'Circular Coil (Biot-Savart)',
          formula: 'B = μ₀NI / (2R)',
          variables: [
            { symbol: 'B', label: 'Magnetic Field' },
            { symbol: 'I', label: 'Current' },
            { symbol: 'N', label: 'Turns' },
            { symbol: 'R', label: 'Radius' },
            { symbol: 'μ₀', label: 'Permeability' },
          ],
          solveFor: ['B', 'I', 'N', 'R', 'μ₀'],
        },
      ],
      suggestedPlots: [
        { xKey: 'N*I', yKey: 'B', xLabel: 'NI (A)', yLabel: 'B (T)', type: 'scatter' as const },
        { xKey: 'R', yKey: 'B', xLabel: 'R (m)', yLabel: 'B (T)', type: 'scatter' as const },
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
