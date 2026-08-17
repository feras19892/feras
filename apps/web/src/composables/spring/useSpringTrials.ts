import { ref, computed, type Ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'
import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'

export interface SpringTrial {
  id: number; mass: number; k: number; amplitude: number
  T: number; f: number; omega: number; kCalc: number; err: number
}

export interface SpringMeasured {
  T: number | null; f: number | null; omega: number | null; kCalc: number | null; kCalcEff: number | null
}

export function useSpringTrials(params: SpringParams, measured: Ref<SpringMeasured>) {
  const { t } = useI18n()
  const calcResult = ref(t('experiments.clickBtnShowCalc'))

  const base = useExperimentTrials<SpringTrial>({
    storageKey: 'spring:trials:v1',
    getExtraData: () => calcResult.value,
    setExtraData: (data) => { if (typeof data === 'string') calcResult.value = data },
  })

  const trialStats = computed(() => {
    if (base.trials.value.length === 0) return { T_mean: 0, T_std: 0, k_mean: 0, k_std: 0 }
    const Ts = base.trials.value.map(tr => tr.T)
    const ks = base.trials.value.map(tr => tr.kCalc)
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return { T_mean: mean(Ts), T_std: std(Ts), k_mean: mean(ks), k_std: std(ks) }
  })

  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return mean + z * stdDev
  }

  function recordTrial() {
    if (!measured.value.T) return
    if (params.mass < 0.01 || params.mass > 20) return
    const noiseLevel = 0.02
    const noisyT = gaussianNoise(measured.value.T, measured.value.T * noiseLevel)
    const noisyK = (4 * Math.PI * Math.PI * params.mass) / (noisyT * noisyT)
    const err = Math.abs((noisyK - params.k) / params.k) * 100
    base.addTrial({
      mass: params.mass, k: params.k, amplitude: params.amplitude,
      T: noisyT, f: 1 / noisyT, omega: (2 * Math.PI) / noisyT, kCalc: noisyK, err,
    })
  }

  function exportCsv() {
    if (!base.trials.value.length) return
    downloadCsv('spring_mass_data.csv', [
      ['#', 'm', 'k', 'A', 'T', 'f', 'ω', 'kcalc', 'error'],
      ...base.trials.value.map((tr, i) => [
        i + 1, tr.mass.toFixed(3), tr.k.toFixed(1), tr.amplitude.toFixed(3),
        tr.T.toFixed(4), tr.f.toFixed(3), tr.omega.toFixed(3),
        tr.kCalc.toFixed(2), tr.err.toFixed(2) + '%',
      ]),
    ])
  }

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
    if (base.trials.value.length < 2) { calcResult.value = t('experiments.atLeastTwoTrials'); return }
    const xs = base.trials.value.map(tr => tr.mass)
    const ys = base.trials.value.map(tr => tr.T * tr.T)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = t('experiments.insufficientData'); return }
    const k = (4 * Math.PI * Math.PI) / fit.slope
    const err = Math.abs((k - params.k) / params.k) * 100
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `T² = ${fit.slope.toFixed(5)}·m ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(5)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>k = 4π² / slope = <b>${k.toFixed(2)} N/m</b><br>${t('experiments.errorPercent')} = <b>${err.toFixed(2)}%</b>`
  }

  return {
    trials: base.trials, trialStats,
    recordTrial, removeTrial: base.removeTrial, clearTrials: base.clearTrials, exportCsv,
    undo: base.undo, redo: base.redo, canUndo: base.canUndo, canRedo: base.canRedo,
    autoLoad: base.autoLoad,
    calcResult, calcK, calcT, calcM, calcFitK,
  }
}
