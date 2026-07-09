import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export interface TorqueCoilParams {
  I: number       // current through coil (A), 0–10
  N: number       // number of turns, 1–200
  a: number       // coil width (m), 0.02–0.20
  b: number       // coil height (m), 0.02–0.20
  B: number       // external magnetic field (T), 0–0.5
  theta: number   // angle between coil normal and B (degrees), 0–180
}

export interface TorqueCoilTrial {
  id: number
  I: number
  N: number
  a: number
  b: number
  B: number
  theta: number
  A: number       // coil area (m²)
  mu: number      // magnetic moment (A·m²)
  tau: number     // torque (N·m)
}

const _state = {
  running: ref(false),
  paused: ref(false),
  trials: ref<TorqueCoilTrial[]>([]),
  nextId: 1,
  params: reactive<TorqueCoilParams>({
    I: 2.0,
    N: 50,
    a: 0.10,
    b: 0.08,
    B: 0.1,
    theta: 90,
  }),
  probeData: ref<{ theta: number; tau: number } | null>(null),
}

export function useTorqueCoilExperiment() {
  const router = useRouter()
  const { running, paused, trials, params, probeData } = _state

  // Coil area
  const A = computed(() => params.a * params.b)

  // Magnetic moment: μ = NIA
  const mu = computed(() => params.N * params.I * A.value)

  // Torque: τ = μB sin(θ) = NIAB sin(θ)
  const tau = computed(() => {
    const thetaRad = params.theta * Math.PI / 180
    return mu.value * params.B * Math.sin(thetaRad)
  })

  // Equilibrium angle (where τ = 0): θ = 0 or 180
  // For animation: the coil oscillates if running
  const isAtEquilibrium = computed(() => Math.abs(tau.value) < 1e-12)

  function setProbeData(theta: number, measuredTau: number) {
    probeData.value = { theta, tau: measuredTau }
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
    const trialTheta = probeData.value ? probeData.value.theta : params.theta
    const trialTau = probeData.value ? probeData.value.tau : tau.value
    const trialMu = params.N * params.I * params.a * params.b
    const trialA = params.a * params.b
    trials.value.push({
      id: _state.nextId++,
      I: params.I,
      N: params.N,
      a: params.a,
      b: params.b,
      B: params.B,
      theta: trialTheta,
      A: trialA,
      mu: trialMu,
      tau: trialTau,
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
    const headers = 'I (A),N,a (m),b (m),B (T),theta (deg),A (m^2),mu (A.m^2),tau (N.m)'
    const rows = trials.value.map(t =>
      `${t.I},${t.N},${t.a.toFixed(3)},${t.b.toFixed(3)},${t.B.toFixed(4)},${t.theta.toFixed(1)},${t.A.toFixed(5)},${t.mu.toExponential(4)},${t.tau.toExponential(4)}`
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'torque-coil-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportToAnalysis() {
    if (trials.value.length < 2) return
    const readings = trials.value.map(t => ({
      I: t.I,
      N: t.N,
      B: t.B,
      theta: t.theta,
      A: t.A,
      mu: t.mu,
      tau: t.tau,
      'sin(theta)': Math.sin(t.theta * Math.PI / 180),
      'N*I': t.N * t.I,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'electromagnetism-torque-coil',
      sourceNameAr: 'عزم الدوران على ملف',
      hasCalcTab: true,
      readings,
      columns: [
        { key: 'I', label: 'I', unit: 'A' },
        { key: 'N', label: 'N', unit: '' },
        { key: 'B', label: 'B', unit: 'T' },
        { key: 'theta', label: 'θ', unit: '°' },
        { key: 'A', label: 'A', unit: 'm²' },
        { key: 'mu', label: 'μ', unit: 'A·m²' },
        { key: 'tau', label: 'τ', unit: 'N·m' },
        { key: 'sin(theta)', label: 'sin(θ)', unit: '' },
        { key: 'N*I', label: 'NI', unit: 'A' },
      ],
      equations: [
        {
          name: 'Magnetic Moment',
          formula: 'μ = NIA',
          variables: [
            { symbol: 'μ', label: 'Magnetic Moment' },
            { symbol: 'N', label: 'Turns' },
            { symbol: 'I', label: 'Current' },
            { symbol: 'A', label: 'Area' },
          ],
          solveFor: ['μ', 'I', 'N', 'A'],
        },
        {
          name: 'Torque on Coil',
          formula: 'τ = μB sin(θ) = NIAB sin(θ)',
          variables: [
            { symbol: 'τ', label: 'Torque' },
            { symbol: 'μ', label: 'Magnetic Moment' },
            { symbol: 'B', label: 'Magnetic Field' },
            { symbol: 'θ', label: 'Angle' },
          ],
          solveFor: ['τ', 'B', 'μ', 'θ'],
        },
      ],
      suggestedPlots: [
        { xKey: 'theta', yKey: 'tau', xLabel: 'θ (°)', yLabel: 'τ (N·m)', type: 'scatter' as const },
        { xKey: 'sin(theta)', yKey: 'tau', xLabel: 'sin(θ)', yLabel: 'τ (N·m)', type: 'scatter' as const },
        { xKey: 'I', yKey: 'tau', xLabel: 'I (A)', yLabel: 'τ (N·m)', type: 'scatter' as const },
        { xKey: 'B', yKey: 'tau', xLabel: 'B (T)', yLabel: 'τ (N·m)', type: 'scatter' as const },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, running, paused, A, mu, tau, isAtEquilibrium, trials, probeData,
    togglePause, resetSim, recordTrial, removeTrial, clearTrials,
    exportCsv, exportToAnalysis, setProbeData,
  }
}
