import { computed, type Ref, type Reactive } from 'vue'
import type { CircuitComponent } from './types'

export function createBasicComputeds(
  components: Reactive<CircuitComponent[]>,
  running: Ref<boolean>,
  activePresetId: Ref<string | null>,
) {
  const battery = computed(() => components.find(c => c.type === 'battery'))
  const resistor = computed(() => components.find(c => c.type === 'resistor'))

  const voltage = computed(() => battery.value?.value ?? 0)
  const resistance = computed(() => resistor.value?.value ?? 0)
  const current = computed(() => {
    if (!running.value || resistance.value === 0) return 0
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return 0
    return voltage.value / resistance.value
  })

  const isKirchhoff = computed(() => activePresetId.value === 'kirchhoff')
  const kirchhoffData = computed(() => {
    if (!isKirchhoff.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const batteries = components.filter(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (batteries.length < 2 || resistors.length < 3) return null
    const V1 = batteries[0]?.value ?? 0, V2 = batteries[1]?.value ?? 0
    const R1 = resistors[0]?.value ?? 1, R2 = resistors[1]?.value ?? 1, R3 = resistors[2]?.value ?? 1
    if (R1 === 0 || R2 === 0 || R3 === 0) return null
    const det = (R1 + R3) * (R2 + R3) - R3 * R3
    if (det === 0) return null
    const I1 = (V1 * (R2 + R3) - V2 * R3) / det
    const I2 = (V2 * (R1 + R3) - V1 * R3) / det
    const I3 = I1 + I2
    return { V1, V2, R1, R2, R3, I1, I2, I3 }
  })
  const kirchhoffCurrents = computed(() => {
    if (!kirchhoffData.value || !running.value) return { I1: 0, I2: 0, I3: 0 }
    return { I1: kirchhoffData.value.I1, I2: kirchhoffData.value.I2, I3: kirchhoffData.value.I3 }
  })

  const isParallel = computed(() => activePresetId.value === 'ohms-law-parallel')
  const parallelData = computed(() => {
    if (!isParallel.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const batteries = components.filter(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (batteries.length < 1 || resistors.length < 2) return null
    const V = batteries[0]?.value ?? 0
    const R1 = resistors[0]?.value ?? 1, R2 = resistors[1]?.value ?? 1
    if (R1 === 0 || R2 === 0) return null
    const I1 = V / R1, I2 = V / R2, Itotal = I1 + I2
    const Req = (R1 * R2) / (R1 + R2)
    return { V, R1, R2, I1, I2, Itotal, Req }
  })
  const parallelCurrents = computed(() => {
    if (!parallelData.value || !running.value) return { I1: 0, I2: 0, Itotal: 0 }
    return { I1: parallelData.value.I1, I2: parallelData.value.I2, Itotal: parallelData.value.Itotal }
  })

  const isPower = computed(() => activePresetId.value === 'power')
  const powerData = computed(() => {
    if (!isPower.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const V = voltage.value, R = resistance.value
    if (R === 0) return null
    const I = V / R, P = V * I
    return { V, I, R, P }
  })
  const powerReading = computed(() => {
    if (!powerData.value || !running.value) return { V: 0, I: 0, P: 0 }
    return { V: powerData.value.V, I: powerData.value.I, P: powerData.value.P }
  })

  const isResistivity = computed(() => activePresetId.value === 'resistivity')
  const resistivityData = computed(() => {
    if (!isResistivity.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const V = voltage.value, R = resistance.value
    if (R === 0) return null
    const I = V / R
    const res = components.find(c => c.type === 'resistor')
    const L = (res as any)?._length ?? 1.0
    const A = (res as any)?._area ?? 1e-6
    const rho = R * A / L
    return { V, I, R, L, A, rho }
  })
  const resistivityReading = computed(() => {
    if (!resistivityData.value || !running.value) return { V: 0, I: 0, R: 0, rho: 0 }
    return { V: resistivityData.value.V, I: resistivityData.value.I, R: resistivityData.value.R, rho: resistivityData.value.rho }
  })

  return {
    voltage, resistance, current,
    isKirchhoff, kirchhoffData, kirchhoffCurrents,
    isParallel, parallelData, parallelCurrents,
    isPower, powerData, powerReading,
    isResistivity, resistivityData, resistivityReading,
  }
}
