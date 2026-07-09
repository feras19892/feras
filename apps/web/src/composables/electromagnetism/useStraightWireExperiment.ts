import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export interface StraightWireParams {
  I: number
  r: number
}

export interface StraightWireTrial {
  id: number
  I: number
  r: number
  B: number
}

const MU0 = 4 * Math.PI * 1e-7

const _state = {
  running: ref(false),
  paused: ref(false),
  trials: ref<StraightWireTrial[]>([]),
  nextId: 1,
  params: reactive<StraightWireParams>({ I: 10, r: 0.05 }),
  probeData: ref<{ r: number; B: number } | null>(null),
}

export function useStraightWireExperiment() {
  const router = useRouter()
  const { running, paused, trials, params, probeData } = _state

  const B = computed(() => (MU0 * params.I) / (2 * Math.PI * Math.max(params.r, 1e-6)))

  function setProbeData(r: number, measuredB: number) {
    probeData.value = { r, B: measuredB }
    params.r = r
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
    const r = probeData.value ? probeData.value.r : params.r
    const measuredB = probeData.value ? probeData.value.B : B.value
    trials.value.push({
      id: _state.nextId++,
      I: params.I,
      r,
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
    const headers = 'I (A),r (m),B (T)'
    const rows = trials.value.map(t => `${t.I},${t.r.toFixed(4)},${t.B.toExponential(4)}`)
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'straight-wire-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportToAnalysis() {
    if (trials.value.length < 2) return
    const readings = trials.value.map(t => ({
      I: t.I,
      r: t.r,
      B: t.B,
      '1/r': 1 / t.r,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'electromagnetism-straight-wire',
      sourceNameAr: 'المجال المغناطيسي لسلك مستقيم',
      hasCalcTab: true,
      readings,
      columns: [
        { key: 'I', label: 'I', unit: 'A' },
        { key: 'r', label: 'r', unit: 'm' },
        { key: 'B', label: 'B', unit: 'T' },
        { key: '1/r', label: '1/r', unit: '1/m' },
      ],
      equations: [
        {
          name: 'Biot-Savart (Straight Wire)',
          formula: 'B = μ₀I / (2πr)',
          variables: [
            { symbol: 'B', label: 'Magnetic Field' },
            { symbol: 'I', label: 'Current' },
            { symbol: 'r', label: 'Distance' },
            { symbol: 'μ₀', label: 'Permeability' },
          ],
          solveFor: ['B', 'I', 'r'],
        },
      ],
      suggestedPlots: [
        { xKey: 'r', yKey: 'B', xLabel: 'r (m)', yLabel: 'B (T)', type: 'scatter' as const },
        { xKey: '1/r', yKey: 'B', xLabel: '1/r (1/m)', yLabel: 'B (T)', type: 'scatter' as const },
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
