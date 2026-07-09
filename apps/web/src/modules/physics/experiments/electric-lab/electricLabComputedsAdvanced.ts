import { computed, type Ref, type Reactive } from 'vue'
import type { CircuitComponent } from './types'

export function createAdvancedComputeds(
  components: Reactive<CircuitComponent[]>,
  running: Ref<boolean>,
  activePresetId: Ref<string | null>,
) {
  const isLamp = computed(() => activePresetId.value === 'lamp-circuit')
  const lampData = computed(() => {
    if (!isLamp.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const lamp = components.find(c => c.type === 'lamp')
    const batt = components.find(c => c.type === 'battery')
    if (!lamp || !batt) return null
    const V = batt.value, Rlamp = lamp.value
    if (Rlamp === 0) return null
    const I = V / Rlamp, P = V * I
    const PLight = P * 0.05, PHeat = P * 0.95
    const brightness = Math.min(1, P / 10)
    return { V, I, R: Rlamp, P, PLight, PHeat, brightness }
  })
  const lampReading = computed(() => {
    if (!lampData.value || !running.value) return { V: 0, I: 0, P: 0, PLight: 0, PHeat: 0, brightness: 0 }
    return { V: lampData.value.V, I: lampData.value.I, P: lampData.value.P, PLight: lampData.value.PLight, PHeat: lampData.value.PHeat, brightness: lampData.value.brightness }
  })

  const isGalvanometer = computed(() => activePresetId.value === 'galvanometer')
  const galvanometerData = computed(() => {
    if (!isGalvanometer.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const galv = components.find(c => c.type === 'galvanometer')
    const coil = components.find(c => c.type === 'resistor')
    const batt = components.find(c => c.type === 'battery')
    if (!galv || !coil || !batt) return null
    const turns = coil.value, speed = batt.value
    const emf = turns * speed * 0.001
    const Rgalv = 50
    const I = emf / Rgalv, IuA = I * 1e6
    const sensitivity = Math.min(100, Math.abs(IuA) * 2)
    return { emf, I, IuA, turns, speed, sensitivity, R: Rgalv }
  })
  const galvanometerReading = computed(() => {
    if (!galvanometerData.value || !running.value) return { emf: 0, IuA: 0, sensitivity: 0, turns: 0, speed: 0 }
    return { emf: galvanometerData.value.emf, IuA: galvanometerData.value.IuA, sensitivity: galvanometerData.value.sensitivity, turns: galvanometerData.value.turns, speed: galvanometerData.value.speed }
  })

  const isWheatstone = computed(() => activePresetId.value === 'wheatstone')
  const wheatstoneData = computed(() => {
    if (!isWheatstone.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const resistors = components.filter(c => c.type === 'resistor')
    const batt = components.find(c => c.type === 'battery')
    if (resistors.length < 3 || !batt) return null
    const V = batt.value
    const R1 = resistors[0]?.value ?? 100, R2 = resistors[1]?.value ?? 100, R3 = resistors[2]?.value ?? 100
    const Rx = 150
    const Vg = V * (R3 / (R1 + R3) - Rx / (R2 + Rx))
    const Ig = Vg / 50 * 1000
    const balanced = Math.abs(Vg) < 0.01
    const calculatedRx = balanced ? (R2 * R3 / R1) : 0
    return { V, R1, R2, R3, Rx, Vg, Ig, balanced, calculatedRx }
  })
  const wheatstoneReading = computed(() => {
    if (!wheatstoneData.value || !running.value) return { Vg: 0, Ig: 0, balanced: false, Rx: 0, R1: 0, R2: 0, R3: 0 }
    return { Vg: wheatstoneData.value.Vg, Ig: wheatstoneData.value.Ig, balanced: wheatstoneData.value.balanced, Rx: wheatstoneData.value.Rx, R1: wheatstoneData.value.R1, R2: wheatstoneData.value.R2, R3: wheatstoneData.value.R3 }
  })

  const isVoltageDivider = computed(() => activePresetId.value === 'voltage-divider')
  const voltageDividerData = computed(() => {
    if (!isVoltageDivider.value) return null
    const sw = components.find(c => c.type === 'switch')
    if (sw && !sw._closed) return null
    const resistors = components.filter(c => c.type === 'resistor')
    const batt = components.find(c => c.type === 'battery')
    if (resistors.length < 2 || !batt) return null
    const V = batt.value
    const R1 = resistors[0]?.value ?? 100, R2 = resistors[1]?.value ?? 100
    const Rtotal = R1 + R2
    const I = V / Rtotal, V1 = I * R1, V2 = I * R2
    return { V, R1, R2, Rtotal, I, V1, V2 }
  })
  const voltageDividerReading = computed(() => {
    if (!voltageDividerData.value || !running.value) return { V: 0, V1: 0, V2: 0, R1: 0, R2: 0, I: 0 }
    return { V: voltageDividerData.value.V, V1: voltageDividerData.value.V1, V2: voltageDividerData.value.V2, R1: voltageDividerData.value.R1, R2: voltageDividerData.value.R2, I: voltageDividerData.value.I }
  })

  return {
    isLamp, lampData, lampReading,
    isGalvanometer, galvanometerData, galvanometerReading,
    isWheatstone, wheatstoneData, wheatstoneReading,
    isVoltageDivider, voltageDividerData, voltageDividerReading,
  }
}
