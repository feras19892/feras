import { ref, computed, type Ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'

export interface Trial {
  id: number; mass: number; k: number; amplitude: number
  T: number; f: number; omega: number; kCalc: number; err: number
}

export interface Measured {
  T: number | null; f: number | null; omega: number | null; kCalc: number | null; kCalcEff: number | null
}

const SAVE_KEY = 'spring:trials:v1'

export function useSpringTrials(params: SpringParams, measured: Ref<Measured>) {
  const { t } = useI18n()
  const trials = ref<Trial[]>([])
  let nextTrialId = 1

  // Undo/Redo history
  const history = ref<Trial[][]>([])
  const historyIndex = ref(-1)

  function pushHistory() {
    // Remove any future history if we're not at the end
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push([...trials.value])
    historyIndex.value++
    // Limit history to 20 steps
    if (history.value.length > 20) {
      history.value.shift()
      historyIndex.value--
    }
  }

  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--
      trials.value = [...history.value[historyIndex.value]]
      nextTrialId = trials.value.length > 0 ? Math.max(...trials.value.map(t => t.id)) + 1 : 1
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      trials.value = [...history.value[historyIndex.value]]
      nextTrialId = trials.value.length > 0 ? Math.max(...trials.value.map(t => t.id)) + 1 : 1
    }
  }

  function canUndo() { return historyIndex.value > 0 }
  function canRedo() { return historyIndex.value < history.value.length - 1 }

  const trialStats = computed(() => {
    if (trials.value.length === 0) return { T_mean: 0, T_std: 0, k_mean: 0, k_std: 0 }
    const Ts = trials.value.map(t => t.T)
    const ks = trials.value.map(t => t.kCalc)
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return { T_mean: mean(Ts), T_std: std(Ts), k_mean: mean(ks), k_std: std(ks) }
  })

  // Gaussian noise simulation (~2% error, mimics human reading error)
  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return mean + z * stdDev
  }

  function recordTrial() {
    if (!measured.value.T) return
    if (params.mass < 0.01 || params.mass > 20) {
      alert(t('experiments.massMustBeBetween', { min: '0.01', max: '20' }))
      return
    }
    pushHistory()
    const noiseLevel = 0.02  // ~2% reading error (human-like)
    const noisyT = gaussianNoise(measured.value.T, measured.value.T * noiseLevel)
    const noisyK = (4 * Math.PI * Math.PI * params.mass) / (noisyT * noisyT)
    const err = Math.abs((noisyK - params.k) / params.k) * 100
    trials.value = [...trials.value, {
      id: nextTrialId++, mass: params.mass, k: params.k, amplitude: params.amplitude,
      T: noisyT, f: 1 / noisyT, omega: (2 * Math.PI) / noisyT, kCalc: noisyK, err,
    }]
    autoSave()
  }

  function removeTrial(id: number) {
    pushHistory()
    trials.value = trials.value.filter(t => t.id !== id)
    autoSave()
  }
  function clearTrials() {
    pushHistory()
    trials.value = []
    autoSave()
  }

  // Auto-save to localStorage
  function autoSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        trials: trials.value,
        nextId: nextTrialId,
        calcResult: calcResult.value,
      }))
    } catch { /* ignore */ }
  }

  function autoLoad() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.trials)) {
        const valid = parsed.trials.filter((t: Record<string, unknown>) => {
          if (!t || typeof t.mass !== 'number' || t.mass < 0.01 || t.mass > 20) return false
          if (typeof t.T !== 'number' || t.T <= 0 || t.T > 20) return false
          // Sanity check: T should be roughly consistent with mass and k (within 3x of theoretical)
          const theoreticalT = 2 * Math.PI * Math.sqrt(Number(t.mass) / Math.max(Number(t.k), 1))
          if (t.T < theoreticalT / 3 || t.T > theoreticalT * 3) return false
          return true
        })
        trials.value = valid
        nextTrialId = parsed.nextId ?? (valid.length > 0 ? Math.max(...valid.map((t: Record<string, unknown>) => Number(t.id))) + 1 : 1)
        if (parsed.calcResult) calcResult.value = parsed.calcResult
        history.value = [[...valid]]
        historyIndex.value = 0
      }
    } catch { /* ignore */ }
  }

  function exportCsv() {
    if (!trials.value.length) return
    downloadCsv('spring_mass_data.csv', [
      ['#', 'm', 'k', 'A', 'T', 'f', 'ω', 'kcalc', 'error'],
      ...trials.value.map((t, i) => [
        i + 1, t.mass.toFixed(3), t.k.toFixed(1), t.amplitude.toFixed(3),
        t.T.toFixed(4), t.f.toFixed(3), t.omega.toFixed(3),
        t.kCalc.toFixed(2), t.err.toFixed(2) + '%',
      ]),
    ])
  }

  const calcResult = ref(t('experiments.clickBtnShowCalc'))

  function calcK() {
    if (!measured.value.T) { calcResult.value = t('experiments.measurePeriodFirst'); return }
    const k = (4 * Math.PI * Math.PI * params.mass) / (measured.value.T * measured.value.T)
    const err = Math.abs((k - params.k) / params.k) * 100
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> k = 4π² × m / T²<br><b>${t('experiments.substitutionLabel')}:</b> k = 4π² × ${params.mass.toFixed(3)} / (${measured.value.T.toFixed(4)})²<br><b>${t('experiments.resultLabel')}:</b> k = <b>${k.toFixed(2)} N/m</b><br><b>${t('experiments.errorPercent')}:</b> ${err.toFixed(2)}%`
  }

  function calcT() {
    const T = 2 * Math.PI * Math.sqrt(params.mass / params.k)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> T = 2π √(m/k)<br><b>${t('experiments.substitutionLabel')}:</b> T = 2π √(${params.mass.toFixed(3)} / ${params.k.toFixed(1)})<br><b>${t('experiments.resultLabel')}:</b> T = <b>${T.toFixed(4)} s</b>`
  }

  function calcM() {
    if (!measured.value.T) { calcResult.value = t('experiments.measurePeriodFirst'); return }
    const mass = (measured.value.T * measured.value.T * params.k) / (4 * Math.PI * Math.PI)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> m = (T² × k) / (4π²)<br><b>${t('experiments.substitutionLabel')}:</b> m = (${measured.value.T.toFixed(4)}² × ${params.k.toFixed(1)}) / (4π²)<br><b>${t('experiments.resultLabel')}:</b> m = <b>${mass.toFixed(3)} kg</b>`
  }

  function calcFitK() {
    if (trials.value.length < 2) { calcResult.value = t('experiments.atLeastTwoTrials'); return }
    const xs = trials.value.map(t => t.mass)
    const ys = trials.value.map(t => t.T * t.T)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = t('experiments.insufficientData'); return }
    const k = (4 * Math.PI * Math.PI) / fit.slope
    const err = Math.abs((k - params.k) / params.k) * 100
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `T² = ${fit.slope.toFixed(5)}·m ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(5)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>k = 4π² / slope = <b>${k.toFixed(2)} N/m</b><br>${t('experiments.errorPercent')} = <b>${err.toFixed(2)}%</b>`
  }

  return {
    trials, trialStats,
    recordTrial, removeTrial, clearTrials, exportCsv,
    undo, redo, canUndo, canRedo,
    autoLoad,
    calcResult, calcK, calcT, calcM, calcFitK,
  }
}
