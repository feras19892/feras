import { computed, type Ref, type Reactive } from 'vue'
import type { CircuitComponent } from './types'

export function createNewComputeds(
  components: Reactive<CircuitComponent[]>,
  running: Ref<boolean>,
  activePresetId: Ref<string | null>,
) {
  const isInternalResistance = computed(() => activePresetId.value === 'internal-resistance')
  const internalResistanceData = computed(() => {
    if (!isInternalResistance.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const emf = batt.value
    const r = batt._internalR ?? 0
    const R = res.value
    if (R + r === 0) return null
    const I = emf / (R + r)
    const Vt = emf - I * r
    const Vdrop = I * r
    return { emf, r, R, I, Vt, Vdrop }
  })
  const internalResistanceReading = computed(() => {
    if (!internalResistanceData.value || !running.value) return { emf: 0, Vt: 0, I: 0, r: 0, Vdrop: 0 }
    const d = internalResistanceData.value
    return { emf: d.emf, Vt: d.Vt, I: d.I, r: d.r, Vdrop: d.Vdrop }
  })

  const isSeries = computed(() => activePresetId.value === 'series-circuit')
  const seriesData = computed(() => {
    if (!isSeries.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const batt = components.find(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (!batt || resistors.length < 2) return null
    const V = batt.value
    const Rs = resistors.map(r => r.value)
    const Req = Rs.reduce((a, b) => a + b, 0)
    if (Req === 0) return null
    const I = V / Req
    const Vs = Rs.map(R => I * R)
    return { V, Rs, Req, I, Vs }
  })
  const seriesReading = computed(() => {
    if (!seriesData.value || !running.value) return { V: 0, I: 0, Req: 0, V1: 0, V2: 0, V3: 0 }
    const d = seriesData.value
    return { V: d.V, I: d.I, Req: d.Req, V1: d.Vs[0] ?? 0, V2: d.Vs[1] ?? 0, V3: d.Vs[2] ?? 0 }
  })

  const isCapacitorsSeries = computed(() => activePresetId.value === 'capacitors-series')
  const isCapacitorsParallel = computed(() => activePresetId.value === 'capacitors-parallel')
  const isCapacitorsCombo = computed(() => isCapacitorsSeries.value || isCapacitorsParallel.value)
  const capacitorsComboData = computed(() => {
    if (!isCapacitorsCombo.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    const caps = components.filter(c => c.type === 'capacitor')
    if (!batt || !res || caps.length < 2) return null
    const V0 = batt.value, R = res.value
    const C1 = caps[0].value * 1e-6, C2 = caps[1].value * 1e-6
    const Ceq = isCapacitorsSeries.value ? (C1 * C2) / (C1 + C2) : C1 + C2
    const tau = R * Ceq
    return { V0, R, C1, C2, Ceq, tau, mode: isCapacitorsSeries.value ? 'series' : 'parallel' }
  })
  const capacitorsComboReading = computed(() => {
    if (!capacitorsComboData.value || !running.value) return { Ceq: 0, tau: 0, C1: 0, C2: 0 }
    const d = capacitorsComboData.value
    return { Ceq: d.Ceq * 1e6, tau: d.tau, C1: d.C1 * 1e6, C2: d.C2 * 1e6 }
  })

  const isPotentiometer = computed(() => activePresetId.value === 'potentiometer')
  const potentiometerData = computed(() => {
    if (!isPotentiometer.value) return null
    const refBatt = components.find(c => c.type === 'battery' && c.label === 'بطارية مرجعية')
    const unknownBatt = components.find(c => c.type === 'battery' && c.label === 'بطارية مجهولة')
    const r1 = components.find(c => c.type === 'resistor' && c.label === 'سلك (R1)')
    const r2 = components.find(c => c.type === 'resistor' && c.label === 'R2')
    if (!refBatt || !unknownBatt || !r1 || !r2) return null
    const Vref = refBatt.value
    const Vx = unknownBatt.value
    const R1 = r1.value, R2 = r2.value
    const Rtotal = R1 + R2
    if (Rtotal === 0) return null
    const Vslide = Vref * R1 / Rtotal
    const Ig = (Vslide - Vx) / 1000 * 1e6
    const balanced = Math.abs(Vslide - Vx) < 0.01
    const measuredVx = balanced ? Vslide : 0
    return { Vref, Vx, R1, R2, Vslide, Ig, balanced, measuredVx }
  })
  const potentiometerReading = computed(() => {
    if (!potentiometerData.value || !running.value) return { Vref: 0, Vx: 0, Vslide: 0, Ig: 0, balanced: false }
    const d = potentiometerData.value
    return { Vref: d.Vref, Vx: d.Vx, Vslide: d.Vslide, Ig: d.Ig, balanced: d.balanced }
  })

  const isNonOhmic = computed(() => activePresetId.value === 'non-ohmic')
  const nonOhmicData = computed(() => {
    if (!isNonOhmic.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const V = batt.value, R = res.value
    if (R === 0) return null
    const I_ohmic = V / R
    const I_lamp = V / (R * (1 + V * 0.05))
    const R_dyn = R * (1 + V * 0.05)
    return { V, R, I_ohmic, I_lamp, R_dyn }
  })
  const nonOhmicReading = computed(() => {
    if (!nonOhmicData.value || !running.value) return { V: 0, I_ohmic: 0, I_lamp: 0, R_dyn: 0 }
    const d = nonOhmicData.value
    return { V: d.V, I_ohmic: d.I_ohmic, I_lamp: d.I_lamp, R_dyn: d.R_dyn }
  })

  const isMaxPower = computed(() => activePresetId.value === 'max-power-transfer')
  const maxPowerData = computed(() => {
    if (!isMaxPower.value) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const V = batt.value, r = batt._internalR ?? 0, R = res.value
    if (R + r === 0) return null
    const I = V / (R + r)
    const Vload = I * R
    const P = I * I * R
    const Pmax = V * V / (4 * r)
    const isMax = Math.abs(R - r) < 0.01
    return { V, r, R, I, Vload, P, Pmax, isMax }
  })
  const maxPowerReading = computed(() => {
    if (!maxPowerData.value || !running.value) return { V: 0, I: 0, P: 0, R: 0, r: 0, Pmax: 0, isMax: false }
    const d = maxPowerData.value
    return { V: d.V, I: d.I, P: d.P, R: d.R, r: d.r, Pmax: d.Pmax, isMax: d.isMax }
  })

  const isJoulesLaw = computed(() => activePresetId.value === 'joules-law')
  const joulesData = computed(() => {
    if (!isJoulesLaw.value) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const V = batt.value, R = res.value
    if (R === 0) return null
    const I = V / R
    const P = I * I * R
    const H = P * 60
    return { V, R, I, P, H }
  })
  const joulesReading = computed(() => {
    if (!joulesData.value || !running.value) return { V: 0, I: 0, P: 0, R: 0, H: 0 }
    const d = joulesData.value
    return { V: d.V, I: d.I, P: d.P, R: d.R, H: d.H }
  })

  const isAmmeterVoltmeter = computed(() => activePresetId.value === 'ammeter-voltmeter')
  const ammeterVoltmeterData = computed(() => {
    if (!isAmmeterVoltmeter.value) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const V = batt.value, Rx = res.value
    const Rv = 10000
    const R_total = (Rx * Rv) / (Rx + Rv)
    const I = V / (R_total)
    const Vm = I * R_total
    const R_measured = Vm / I
    const I_voltmeter = Vm / Rv
    const I_Rx = I - I_voltmeter
    const R_true = Vm / I_Rx
    const error_pct = Math.abs((R_measured - Rx) / Rx) * 100
    return { V, Rx, Rv, I, Vm, R_measured, R_true, error_pct }
  })
  const ammeterVoltmeterReading = computed(() => {
    if (!ammeterVoltmeterData.value || !running.value) return { V: 0, I: 0, R_measured: 0, R_true: 0, error_pct: 0 }
    const d = ammeterVoltmeterData.value
    return { V: d.Vm, I: d.I, R_measured: d.R_measured, R_true: d.R_true, error_pct: d.error_pct }
  })

  return {
    isInternalResistance, internalResistanceData, internalResistanceReading,
    isSeries, seriesData, seriesReading,
    isCapacitorsSeries, isCapacitorsParallel, isCapacitorsCombo, capacitorsComboData, capacitorsComboReading,
    isPotentiometer, potentiometerData, potentiometerReading,
    isNonOhmic, nonOhmicData, nonOhmicReading,
    isMaxPower, maxPowerData, maxPowerReading,
    isJoulesLaw, joulesData, joulesReading,
    isAmmeterVoltmeter, ammeterVoltmeterData, ammeterVoltmeterReading,
  }
}
