import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export interface MagneticFluxParams {
  B: number       // magnetic field strength (T), 0.1–2.0
  A: number       // coil area (m²), 0.001–0.05
  theta: number   // angle between B and normal to coil (rad), 0–π
}

export interface MagneticFluxTrial {
  id: number
  B: number
  A: number
  theta: number
  flux: number       // Φ = B·A·cos(θ) (Wb)
  cosTheta: number   // cos(θ)
  angleDeg: number   // θ in degrees
}

const _state = {
  running: ref(false),
  paused: ref(false),
  trials: ref<MagneticFluxTrial[]>([]),
  nextId: 1,
  params: reactive<MagneticFluxParams>({
    B: 0.5,
    A: 0.01,
    theta: 0,
  }),
  probeData: ref<{ flux: number; angle: number } | null>(null),
}

export function useMagneticFluxExperiment() {
  const router = useRouter()
  const { running, paused, trials, params, probeData } = _state

  // Flux: Φ = B·A·cos(θ)
  function fluxAt(theta: number): number {
    return params.B * params.A * Math.cos(theta)
  }

  // Current flux (live)
  const fluxNow = computed(() => fluxAt(params.theta))
  const cosThetaNow = computed(() => Math.cos(params.theta))
  const angleDegNow = computed(() => params.theta * 180 / Math.PI)

  // Max flux (at θ=0)
  const fluxMax = computed(() => params.B * params.A)

  function setProbeData(flux: number, angle: number) {
    probeData.value = { flux, angle }
  }

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else paused.value = !paused.value
  }

  function resetSim() {
    running.value = false
    paused.value = false
    probeData.value = null
    params.theta = 0
  }

  function recordTrial() {
    const flux = probeData.value ? probeData.value.flux : fluxNow.value
    const theta = probeData.value ? probeData.value.angle : params.theta
    trials.value.push({
      id: _state.nextId++,
      B: params.B,
      A: params.A,
      theta,
      flux,
      cosTheta: Math.cos(theta),
      angleDeg: theta * 180 / Math.PI,
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
    const headers = 'B (T),A (m^2),theta (rad),theta (deg),cos(theta),Flux (Wb)'
    const rows = trials.value.map(t =>
      `${t.B.toFixed(3)},${t.A.toExponential(4)},${t.theta.toFixed(4)},${t.angleDeg.toFixed(2)},${t.cosTheta.toFixed(4)},${t.flux.toExponential(4)}`
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'magnetic-flux-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportToAnalysis() {
    if (trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const readings = trials.value.map(t => ({
      B: t.B,
      A: t.A,
      theta: t.theta,
      angleDeg: t.angleDeg,
      cosTheta: t.cosTheta,
      flux: t.flux,
      'B*A': t.B * t.A,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'electromagnetism-magnetic-flux',
      sourceNameAr: 'الفيض المغناطيسي',
      hasCalcTab: true,
      readings,
      columns: [
        { key: 'B', label: 'B', unit: 'T' },
        { key: 'A', label: 'A', unit: 'm²' },
        { key: 'theta', label: 'θ', unit: 'rad' },
        { key: 'angleDeg', label: 'θ', unit: '°' },
        { key: 'cosTheta', label: 'cos θ', unit: '' },
        { key: 'flux', label: 'Φ', unit: 'Wb' },
        { key: 'B*A', label: 'BA', unit: 'Wb' },
      ],
      equations: [
        {
          name: 'Magnetic Flux',
          formula: 'Φ = B · A · cos(θ)',
          variables: [
            { symbol: 'Φ', label: 'Flux' },
            { symbol: 'B', label: 'Field' },
            { symbol: 'A', label: 'Area' },
            { symbol: 'θ', label: 'Angle' },
          ],
          solveFor: ['Φ', 'B', 'A', 'θ'],
        },
      ],
      suggestedPlots: [
        { xKey: 'theta', yKey: 'flux', xLabel: 'θ (rad)', yLabel: 'Φ (Wb)', type: 'scatter' as const },
        { xKey: 'angleDeg', yKey: 'flux', xLabel: 'θ (°)', yLabel: 'Φ (Wb)', type: 'scatter' as const },
        { xKey: 'cosTheta', yKey: 'flux', xLabel: 'cos θ', yLabel: 'Φ (Wb)', type: 'scatter' as const },
        { xKey: 'B', yKey: 'flux', xLabel: 'B (T)', yLabel: 'Φ (Wb)', type: 'scatter' as const },
        { xKey: 'A', yKey: 'flux', xLabel: 'A (m²)', yLabel: 'Φ (Wb)', type: 'scatter' as const },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, running, paused, fluxNow, cosThetaNow, angleDegNow, fluxMax,
    trials, probeData,
    fluxAt,
    togglePause, resetSim, recordTrial, removeTrial, clearTrials,
    exportCsv, exportToAnalysis, setProbeData,
  }
}
