import { ref, computed, type Reactive, type Ref } from 'vue'
import type { CircuitComponent } from './types'

export function useElectricLabRC(
  components: Reactive<CircuitComponent[]>,
  running: Ref<boolean>,
  activePresetId: Ref<string | null>,
) {
  const isRC = computed(() => activePresetId.value === 'rc-circuit')
  const rcTime = ref(0)
  const rcVoltage = ref(0)
  const rcCurrent = ref(0)
  const rcCharging = ref(true)
  const rcHistory = ref<{ t: number; V: number; I: number }[]>([])
  let rcInterval: ReturnType<typeof setInterval> | null = null

  const rcData = computed(() => {
    if (!isRC.value) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    const cap = components.find(c => c.type === 'capacitor')
    const sw = components.find(c => c.type === 'switch')
    if (!batt || !res || !cap) return null
    const V0 = batt.value, R = res.value, Cval = cap.value * 1e-6
    if (R === 0 || Cval === 0) return null
    const tau = R * Cval
    const closed = sw?._closed ?? true
    return { V0, R, C: Cval, tau, closed, sw }
  })

  const rcReading = computed(() => {
    if (!isRC.value || !running.value) return { V: 0, I: 0, t: 0, tau: 0, charging: true }
    const d = rcData.value
    if (!d) return { V: 0, I: 0, t: 0, tau: 0, charging: true }
    return { V: rcVoltage.value, I: rcCurrent.value, t: rcTime.value, tau: d.tau, charging: rcCharging.value }
  })

  function startRC() {
    stopRC()
    rcTime.value = 0; rcVoltage.value = 0; rcCurrent.value = 0; rcCharging.value = true; rcHistory.value = []
    const d = rcData.value
    if (!d) return
    const dt = d.tau / 50
    rcInterval = setInterval(() => {
      const data = rcData.value
      if (!data) return
      if (data.closed) {
        rcCharging.value = true
        rcVoltage.value = data.V0 * (1 - Math.exp(-rcTime.value / data.tau))
        rcCurrent.value = (data.V0 / data.R) * Math.exp(-rcTime.value / data.tau)
      } else {
        rcCharging.value = false
        rcVoltage.value = rcVoltage.value * Math.exp(-dt / data.tau)
        rcCurrent.value = rcCurrent.value * Math.exp(-dt / data.tau)
      }
      rcHistory.value.push({ t: rcTime.value, V: rcVoltage.value, I: rcCurrent.value })
      if (rcHistory.value.length > 300) rcHistory.value.shift()
      rcTime.value += dt
    }, 50)
  }

  function stopRC() {
    if (rcInterval) { clearInterval(rcInterval); rcInterval = null }
  }

  function toggleSwitch() {
    const sw = components.find(c => c.type === 'switch')
    if (sw) { sw._closed = !sw._closed; rcTime.value = 0 }
  }

  return { isRC, rcTime, rcVoltage, rcCurrent, rcCharging, rcHistory, rcData, rcReading, startRC, stopRC, toggleSwitch }
}
