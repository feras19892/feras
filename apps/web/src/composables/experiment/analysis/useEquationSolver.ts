import { ref, computed, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import type { AnalysisEquation } from '../../../types/physics'

export function useEquationSolver(
  equations: () => AnalysisEquation[],
  readings: () => Record<string, number>[],
) {
  const { t } = useI18n()
  const selectedIndex = ref(0)
  const varValues = ref<Record<string, number>>({})
  const targetVar = ref('')
  const result = ref<string | null>(null)
  const solvedEquations = ref<{ equationName: string; formula: string; targetVar: string; varValues: Record<string, number>; result: string; timestamp: number }[]>([])

  function round3(n: number) { return Math.round(n * 1000) / 1000 }

  function fillFromReadings() {
    const eqs = equations()
    if (!eqs.length) return
    const eq = eqs[selectedIndex.value]
    if (!eq) return
    for (const row of readings()) {
      let hasValue = false
      for (const v of eq.variables) {
        if (row[v.symbol] !== undefined && row[v.symbol] !== 0) {
          varValues.value[v.symbol] = round3(row[v.symbol])
          hasValue = true
        }
      }
      if (hasValue) break
    }
  }

  watch(equations, (eqs) => {
    if (eqs.length) {
      selectedIndex.value = 0
      const vars: Record<string, number> = {}
      for (const v of eqs[0].variables) { vars[v.symbol] = v.value ?? 0 }
      varValues.value = vars
      targetVar.value = eqs[0].solveFor[0] ?? ''
      fillFromReadings()
    }
  }, { immediate: true })

  watch(readings, () => { fillFromReadings() }, { deep: true })

  const activeEquation = computed(() => equations()[selectedIndex.value])

  function steps(name: string, formula: string, value: number) {
    return `${name} = ${formula} = ${value.toFixed(4)}`
  }

  function solve() {
    const eq = activeEquation.value
    if (!eq || !targetVar.value) { result.value = null; return }

    const vals = { ...varValues.value }
    const missing = targetVar.value

    // === Spring ===
    if (eq.formula.includes('T = 2π√(m/k)')) {
      const m = vals['m'] ?? 0; const T = vals['T'] ?? 0; const k = vals['k'] ?? 0
      if (missing === 'k' && m > 0 && T > 0) {
        result.value = steps('k', `4π²·m/T² = 4π²·${m.toFixed(4)}/${(T * T).toFixed(4)}`, (4 * Math.PI * Math.PI * m) / (T * T))
      } else if (missing === 'T' && m > 0 && k > 0) {
        result.value = steps('T', `2π√(m/k) = 2π√(${m.toFixed(4)}/${k.toFixed(4)})`, 2 * Math.PI * Math.sqrt(m / k))
      } else if (missing === 'm' && T > 0 && k > 0) {
        result.value = steps('m', `k·T²/(4π²) = ${k.toFixed(4)}·${(T * T).toFixed(4)}/(4π²)`, (k * T * T) / (4 * Math.PI * Math.PI))
      } else result.value = t('analysis.enterValidKnownValues')
    }
    // === Pendulum ===
    else if (eq.formula.includes('T = 2π√(L/g)')) {
      const L = vals['L'] ?? 0; const T = vals['T'] ?? 0; const g = vals['g'] ?? 0
      if (missing === 'g' && L > 0 && T > 0) {
        result.value = steps('g', `4π²·L/T² = 4π²·${L.toFixed(4)}/${(T * T).toFixed(4)}`, (4 * Math.PI * Math.PI * L) / (T * T))
      } else if (missing === 'T' && L > 0 && g > 0) {
        result.value = steps('T', `2π√(L/g) = 2π√(${L.toFixed(4)}/${g.toFixed(4)})`, 2 * Math.PI * Math.sqrt(L / g))
      } else if (missing === 'L' && T > 0 && g > 0) {
        result.value = steps('L', `g·T²/(4π²) = ${g.toFixed(4)}·${(T * T).toFixed(4)}/(4π²)`, (g * T * T) / (4 * Math.PI * Math.PI))
      } else result.value = t('analysis.enterValidKnownValues')
    }
    // === Pendulum T² form ===
    else if (eq.formula.includes('T² = (4π²/g)·L')) {
      const L = vals['L'] ?? 0; const T = vals['T'] ?? 0
      if (missing === 'g' && L > 0 && T > 0) {
        result.value = steps('g', `4π²·L/T² = 4π²·${L.toFixed(4)}/${(T * T).toFixed(4)}`, (4 * Math.PI * Math.PI * L) / (T * T))
      } else result.value = t('analysis.enterValidValues')
    }
    // === Free Fall ===
    else if (eq.formula.includes('h = ½gt²')) {
      const h = vals['h'] ?? 0; const tVal = vals['t'] ?? 0; const g = vals['g'] ?? 0
      if (missing === 'g' && h > 0 && tVal > 0) {
        result.value = steps('g', `2h/t² = 2·${h.toFixed(4)}/${(tVal * tVal).toFixed(4)}`, (2 * h) / (tVal * tVal))
      } else if (missing === 't' && h > 0 && g > 0) {
        result.value = steps('t', `√(2h/g) = √(2·${h.toFixed(4)}/${g.toFixed(4)})`, Math.sqrt((2 * h) / g))
      } else if (missing === 'h' && g > 0 && tVal > 0) {
        result.value = steps('h', `½gt² = ½·${g.toFixed(4)}·${(tVal * tVal).toFixed(4)}`, 0.5 * g * tVal * tVal)
      } else result.value = t('analysis.enterValidKnownValues')
    }
    // === Inclined Plane ===
    else if (eq.formula.includes('a = g·sinθ − μ·g·cosθ')) {
      const a = vals['a'] ?? 0; const g = vals['g'] ?? 0; const theta = (vals['θ'] ?? 0) * Math.PI / 180; const mu = vals['μ'] ?? 0
      if (missing === 'a' && g > 0) {
        result.value = steps('a', `g·sinθ−μ·g·cosθ = ${g.toFixed(4)}·${Math.sin(theta).toFixed(4)}−${mu.toFixed(4)}·${g.toFixed(4)}·${Math.cos(theta).toFixed(4)}`, g * Math.sin(theta) - mu * g * Math.cos(theta))
      } else if (missing === 'μ' && g > 0 && Math.cos(theta) > 1e-6) {
        result.value = steps('μ', `(g·sinθ−a)/(g·cosθ)`, (g * Math.sin(theta) - a) / (g * Math.cos(theta)))
      } else result.value = t('analysis.enterValidValues')
    }
    else if (eq.formula.includes('s = ½at²')) {
      const s = vals['s'] ?? 0; const a = vals['a'] ?? 0; const tVal = vals['t'] ?? 0
      if (missing === 'a' && s > 0 && tVal > 0) {
        result.value = steps('a', `2s/t² = 2·${s.toFixed(4)}/${(tVal * tVal).toFixed(4)}`, (2 * s) / (tVal * tVal))
      } else if (missing === 't' && s > 0 && a > 0) {
        result.value = steps('t', `√(2s/a) = √(2·${s.toFixed(4)}/${a.toFixed(4)})`, Math.sqrt((2 * s) / a))
      } else if (missing === 's' && a > 0 && tVal > 0) {
        result.value = steps('s', `½at² = ½·${a.toFixed(4)}·${(tVal * tVal).toFixed(4)}`, 0.5 * a * tVal * tVal)
      } else result.value = t('analysis.enterValidValues')
    }
    // === Collision ===
    else if (eq.formula.includes('m₁v₁i + m₂v₂i = m₁v₁f + m₂v₂f')) {
      const m1 = vals['m1'] ?? 0; const m2 = vals['m2'] ?? 0
      const v1i = vals['v1i'] ?? 0; const v2i = vals['v2i'] ?? 0
      const v1f = vals['v1f'] ?? 0; const v2f = vals['v2f'] ?? 0
      if (missing === 'v1f') {
        result.value = steps('v₁f', `(m₁v₁i+m₂v₂i−m₂v₂f)/m₁`, (m1 * v1i + m2 * v2i - m2 * v2f) / m1)
      } else if (missing === 'v2f') {
        result.value = steps('v₂f', `(m₁v₁i+m₂v₂i−m₁v₁f)/m₂`, (m1 * v1i + m2 * v2i - m1 * v1f) / m2)
      } else result.value = t('analysis.enterValidValues')
    }
    else if (eq.formula.includes('e = (v₂f − v₁f)/(v₁i − v₂i)')) {
      const v1i = vals['v1i'] ?? 0; const v2i = vals['v2i'] ?? 0; const v1f = vals['v1f'] ?? 0; const v2f = vals['v2f'] ?? 0
      if (missing === 'e' && Math.abs(v1i - v2i) > 1e-6) {
        result.value = steps('e', `(v₂f−v₁f)/(v₁i−v₂i)`, (v2f - v1f) / (v1i - v2i))
      } else result.value = t('analysis.enterValidValues')
    }
    // === Projectile ===
    else if (eq.formula.includes('R = v₀²·sin(2θ)/g')) {
      const v0 = vals['v0'] ?? 0; const theta = (vals['θ'] ?? 0) * Math.PI / 180; const g = vals['g'] ?? 0; const R = vals['R'] ?? 0
      if (missing === 'R' && v0 > 0 && g > 0) {
        result.value = steps('R', `v₀²·sin(2θ)/g`, (v0 * v0 * Math.sin(2 * theta)) / g)
      } else if (missing === 'v0' && R > 0 && g > 0 && Math.sin(2 * theta) > 1e-6) {
        result.value = steps('v₀', `√(R·g/sin(2θ))`, Math.sqrt((R * g) / Math.sin(2 * theta)))
      } else if (missing === 'θ' && R > 0 && v0 > 0 && g > 0) {
        result.value = steps('θ', `½·arcsin(R·g/v₀²)`, Math.asin((R * g) / (v0 * v0)) / 2 * 180 / Math.PI)
      } else result.value = t('analysis.enterValidValues')
    }
    else if (eq.formula.includes('H = v₀²·sin²(θ)/(2g)')) {
      const v0 = vals['v0'] ?? 0; const theta = (vals['θ'] ?? 0) * Math.PI / 180; const g = vals['g'] ?? 0
      if (missing === 'H' && v0 > 0 && g > 0) {
        result.value = steps('H', `v₀²·sin²(θ)/(2g)`, (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g))
      } else result.value = t('analysis.enterValidValues')
    }
    // === Straight Wire (Biot-Savart) ===
    else if (eq.formula.includes('B = μ₀I / (2πr)')) {
      const B_val = vals['B'] ?? 0; const I_val = vals['I'] ?? 0; const r_val = vals['r'] ?? 0; const mu0 = vals['μ₀'] ?? 0
      if (missing === 'B' && I_val > 0 && r_val > 0) {
        const mu = mu0 > 0 ? mu0 : (4 * Math.PI * 1e-7)
        result.value = steps('B', `μ₀I/(2πr) = ${mu.toExponential(4)}·${I_val.toFixed(4)}/(2π·${r_val.toFixed(4)})`, (mu * I_val) / (2 * Math.PI * r_val))
      } else if (missing === 'I' && B_val > 0 && r_val > 0) {
        const mu = mu0 > 0 ? mu0 : (4 * Math.PI * 1e-7)
        result.value = steps('I', `B·2πr/μ₀ = ${B_val.toExponential(4)}·2π·${r_val.toFixed(4)}/${mu.toExponential(4)}`, (B_val * 2 * Math.PI * r_val) / mu)
      } else if (missing === 'r' && B_val > 0 && I_val > 0) {
        const mu = mu0 > 0 ? mu0 : (4 * Math.PI * 1e-7)
        result.value = steps('r', `μ₀I/(2πB) = ${mu.toExponential(4)}·${I_val.toFixed(4)}/(2π·${B_val.toExponential(4)})`, (mu * I_val) / (2 * Math.PI * B_val))
      } else if (missing === 'μ₀' && B_val > 0 && I_val > 0 && r_val > 0) {
        result.value = steps('μ₀', `B·2πr/I = ${B_val.toExponential(4)}·2π·${r_val.toFixed(4)}/${I_val.toFixed(4)}`, (B_val * 2 * Math.PI * r_val) / I_val)
      } else result.value = t('analysis.enterValidKnownValues')
    }
    // === Circular Coil (Biot-Savart) ===
    else if (eq.formula.includes('B = μ₀NI / (2R)')) {
      const B_val = vals['B'] ?? 0; const I_val = vals['I'] ?? 0; const N_val = vals['N'] ?? 0; const R_val = vals['R'] ?? 0; const mu0 = vals['μ₀'] ?? 0
      if (missing === 'B' && I_val > 0 && N_val > 0 && R_val > 0) {
        const mu = mu0 > 0 ? mu0 : (4 * Math.PI * 1e-7)
        result.value = steps('B', `μ₀NI/(2R) = ${mu.toExponential(4)}·${N_val}·${I_val.toFixed(4)}/(2·${R_val.toFixed(4)})`, (mu * N_val * I_val) / (2 * R_val))
      } else if (missing === 'I' && B_val > 0 && N_val > 0 && R_val > 0) {
        const mu = mu0 > 0 ? mu0 : (4 * Math.PI * 1e-7)
        result.value = steps('I', `B·2R/(μ₀N) = ${B_val.toExponential(4)}·2·${R_val.toFixed(4)}/(${mu.toExponential(4)}·${N_val})`, (B_val * 2 * R_val) / (mu * N_val))
      } else if (missing === 'N' && B_val > 0 && I_val > 0 && R_val > 0) {
        const mu = mu0 > 0 ? mu0 : (4 * Math.PI * 1e-7)
        result.value = steps('N', `B·2R/(μ₀I) = ${B_val.toExponential(4)}·2·${R_val.toFixed(4)}/(${mu.toExponential(4)}·${I_val.toFixed(4)})`, Math.round((B_val * 2 * R_val) / (mu * I_val)))
      } else if (missing === 'R' && B_val > 0 && I_val > 0 && N_val > 0) {
        const mu = mu0 > 0 ? mu0 : (4 * Math.PI * 1e-7)
        result.value = steps('R', `μ₀NI/(2B) = ${mu.toExponential(4)}·${N_val}·${I_val.toFixed(4)}/(2·${B_val.toExponential(4)})`, (mu * N_val * I_val) / (2 * B_val))
      } else if (missing === 'μ₀' && B_val > 0 && I_val > 0 && N_val > 0 && R_val > 0) {
        result.value = steps('μ₀', `B·2R/(NI) = ${B_val.toExponential(4)}·2·${R_val.toFixed(4)}/(${N_val}·${I_val.toFixed(4)})`, (B_val * 2 * R_val) / (N_val * I_val))
      } else result.value = t('analysis.enterValidKnownValues')
    }
    else {
      result.value = t('analysis.calculateFromEquation', { missing, formula: eq.formula })
    }
  }

  // Auto-solve when enough inputs are filled
  watch([varValues, targetVar], () => {
    const eq = activeEquation.value
    if (!eq || !targetVar.value) return
    const known = eq.variables.filter(v => varValues.value[v.symbol] !== undefined && varValues.value[v.symbol] !== 0).length
    const total = eq.variables.length
    if (known >= total - 1) solve()
  }, { deep: true })

  // Capture solved results for report
  watch(result, (r) => {
    const eq = activeEquation.value
    if (!r || !eq) return
    const entry = {
      equationName: eq.name,
      formula: eq.formula,
      targetVar: targetVar.value,
      varValues: { ...varValues.value },
      result: r,
      timestamp: Date.now(),
    }
    // Avoid duplicates (same equation + same target)
    const idx = solvedEquations.value.findIndex(
      s => s.equationName === entry.equationName && s.targetVar === entry.targetVar
    )
    if (idx >= 0) solvedEquations.value[idx] = entry
    else solvedEquations.value.push(entry)
  })

  return {
    selectedIndex,
    varValues,
    targetVar,
    result,
    activeEquation,
    solve,
    solvedEquations,
  }
}
