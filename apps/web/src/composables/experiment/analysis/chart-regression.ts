import { computed, type Ref, type ComputedRef } from 'vue'

export function useChartRegression(
  points: ComputedRef<{ x: number; y: number }[]>,
  xKey: Ref<string>,
  yKey: Ref<string>,
  t: (key: string) => string,
) {
  const sumX = computed(() => points.value.reduce((s, p) => s + p.x, 0))
  const sumY = computed(() => points.value.reduce((s, p) => s + p.y, 0))
  const sumXY = computed(() => points.value.reduce((s, p) => s + p.x * p.y, 0))
  const sumX2 = computed(() => points.value.reduce((s, p) => s + p.x * p.x, 0))

  const regression = computed(() => {
    const n = points.value.length
    if (n < 2) return null
    const sx = sumX.value, sy = sumY.value, sxy = sumXY.value, sx2 = sumX2.value
    const sumY2 = points.value.reduce((s, p) => s + p.y * p.y, 0)
    const xDenominator = n * sx2 - sx * sx
    if (Math.abs(xDenominator) < 1e-12) return null
    const slope = (n * sxy - sx * sy) / xDenominator
    const intercept = (sy - slope * sx) / n
    if (!Number.isFinite(slope) || !Number.isFinite(intercept)) return null
    const rNumerator = n * sxy - sx * sy
    const rDenominator = Math.sqrt(xDenominator * (n * sumY2 - sy * sy))
    if (rDenominator === 0) return null
    const r = rNumerator / rDenominator
    return { slope, intercept, r2: r * r }
  })

  const slopeWarning = computed(() => {
    if (!regression.value || points.value.length < 2) return null
    const slope = regression.value.slope
    if (xKey.value === 'inv_do' && yKey.value === 'inv_di') {
      if (Math.abs(slope + 1) > 0.2) return t('analysis.slopeLensWarning')
      return null
    }
    if (slope < -0.001) return t('analysis.slopeNegativeWarning')
    if (Math.abs(slope) < 0.0001 && regression.value.r2 > 0.5) return t('analysis.slopeZeroWarning')
    return null
  })

  const slopeCalc = computed(() => {
    if (!regression.value || points.value.length < 2) return null
    const s = regression.value.slope
    const x = xKey.value; const y = yKey.value
    if ((x === 'mass' || x === 'm') && (y === 'T2' || y === 'T²')) {
      const k = (4 * Math.PI * Math.PI) / s
      return { label: t('analysis.regressionK'), formula: `k = 4π² / ${t('analysis.slope')}(T² vs m)`, value: k, unit: 'N/m', expr: `4π² / ${s.toFixed(4)}` }
    }
    if ((x === 'length' || x === 'L') && (y === 'T2' || y === 'T²')) {
      const g = (4 * Math.PI * Math.PI) / s
      return { label: t('analysis.regressionG'), formula: `g = 4π² / ${t('analysis.slope')}(T² vs L)`, value: g, unit: 'm/s²', expr: `4π² / ${s.toFixed(4)}` }
    }
    if ((x === 't2' || x === 't²') && y === 'h') {
      const g = 2 * s
      return { label: t('analysis.regressionG'), formula: `g = 2 · ${t('analysis.slope')}(h vs t²)`, value: g, unit: 'm/s²', expr: `2 × ${s.toFixed(4)}` }
    }
    if (x === 'sinTheta' && y === 'acceleration') {
      return { label: t('analysis.regressionGIncline'), formula: `g = ${t('analysis.slope')}(a vs sinθ)`, value: s, unit: 'm/s²', expr: `${s.toFixed(4)}` }
    }
    if (x === 'KEi' && y === 'KEf') {
      return { label: t('analysis.regressionEnergyRatio'), formula: `KEf/KEi = ${t('analysis.slope')}`, value: s, unit: '', expr: `${s.toFixed(4)}` }
    }
    if (x === 'Pi' && y === 'Pf') {
      return { label: t('analysis.regressionMomentumRatio'), formula: `Pf/Pi = ${t('analysis.slope')}`, value: s, unit: '', expr: `${s.toFixed(4)}` }
    }
    if (x === 'Pi' && (y === 'v1f' || y === 'v_f')) {
      return { label: t('analysis.regressionTotalMass'), formula: `slope = m₁ + m₂`, value: s, unit: 'kg', expr: `${s.toFixed(4)}` }
    }
    if ((x === 'rangeMeters' || x === 'R') && (y === 'maxHeightMeters' || y === 'H')) {
      const tanTheta = 4 * s
      const thetaDeg = Math.atan(tanTheta) * 180 / Math.PI
      return { label: t('analysis.regressionTheta'), formula: `tanθ = 4·${t('analysis.slope')}(H vs R) → θ = arctan(4s)`, value: thetaDeg, unit: '°', expr: `arctan(4×${s.toFixed(4)}) = ${thetaDeg.toFixed(2)}°` }
    }
    if (x === 'v0Squared' && (y === 'rangeMeters' || y === 'R')) {
      return { label: t('analysis.regressionSin2ThetaOverG'), formula: `${t('analysis.slope')} = sin(2θ)/g`, value: s, unit: 's²/m', expr: `${s.toFixed(4)}` }
    }
    if (x === 'sin2Theta' && (y === 'rangeMeters' || y === 'R')) {
      return { label: t('analysis.regressionV0SqOverG'), formula: `${t('analysis.slope')} = v₀²/g`, value: s, unit: 'm', expr: `${s.toFixed(4)}` }
    }
    if ((x === 'invXLeft' || x === '1/xLeft') && (y === 'massLeft' || y === 'm1')) {
      return { label: t('analysis.regressionM2D2'), formula: `${t('analysis.slope')} = m₂·d₂`, value: s, unit: 'kg·m', expr: `${s.toFixed(4)}` }
    }
    if ((x === 'invXRight' || x === '1/xRight') && (y === 'massRight' || y === 'm2')) {
      return { label: t('analysis.regressionM1D1'), formula: `${t('analysis.slope')} = m₁·d₁`, value: s, unit: 'kg·m', expr: `${s.toFixed(4)}` }
    }
    if (x === 'sin_t' && y === 'sin_i') {
      const n2 = s
      const speed = 3e8 / n2
      return { label: t('analysis.regressionN2AndSpeed'), formula: `n₂ = ${t('analysis.slope')}(sin θᵢ vs sin θₜ)    v = c / n₂`, value: n2, unit: '', expr: `n₂ = ${n2.toFixed(4)}    v = ${(speed/1e8).toFixed(2)} × 10⁸ m/s` }
    }
    if ((x === 'inv_do' || x === '1/do') && (y === 'inv_di' || y === '1/di')) {
      const intercept = regression.value?.intercept ?? 0
      const f = intercept !== 0 ? 1 / intercept : 0
      return { label: t('analysis.regressionFocalLength'), formula: '1/f = intercept(1/di vs 1/do) → f = 1/intercept', value: f, unit: 'cm', expr: `f = 1 / ${intercept.toFixed(4)} = ${f.toFixed(2)} cm` }
    }
    return null
  })

  return { regression, slopeWarning, slopeCalc }
}
