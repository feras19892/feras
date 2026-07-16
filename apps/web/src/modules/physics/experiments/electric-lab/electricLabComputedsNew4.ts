import { computed, type Ref, type Reactive } from 'vue'
import type { CircuitComponent } from './types'

const VT = 0.02585
const IS = 1e-12
const ETA = 1.5

export function createNewComputeds4(
  components: Reactive<CircuitComponent[]>,
  running: Ref<boolean>,
  activePresetId: Ref<string | null>,
) {
  const isDiodeIV = computed(() => activePresetId.value === 'diode-iv')
  const diodeData = computed(() => {
    if (!isDiodeIV.value) return null
    const batt = components.find(c => c.type === 'battery')
    const res = components.find(c => c.type === 'resistor')
    if (!batt || !res) return null
    const Vsrc = batt.value
    const R = res.value
    if (R === 0) return null
    const Vd = Vsrc - 0.7
    if (Vd <= 0) return { Vd: Vsrc, I: 0, R, Vsrc, Vbarrier: 0.7 }
    const Iexp = IS * (Math.exp(Vd / (ETA * VT)) - 1)
    const I = Math.min(Iexp, Vsrc / R)
    const Vactual = Vsrc - I * R
    return { Vd: Vactual, I, R, Vsrc, Vbarrier: 0.7 }
  })
  const diodeReading = computed(() => {
    if (!diodeData.value || !running.value) return { Vd: 0, I: 0, Vsrc: 0 }
    const d = diodeData.value
    return { Vd: d.Vd, I: d.I, Vsrc: d.Vsrc }
  })

  const isTransformer = computed(() => activePresetId.value === 'transformer-ratio')
  const transformerData = computed(() => {
    if (!isTransformer.value) return null
    const batt = components.find(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (!batt || resistors.length < 3) return null
    const Vp = batt.value
    const npRes = resistors.find(r => r.label.includes('Np'))
    const nsRes = resistors.find(r => r.label.includes('Ns'))
    const loadRes = resistors.find(r => r.label.includes('R حمل') || r.label === 'R')
    const Np = npRes?.value ?? 200, Ns = nsRes?.value ?? 100
    const Rload = loadRes?.value ?? 50
    const ratio = Ns / Np
    const Vs = Vp * ratio
    if (Rload === 0) return null
    const Is = Vs / Rload
    const Ip = Is * ratio
    const Pp = Vp * Ip
    const Ps = Vs * Is
    const eff = Pp > 0 ? Ps / Pp : 0
    return { Vp, Vs, Np, Ns, ratio, Is, Ip, Pp, Ps, eff, Rload }
  })
  const transformerReading = computed(() => {
    if (!transformerData.value || !running.value) return { Vp: 0, Vs: 0, Ip: 0, Is: 0 }
    const d = transformerData.value
    return { Vp: d.Vp, Vs: d.Vs, Ip: d.Ip, Is: d.Is }
  })

  const isSelfInd = computed(() => activePresetId.value === 'self-inductance')
  const selfIndData = computed(() => {
    if (!isSelfInd.value) return null
    const batt = components.find(c => c.type === 'battery')
    const resistors = components.filter(c => c.type === 'resistor')
    if (!batt || resistors.length < 2) return null
    const rRes = resistors.find(r => r.label === 'R')
    const lRes = resistors.find(r => r.label.includes('L'))
    if (!rRes) return null
    const V = batt.value
    const R = rRes.value
    if (R === 0) return null
    const L = (lRes?.value ?? 500) * 1e-3
    const I = V / R
    const tau = L / R
    const E = 0.5 * L * I * I
    const Vl = V
    return { V, I, R, L, tau, E, Vl }
  })
  const selfIndReading = computed(() => {
    if (!selfIndData.value || !running.value) return { V: 0, I: 0, E: 0, tau: 0 }
    const d = selfIndData.value
    return { V: d.V, I: d.I, E: d.E, tau: d.tau }
  })

  return {
    isDiodeIV, diodeData, diodeReading,
    isTransformer, transformerData, transformerReading,
    isSelfInd, selfIndData, selfIndReading,
  }
}
