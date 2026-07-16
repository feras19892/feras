import { computed, type Ref, type Reactive } from 'vue'
import type { CircuitComponent } from './types'

const BETA = 3950
const R0_NTC = 10000
const T0_NTC = 298.15

export function createNewComputeds5(
  components: Reactive<CircuitComponent[]>,
  running: Ref<boolean>,
  activePresetId: Ref<string | null>,
) {
  const isThermistor = computed(() => activePresetId.value === 'thermistor-ntc')
  const thermistorData = computed(() => {
    if (!isThermistor.value) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const V = batt.value
    const Tc = res.value
    const T = Tc + 273.15
    const R = R0_NTC * Math.exp(BETA * (1 / T - 1 / T0_NTC))
    if (R === 0) return null
    const I = V / R
    const Vm = I * R
    return { V, I, R, Tc, T, Vm }
  })
  const thermistorReading = computed(() => {
    if (!thermistorData.value || !running.value) return { V: 0, I: 0, R: 0, T: 0 }
    const d = thermistorData.value
    return { V: d.Vm, I: d.I, R: d.R, T: d.Tc }
  })

  const isMagneticForce = computed(() => activePresetId.value === 'magnetic-force')
  const magneticForceData = computed(() => {
    if (!isMagneticForce.value) return null
    const batt = components.find(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (!batt || resistors.length < 4) return null
    const rRes = resistors.find(r => r.label.includes('R'))
    const bRes = resistors.find(r => r.label.includes('B'))
    const lRes = resistors.find(r => r.label.includes('L'))
    const thetaRes = resistors.find(r => r.label.includes('θ') || r.label.includes('theta'))
    if (!rRes) return null
    const V = batt.value
    const R = rRes.value
    if (R === 0) return null
    const I = V / R
    const B = (bRes?.value ?? 500) * 1e-3
    const L = (lRes?.value ?? 10) * 1e-2
    const theta = thetaRes?.value ?? 90
    const F = B * I * L * Math.sin(theta * Math.PI / 180)
    return { V, I, R, B, L, theta, F }
  })
  const magneticForceReading = computed(() => {
    if (!magneticForceData.value || !running.value) return { I: 0, F: 0, B: 0, L: 0 }
    const d = magneticForceData.value
    return { I: d.I, F: d.F, B: d.B, L: d.L }
  })

  const isLCOsc = computed(() => activePresetId.value === 'lc-oscillation')
  const lcOscData = computed(() => {
    if (!isLCOsc.value) return null
    const batt = components.find(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (!batt || resistors.length < 2) return null
    const rRes = resistors.find(r => r.label === 'R')
    const lRes = resistors.find(r => r.label.includes('L'))
    const cap = components.find(c => c.type === 'capacitor')
    if (!rRes) return null
    const V = batt.value
    const R = rRes.value
    const L = (lRes?.value ?? 100) * 1e-3
    const C = (cap?.value ?? 1) * 1e-6
    const omega = 1 / Math.sqrt(L * C)
    const f = omega / (2 * Math.PI)
    const T_period = 1 / f
    const I = V / R
    const E_C = 0.5 * C * V * V
    const E_L = 0.5 * L * I * I
    const E_total = E_C + E_L
    return { V, I, R, L, C, omega, f, T_period, E_C, E_L, E_total }
  })
  const lcOscReading = computed(() => {
    if (!lcOscData.value || !running.value) return { V: 0, I: 0, f: 0, E: 0 }
    const d = lcOscData.value
    return { V: d.V, I: d.I, f: d.f, E: d.E_total }
  })

  return {
    isThermistor, thermistorData, thermistorReading,
    isMagneticForce, magneticForceData, magneticForceReading,
    isLCOsc, lcOscData, lcOscReading,
  }
}
