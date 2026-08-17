import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export interface GeneratorParams {
  B: number       // magnetic field strength (T), 0.1–2.0
  N: number       // number of turns, 1–500
  A: number       // coil area (m²), 0.001–0.05
  omega: number   // angular velocity (rad/s), 1–50
  R: number       // load resistance (Ω), 1–100
}

export interface GeneratorTrial {
  id: number
  B: number
  N: number
  A: number
  omega: number
  R: number
  emfPeak: number   // peak EMF (V)
  iPeak: number     // peak current (A)
  frequency: number // Hz = omega / (2π)
  power: number     // peak power (W) = emfPeak² / R
}

const _state = {
  running: ref(false),
  paused: ref(false),
  trials: ref<GeneratorTrial[]>([]),
  nextId: 1,
  params: reactive<GeneratorParams>({
    B: 0.5,
    N: 100,
    A: 0.01,
    omega: 10,
    R: 10,
  }),
  probeData: ref<{ emf: number; i: number; flux: number; angle: number } | null>(null),
}

export function useGeneratorExperiment() {
  const router = useRouter()
  const { running, paused, trials, params, probeData } = _state

  // Flux at angle θ: Φ = N·B·A·cos(θ)
  function fluxAt(theta: number): number {
    return params.N * params.B * params.A * Math.cos(theta)
  }

  // EMF at angle θ: EMF = N·B·A·ω·sin(θ)
  function emfAt(theta: number): number {
    return params.N * params.B * params.A * params.omega * Math.sin(theta)
  }

  // Current at angle θ: I = EMF / R
  function currentAt(theta: number): number {
    return emfAt(theta) / Math.max(params.R, 1e-6)
  }

  // Peak EMF = N·B·A·ω
  const emfPeak = computed(() => params.N * params.B * params.A * params.omega)

  // Peak current
  const iPeak = computed(() => emfPeak.value / Math.max(params.R, 1e-6))

  // Frequency in Hz
  const frequency = computed(() => params.omega / (2 * Math.PI))

  // Peak power = emfPeak² / R
  const powerPeak = computed(() => (emfPeak.value ** 2) / Math.max(params.R, 1e-6))

  function setProbeData(emf: number, i: number, flux: number, angle: number) {
    probeData.value = { emf, i, flux, angle }
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
    const emf = probeData.value ? probeData.value.emf : emfPeak.value
    const i = probeData.value ? probeData.value.i : iPeak.value
    trials.value.push({
      id: _state.nextId++,
      B: params.B,
      N: params.N,
      A: params.A,
      omega: params.omega,
      R: params.R,
      emfPeak: emf,
      iPeak: i,
      frequency: frequency.value,
      power: (emf ** 2) / Math.max(params.R, 1e-6),
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
    const headers = 'B (T),N,A (m^2),omega (rad/s),R (Ohm),EMF_peak (V),I_peak (A),Frequency (Hz),Power (W)'
    const rows = trials.value.map(t =>
      `${t.B.toFixed(3)},${t.N},${t.A.toExponential(4)},${t.omega.toFixed(2)},${t.R.toFixed(1)},${t.emfPeak.toExponential(4)},${t.iPeak.toExponential(4)},${t.frequency.toFixed(4)},${t.power.toExponential(4)}`
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generator-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportToAnalysis() {
    if (trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const readings = trials.value.map(t => ({
      B: t.B,
      N: t.N,
      A: t.A,
      omega: t.omega,
      R: t.R,
      emf: t.emfPeak,
      i: t.iPeak,
      freq: t.frequency,
      power: t.power,
      'N*omega': t.N * t.omega,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'electromagnetism-generator',
      sourceNameAr: 'المولد الكهربائي (مولد التيار المتردد)',
      hasCalcTab: true,
      readings,
      columns: [
        { key: 'B', label: 'B', unit: 'T' },
        { key: 'N', label: 'N', unit: '' },
        { key: 'A', label: 'A', unit: 'm²' },
        { key: 'omega', label: 'ω', unit: 'rad/s' },
        { key: 'R', label: 'R', unit: 'Ω' },
        { key: 'emf', label: 'EMF_peak', unit: 'V' },
        { key: 'i', label: 'I_peak', unit: 'A' },
        { key: 'freq', label: 'f', unit: 'Hz' },
        { key: 'power', label: 'P', unit: 'W' },
        { key: 'N*omega', label: 'Nω', unit: 'rad/s' },
      ],
      equations: [
        {
          name: 'Generator EMF',
          formula: 'EMF = N·B·A·ω·sin(ωt)',
          variables: [
            { symbol: 'EMF', label: 'Induced EMF' },
            { symbol: 'N', label: 'Turns' },
            { symbol: 'B', label: 'Field' },
            { symbol: 'A', label: 'Area' },
            { symbol: 'ω', label: 'Angular velocity' },
          ],
          solveFor: ['EMF', 'N', 'B', 'A', 'ω'],
        },
        {
          name: 'Peak EMF',
          formula: 'EMF_peak = N·B·A·ω',
          variables: [
            { symbol: 'EMF_peak', label: 'Peak EMF' },
            { symbol: 'N', label: 'Turns' },
            { symbol: 'B', label: 'Field' },
            { symbol: 'A', label: 'Area' },
            { symbol: 'ω', label: 'Angular velocity' },
          ],
          solveFor: ['EMF_peak', 'N', 'B', 'A', 'ω'],
        },
        {
          name: 'Ohm Law (generator current)',
          formula: 'I = EMF / R',
          variables: [
            { symbol: 'I', label: 'Current' },
            { symbol: 'EMF', label: 'EMF' },
            { symbol: 'R', label: 'Resistance' },
          ],
          solveFor: ['I', 'EMF', 'R'],
        },
        {
          name: 'Frequency',
          formula: 'f = ω / (2π)',
          variables: [
            { symbol: 'f', label: 'Frequency' },
            { symbol: 'ω', label: 'Angular velocity' },
          ],
          solveFor: ['f', 'ω'],
        },
        {
          name: 'Power',
          formula: 'P = EMF² / R',
          variables: [
            { symbol: 'P', label: 'Power' },
            { symbol: 'EMF', label: 'EMF' },
            { symbol: 'R', label: 'Resistance' },
          ],
          solveFor: ['P', 'EMF', 'R'],
        },
      ],
      suggestedPlots: [
        { xKey: 'omega', yKey: 'emf', xLabel: 'ω (rad/s)', yLabel: 'EMF_peak (V)', type: 'scatter' as const },
        { xKey: 'N', yKey: 'emf', xLabel: 'N', yLabel: 'EMF_peak (V)', type: 'scatter' as const },
        { xKey: 'B', yKey: 'emf', xLabel: 'B (T)', yLabel: 'EMF_peak (V)', type: 'scatter' as const },
        { xKey: 'N*omega', yKey: 'emf', xLabel: 'Nω', yLabel: 'EMF_peak (V)', type: 'scatter' as const },
        { xKey: 'emf', yKey: 'i', xLabel: 'EMF (V)', yLabel: 'I (A)', type: 'scatter' as const },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, running, paused, emfPeak, iPeak, frequency, powerPeak,
    trials, probeData,
    fluxAt, emfAt, currentAt,
    togglePause, resetSim, recordTrial, removeTrial, clearTrials,
    exportCsv, exportToAnalysis, setProbeData,
  }
}
