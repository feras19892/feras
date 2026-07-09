import { computed, type Ref, type Reactive } from 'vue'
import type { CircuitComponent } from './types'

export function createNewComputeds3(
  components: Reactive<CircuitComponent[]>,
  running: Ref<boolean>,
  activePresetId: Ref<string | null>,
) {
  const isCurrentDivider = computed(() => activePresetId.value === 'current-divider')
  const currentDividerData = computed(() => {
    if (!isCurrentDivider.value) return null
    const batt = components.find(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (!batt || resistors.length < 2) return null
    const V = batt.value
    const R1 = resistors[0].value, R2 = resistors[1].value
    if (R1 === 0 || R2 === 0) return null
    const Req = (R1 * R2) / (R1 + R2)
    const It = V / Req
    const I1 = It * R2 / (R1 + R2)
    const I2 = It * R1 / (R1 + R2)
    return { V, R1, R2, Req, It, I1, I2 }
  })
  const currentDividerReading = computed(() => {
    if (!currentDividerData.value || !running.value) return { V: 0, It: 0, I1: 0, I2: 0 }
    const d = currentDividerData.value
    return { V: d.V, It: d.It, I1: d.I1, I2: d.I2 }
  })

  const isSourceEff = computed(() => activePresetId.value === 'source-efficiency')
  const sourceEffData = computed(() => {
    if (!isSourceEff.value) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const EMF = batt.value
    const r = (batt as any)._internalR ?? 0
    const R = res.value
    if (R + r === 0) return null
    const I = EMF / (R + r)
    const Vt = I * R
    const Pload = I * I * R
    const Ploss = I * I * r
    const Ptotal = EMF * I
    const eta = R / (R + r)
    return { EMF, r, R, I, Vt, Pload, Ploss, Ptotal, eta }
  })
  const sourceEffReading = computed(() => {
    if (!sourceEffData.value || !running.value) return { Vt: 0, I: 0, Pload: 0, eta: 0 }
    const d = sourceEffData.value
    return { Vt: d.Vt, I: d.I, Pload: d.Pload, eta: d.eta }
  })

  const isTwoSources = computed(() => activePresetId.value === 'two-sources')
  const twoSourcesData = computed(() => {
    if (!isTwoSources.value) return null
    const batteries = components.filter(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (batteries.length < 2 || !res) return null
    const EMF1 = batteries[0].value, EMF2 = batteries[1].value
    const r1 = (batteries[0] as any)._internalR ?? 0, r2 = (batteries[1] as any)._internalR ?? 0
    const R = res.value
    const netEMF = EMF1 - EMF2
    const totalR = R + r1 + r2
    if (totalR === 0) return null
    const I = netEMF / totalR
    const Vt = I * R
    const direction = netEMF >= 0 ? 1 : -1
    return { EMF1, EMF2, r1, r2, R, netEMF, I, Vt, direction }
  })
  const twoSourcesReading = computed(() => {
    if (!twoSourcesData.value || !running.value) return { netEMF: 0, I: 0, Vt: 0, direction: 0 }
    const d = twoSourcesData.value
    return { netEMF: d.netEMF, I: d.I, Vt: d.Vt, direction: d.direction }
  })

  return {
    isCurrentDivider, currentDividerData, currentDividerReading,
    isSourceEff, sourceEffData, sourceEffReading,
    isTwoSources, twoSourcesData, twoSourcesReading,
  }
}
