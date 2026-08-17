import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export interface FaradayLawParams {
  B: number       // magnet field strength (T), 0.1–2.0
  N: number       // number of turns in coil, 1–500
  A: number       // coil area (m²), 0.001–0.05
  v: number       // magnet velocity (m/s), 0.1–5.0
  R: number       // circuit resistance (Ω), 1–100
  d: number       // magnet characteristic length (m), 0.02–0.15
}

export interface FaradayLawTrial {
  id: number
  B: number
  N: number
  A: number
  v: number
  R: number
  d: number
  emfMax: number   // peak EMF (V)
  iMax: number     // peak current (A)
  fluxMax: number  // max flux (Wb)
  direction: string // 'opposing' or 'assisting' (Lenz)
}

const _state = {
  running: ref(false),
  paused: ref(false),
  trials: ref<FaradayLawTrial[]>([]),
  nextId: 1,
  params: reactive<FaradayLawParams>({
    B: 0.5,
    N: 100,
    A: 0.01,
    v: 1.0,
    R: 10,
    d: 0.05,
  }),
  probeData: ref<{ emf: number; i: number; flux: number; direction: string } | null>(null),
}

export function useFaradayLawExperiment() {
  const router = useRouter()
  const { running, paused, trials, params, probeData } = _state

  // Magnetic flux as function of magnet position x relative to coil center
  // Φ(x) = B * A / (1 + (x/d)²)
  function fluxAt(x: number): number {
    return params.B * params.A / (1 + (x / params.d) ** 2)
  }

  // dΦ/dx at position x
  function dFluxDx(x: number): number {
    const d = Math.max(params.d, 1e-6)
    return -2 * params.B * params.A * x / (d * d * (1 + (x / d) ** 2) ** 2)
  }

  // EMF at position x: EMF = -N * dΦ/dt = -N * dΦ/dx * v
  function emfAt(x: number): number {
    return -params.N * dFluxDx(x) * params.v
  }

  // Current: I = EMF / R
  function currentAt(x: number): number {
    const r = Math.max(params.R, 1e-6)
    return emfAt(x) / r
  }

  // Peak EMF (occurs at x = d/√3 for this model)
  const emfMax = computed(() => {
    const xPeak = params.d / Math.sqrt(3)
    return Math.abs(emfAt(xPeak))
  })

  // Peak current
  const iMax = computed(() => emfMax.value / Math.max(params.R, 1e-6))

  // Max flux (at x=0, magnet at coil center)
  const fluxMax = computed(() => params.B * params.A)

  // Lenz direction: 'opposing' when flux increasing (magnet approaching), 'assisting' when decreasing
  function lenzDirection(x: number, velocity: number): string {
    const dPhiDt = dFluxDx(x) * velocity
    return dPhiDt > 0 ? 'opposing' : 'assisting'
  }

  // Current values at magnet position (for live readings — uses x=0 as default)
  const fluxNow = computed(() => fluxAt(0))
  const emfNow = computed(() => emfAt(0))  // 0 at center (dΦ/dx = 0)
  const iNow = computed(() => currentAt(0))
  const directionNow = computed(() => lenzDirection(0, params.v))

  function setProbeData(emf: number, i: number, flux: number, direction: string) {
    probeData.value = { emf, i, flux, direction }
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
    const emf = probeData.value ? probeData.value.emf : emfMax.value
    const i = probeData.value ? probeData.value.i : iMax.value
    const flux = probeData.value ? probeData.value.flux : fluxMax.value
    const direction = probeData.value ? probeData.value.direction : directionNow.value
    trials.value.push({
      id: _state.nextId++,
      B: params.B,
      N: params.N,
      A: params.A,
      v: params.v,
      R: params.R,
      d: params.d,
      emfMax: emf,
      iMax: i,
      fluxMax: flux,
      direction,
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
    const headers = 'B (T),N,A (m^2),v (m/s),R (Ohm),d (m),EMF_max (V),I_max (A),Flux_max (Wb),Direction'
    const rows = trials.value.map(t =>
      `${t.B.toFixed(3)},${t.N},${t.A.toExponential(4)},${t.v.toFixed(2)},${t.R.toFixed(1)},${t.d.toFixed(3)},${t.emfMax.toExponential(4)},${t.iMax.toExponential(4)},${t.fluxMax.toExponential(4)},${t.direction}`
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'faraday-lenz-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportToAnalysis() {
    if (trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const readings = trials.value.map(t => ({
      B: t.B,
      N: t.N,
      A: t.A,
      v: t.v,
      R: t.R,
      d: t.d,
      emf: t.emfMax,
      i: t.iMax,
      flux: t.fluxMax,
      'N*v': t.N * t.v,
      'B*A': t.B * t.A,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'electromagnetism-faraday-lenz',
      sourceNameAr: 'قانون فاراداي ولنز للحث الكهرومغناطيسي',
      hasCalcTab: true,
      readings,
      columns: [
        { key: 'B', label: 'B', unit: 'T' },
        { key: 'N', label: 'N', unit: '' },
        { key: 'A', label: 'A', unit: 'm²' },
        { key: 'v', label: 'v', unit: 'm/s' },
        { key: 'R', label: 'R', unit: 'Ω' },
        { key: 'emf', label: 'EMF', unit: 'V' },
        { key: 'i', label: 'I', unit: 'A' },
        { key: 'flux', label: 'Φ', unit: 'Wb' },
        { key: 'N*v', label: 'Nv', unit: 'm/s' },
        { key: 'B*A', label: 'BA', unit: 'Wb' },
      ],
      equations: [
        {
          name: 'Magnetic Flux',
          formula: 'Φ = B·A',
          variables: [
            { symbol: 'Φ', label: 'Flux' },
            { symbol: 'B', label: 'Field' },
            { symbol: 'A', label: 'Area' },
          ],
          solveFor: ['Φ', 'B', 'A'],
        },
        {
          name: "Faraday's Law + Lenz's Law",
          formula: 'EMF = -N · dΦ/dt  (الإشارة السالبة = لنز)',
          variables: [
            { symbol: 'EMF', label: 'Induced EMF (signed)' },
            { symbol: 'N', label: 'Turns' },
            { symbol: 'Φ', label: 'Flux' },
          ],
          solveFor: ['EMF', 'N'],
        },
        {
          name: 'Ohm Law (induced current)',
          formula: 'I = EMF / R',
          variables: [
            { symbol: 'I', label: 'Current' },
            { symbol: 'EMF', label: 'EMF' },
            { symbol: 'R', label: 'Resistance' },
          ],
          solveFor: ['I', 'EMF', 'R'],
        },
      ],
      suggestedPlots: [
        { xKey: 'v', yKey: 'emf', xLabel: 'v (m/s)', yLabel: 'EMF (V)', type: 'scatter' as const },
        { xKey: 'N', yKey: 'emf', xLabel: 'N', yLabel: 'EMF (V)', type: 'scatter' as const },
        { xKey: 'B', yKey: 'emf', xLabel: 'B (T)', yLabel: 'EMF (V)', type: 'scatter' as const },
        { xKey: 'N*v', yKey: 'emf', xLabel: 'Nv', yLabel: 'EMF (V)', type: 'scatter' as const },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, running, paused, emfMax, iMax, fluxMax,
    fluxNow, emfNow, iNow, directionNow, trials, probeData,
    togglePause, resetSim, recordTrial, removeTrial, clearTrials,
    exportCsv, exportToAnalysis, setProbeData,
  }
}
