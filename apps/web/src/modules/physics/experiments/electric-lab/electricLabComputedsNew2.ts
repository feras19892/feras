import { computed, type Ref, type Reactive } from 'vue'
import type { CircuitComponent } from './types'

export function createNewComputeds2(
  components: Reactive<CircuitComponent[]>,
  running: Ref<boolean>,
  activePresetId: Ref<string | null>,
) {
  const isCompound = computed(() => activePresetId.value === 'compound-circuit')
  const compoundData = computed(() => {
    if (!isCompound.value) return null
    const batt = components.find(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (!batt || resistors.length < 3) return null
    const V = batt.value
    const R1 = resistors[0].value, R2 = resistors[1].value, R3 = resistors[2].value
    const Rpar = (R2 * R3) / (R2 + R3)
    const Req = R1 + Rpar
    const I = V / Req
    const V1 = I * R1, Vpar = I * Rpar
    const I2 = Vpar / R2, I3 = Vpar / R3
    return { V, R1, R2, R3, Rpar, Req, I, V1, Vpar, I2, I3 }
  })
  const compoundReading = computed(() => {
    if (!compoundData.value || !running.value) return { V: 0, I: 0, Req: 0, V1: 0, Vpar: 0, I2: 0, I3: 0 }
    const d = compoundData.value
    return { V: d.V, I: d.I, Req: d.Req, V1: d.V1, Vpar: d.Vpar, I2: d.I2, I3: d.I3 }
  })

  const isEMF = computed(() => activePresetId.value === 'emf-measurement')
  const emfData = computed(() => {
    if (!isEMF.value) return null
    const batt = components.find(c => c.type === 'battery')
    const sw = components.find(c => c.type === 'switch')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const EMF = batt.value, r = batt._internalR ?? 0, R = res.value
    const closed = sw ? sw.value === 1 : true
    if (closed) {
      const I = EMF / (R + r), Vt = EMF - I * r
      return { EMF, r, R, I, Vt, closed: true }
    }
    return { EMF, r, R, I: 0, Vt: EMF, closed: false }
  })
  const emfReading = computed(() => {
    if (!emfData.value || !running.value) return { EMF: 0, Vt: 0, I: 0, r: 0, closed: false }
    const d = emfData.value
    return { EMF: d.EMF, Vt: d.Vt, I: d.I, r: d.r, closed: d.closed }
  })

  const isTempR = computed(() => activePresetId.value === 'temperature-resistance')
  const tempRData = computed(() => {
    if (!isTempR.value) return null
    const batt = components.find(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (!batt || resistors.length < 2) return null
    const V = batt.value, R0 = resistors[0].value, T = resistors[1].value
    const alpha = 0.004, T0 = 20
    const R = R0 * (1 + alpha * (T - T0))
    const I = V / R, Vm = V
    return { V, R0, T, alpha, R, I, Vm }
  })
  const tempRReading = computed(() => {
    if (!tempRData.value || !running.value) return { V: 0, I: 0, R: 0, R0: 0, T: 0 }
    const d = tempRData.value
    return { V: d.Vm, I: d.I, R: d.R, R0: d.R0, T: d.T }
  })

  const isCellsSeries = computed(() => activePresetId.value === 'cells-series')
  const cellsSeriesData = computed(() => {
    if (!isCellsSeries.value) return null
    const batteries = components.filter(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (batteries.length < 2 || !res) return null
    const EMF = batteries.reduce((s, b) => s + b.value, 0)
    const r = batteries.reduce((s, b) => s + (b._internalR ?? 0), 0)
    const R = res.value
    const I = EMF / (R + r), Vt = I * R
    return { EMF, r, R, I, Vt }
  })
  const cellsSeriesReading = computed(() => {
    if (!cellsSeriesData.value || !running.value) return { EMF: 0, Vt: 0, I: 0, R: 0 }
    const d = cellsSeriesData.value
    return { EMF: d.EMF, Vt: d.Vt, I: d.I, R: d.R }
  })

  const isCellsParallel = computed(() => activePresetId.value === 'cells-parallel')
  const cellsParallelData = computed(() => {
    if (!isCellsParallel.value) return null
    const batteries = components.filter(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (batteries.length < 2 || !res) return null
    const EMF = batteries.reduce((s, b) => s + b.value, 0) / batteries.length
    const rVals = batteries.map(b => b._internalR ?? 0)
    const r = 1 / rVals.reduce((s, r) => s + 1 / r, 0)
    const R = res.value
    const I = EMF / (R + r), Vt = I * R
    return { EMF, r, R, I, Vt }
  })
  const cellsParallelReading = computed(() => {
    if (!cellsParallelData.value || !running.value) return { EMF: 0, Vt: 0, I: 0, R: 0 }
    const d = cellsParallelData.value
    return { EMF: d.EMF, Vt: d.Vt, I: d.I, R: d.R }
  })

  const isRheostat = computed(() => activePresetId.value === 'rheostat')
  const rheostatData = computed(() => {
    if (!isRheostat.value) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const V = batt.value, R = res.value
    if (R === 0) return null
    const I = V / R, Vm = V
    return { V, R, I, Vm }
  })
  const rheostatReading = computed(() => {
    if (!rheostatData.value || !running.value) return { V: 0, I: 0, R: 0 }
    const d = rheostatData.value
    return { V: d.Vm, I: d.I, R: d.R }
  })

  return {
    isCompound, compoundData, compoundReading,
    isEMF, emfData, emfReading,
    isTempR, tempRData, tempRReading,
    isCellsSeries, cellsSeriesData, cellsSeriesReading,
    isCellsParallel, cellsParallelData, cellsParallelReading,
    isRheostat, rheostatData, rheostatReading,
  }
}
