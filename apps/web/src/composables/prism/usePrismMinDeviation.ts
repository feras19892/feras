/**
 * Compute minimum deviation angle δ_min for a prism by scanning θ_i.
 * Uses: n = sin((A + δ_min)/2) / sin(A/2)
 * @see https://en.wikipedia.org/wiki/Minimum_deviation
 */

import { computed, unref, type MaybeRef } from 'vue'
import { calculatePrismAngles } from './usePrismCalculations'

export interface DeviationPoint {
  theta_i: number
  delta: number
}

export function usePrismMinDeviation(
  prismAngle: MaybeRef<number>,
  wavelength: MaybeRef<number>,
  material: MaybeRef<string>
) {
  const points = computed<DeviationPoint[]>(() => {
    const pa = unref(prismAngle)
    const wl = unref(wavelength)
    const mat = unref(material)
    const pts: DeviationPoint[] = []
    for (let theta = 10; theta <= 80; theta += 1) {
      const r = calculatePrismAngles(pa, theta, wl, mat)
      if (!r.tir && r.deviation !== null) {
        pts.push({ theta_i: theta, delta: r.deviation })
      }
    }
    return pts
  })

  const minDelta = computed(() => {
    if (points.value.length === 0) return null
    return Math.min(...points.value.map(p => p.delta))
  })

  const minTheta = computed(() => {
    if (minDelta.value === null) return null
    const pt = points.value.find(p => p.delta === minDelta.value)
    return pt ? pt.theta_i : null
  })

  /** n inferred from δ_min via prism equation */
  const nFromMinDeviation = computed(() => {
    if (minDelta.value === null) return null
    const A = (unref(prismAngle) * Math.PI) / 180
    const D = (minDelta.value * Math.PI) / 180
    return Math.sin((A + D) / 2) / Math.sin(A / 2)
  })

  return { points, minDelta, minTheta, nFromMinDeviation }
}
