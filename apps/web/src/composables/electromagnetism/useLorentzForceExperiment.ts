import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

// Physical constants
const MU0 = 4 * Math.PI * 1e-7   // T·m/A
const E_CHARGE = 1.602e-19       // C
const E_MASS = 9.109e-31         // kg
export interface LorentzForceParams {
  V: number   // accelerating voltage (V), 150–300
  I: number   // Helmholtz coil current (A), 0–3
  N: number   // turns per coil, 1–500
  R: number   // coil radius (m), fixed ~0.15
}

export interface LorentzForceTrial {
  id: number
  V: number       // accelerating voltage
  I: number       // coil current
  B: number       // computed magnetic field
  v: number       // computed electron velocity
  r: number       // measured orbit radius
  em: number      // computed e/m value
}

const _state = {
  running: ref(false),
  paused: ref(false),
  trials: ref<LorentzForceTrial[]>([]),
  nextId: 1,
  params: reactive<LorentzForceParams>({
    V: 200,       // 200 V default
    I: 1.0,       // 1 A default
    N: 130,       // 130 turns (typical Helmholtz)
    R: 0.15,      // 15 cm coil radius
  }),
  probeData: ref<{ r: number } | null>(null),
}

export function useLorentzForceExperiment() {
  const router = useRouter()
  const { running, paused, trials, params, probeData } = _state

  // Helmholtz magnetic field: B = (8 · μ₀ · N · I) / (5√5 · R)
  const B = computed(() => {
    const R_safe = Math.max(params.R, 1e-6)
    return (8 * MU0 * params.N * params.I) / (5 * Math.sqrt(5) * R_safe)
  })

  // Electron velocity from accelerating voltage: v = √(2eV/m)
  const v = computed(() => Math.sqrt((2 * E_CHARGE * params.V) / E_MASS))

  // Lorentz force: F = evB (perpendicular, θ=90°)
  const Fm = computed(() => E_CHARGE * v.value * B.value)

  // Orbit radius: r = mv / (eB) = √(2mV/e) / B
  const r = computed(() => {
    if (B.value < 1e-15) return Infinity
    return (E_MASS * v.value) / (E_CHARGE * B.value)
  })

  // Computed e/m from current params: e/m = 2V / (B²r²)
  const emComputed = computed(() => {
    if (B.value < 1e-15 || r.value === Infinity) return 0
    return (2 * params.V) / (B.value ** 2 * r.value ** 2)
  })

  function setProbeData(measuredR: number) {
    probeData.value = { r: measuredR }
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
    const measuredR = probeData.value ? probeData.value.r : r.value
    // Calculate e/m from measured values: e/m = 2V / (B²·r²)
    const B_val = B.value
    const em = (B_val > 1e-15 && measuredR > 1e-6)
      ? (2 * params.V) / (B_val ** 2 * measuredR ** 2)
      : 0
    trials.value.push({
      id: _state.nextId++,
      V: params.V,
      I: params.I,
      B: B_val,
      v: v.value,
      r: measuredR,
      em,
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
    const headers = 'V (V),I (A),B (T),v (m/s),r (m),e/m (C/kg)'
    const rows = trials.value.map(t =>
      `${t.V},${t.I.toFixed(3)},${t.B.toExponential(4)},${t.v.toExponential(4)},${t.r.toExponential(4)},${t.em.toExponential(4)}`
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = 'lorentz-force-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportToAnalysis() {
    if (trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const readings = trials.value.map(t => ({
      V: t.V,
      I: t.I,
      B: t.B,
      v: t.v,
      r: t.r,
      em: t.em,
      '1/B': 1 / t.B,
      'r²': t.r ** 2,
      '1/I': 1 / t.I,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'electromagnetism-lorentz-force',
      sourceNameAr: 'قوة لورنتز — أنبوب الشعاع الإلكتروني',
      hasCalcTab: true,
      readings,
      columns: [
        { key: 'V', label: 'V', unit: 'V' },
        { key: 'I', label: 'I', unit: 'A' },
        { key: 'B', label: 'B', unit: 'T' },
        { key: 'v', label: 'v', unit: 'm/s' },
        { key: 'r', label: 'r', unit: 'm' },
        { key: 'em', label: 'e/m', unit: 'C/kg' },
        { key: '1/B', label: '1/B', unit: '1/T' },
        { key: 'r²', label: 'r²', unit: 'm²' },
      ],
      equations: [
        {
          name: 'Helmholtz Field',
          formula: 'B = 8μ₀NI / (5√5 · R)',
          variables: [
            { symbol: 'B', label: 'Magnetic Field' },
            { symbol: 'N', label: 'Turns per Coil' },
            { symbol: 'I', label: 'Current' },
            { symbol: 'R', label: 'Coil Radius' },
            { symbol: 'μ₀', label: 'Permeability' },
          ],
          solveFor: ['B', 'I', 'N', 'R'],
        },
        {
          name: 'Electron Velocity',
          formula: 'v = √(2eV/m)',
          variables: [
            { symbol: 'v', label: 'Velocity' },
            { symbol: 'V', label: 'Voltage' },
            { symbol: 'e', label: 'Electron Charge' },
            { symbol: 'm', label: 'Electron Mass' },
          ],
          solveFor: ['v', 'V'],
        },
        {
          name: 'Orbit Radius',
          formula: 'r = mv / (eB)',
          variables: [
            { symbol: 'r', label: 'Radius' },
            { symbol: 'm', label: 'Mass' },
            { symbol: 'v', label: 'Velocity' },
            { symbol: 'e', label: 'Charge' },
            { symbol: 'B', label: 'Magnetic Field' },
          ],
          solveFor: ['r', 'B', 'v'],
        },
        {
          name: 'Charge-to-Mass Ratio',
          formula: 'e/m = 2V / (B²r²)',
          variables: [
            { symbol: 'e/m', label: 'Charge-to-Mass' },
            { symbol: 'V', label: 'Voltage' },
            { symbol: 'B', label: 'Magnetic Field' },
            { symbol: 'r', label: 'Radius' },
          ],
          solveFor: ['e/m', 'V', 'B', 'r'],
        },
      ],
      suggestedPlots: [
        { xKey: 'I', yKey: 'r', xLabel: 'I (A)', yLabel: 'r (m)', type: 'scatter' as const },
        { xKey: '1/B', yKey: 'r', xLabel: '1/B (1/T)', yLabel: 'r (m)', type: 'scatter' as const },
        { xKey: 'V', yKey: 'r²', xLabel: 'V (V)', yLabel: 'r² (m²)', type: 'scatter' as const },
        { xKey: '1/I', yKey: 'r', xLabel: '1/I (1/A)', yLabel: 'r (m)', type: 'scatter' as const },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, running, paused, B, v, Fm, r, emComputed, trials, probeData,
    togglePause, resetSim, recordTrial, removeTrial, clearTrials,
    exportCsv, exportToAnalysis, setProbeData,
  }
}
