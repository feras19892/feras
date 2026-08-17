import { ref, computed, type Ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'
import type { PendulumParams } from '../../modules/physics/experiments/pendulum/usePendulumPhysics'

export interface PendulumTrial {
  id: number; length: number; g: number
  T: number; f: number; omega: number; gCalc: number; err: number
}

export interface PendulumMeasured {
  T: number | null; f: number | null; omega: number | null; gCalc: number | null
}

export function usePendulumTrials(params: PendulumParams, measured: Ref<PendulumMeasured>) {
  const { t } = useI18n()
  const calcResult = ref(t('experiments.clickBtnShowCalc'))

  const base = useExperimentTrials<PendulumTrial>({
    storageKey: 'pendulum:trials:v1',
    getExtraData: () => calcResult.value,
    setExtraData: (data) => { if (typeof data === 'string') calcResult.value = data },
  })

  const trialStats = computed(() => {
    if (base.trials.value.length === 0) return { T_mean: 0, T_std: 0, g_mean: 0, g_std: 0 }
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return { T_mean: mean(base.trials.value.map(tr => tr.T)), T_std: std(base.trials.value.map(tr => tr.T)), g_mean: mean(base.trials.value.map(tr => tr.gCalc)), g_std: std(base.trials.value.map(tr => tr.gCalc)) }
  })

  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random(); while (v === 0) v = Math.random()
    return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev
  }

  function recordTrial() {
    if (!measured.value.T) return
    if (params.length < 0.05 || params.length > 3) return
    const noiseLevel = 0.02
    const noisyT = gaussianNoise(measured.value.T, measured.value.T * noiseLevel)
    const gCalc = (4 * Math.PI * Math.PI * params.length) / (noisyT * noisyT)
    const err = Math.abs((gCalc - params.g) / params.g) * 100
    base.addTrial({ length: params.length, g: params.g, T: noisyT, f: 1 / noisyT, omega: (2 * Math.PI) / noisyT, gCalc, err })
  }

  function exportCsv() {
    if (!base.trials.value.length) return
    downloadCsv('pendulum_data.csv', [
      ['#', 'L', 'T', 'f', 'ω', 'gCalc', 'error'],
      ...base.trials.value.map((tr, i) => [i + 1, tr.length.toFixed(3), tr.T.toFixed(4), tr.f.toFixed(3), tr.omega.toFixed(3), tr.gCalc.toFixed(2), tr.err.toFixed(2) + '%']),
    ])
  }

  function calcG() {
    if (!measured.value.T) { calcResult.value = t('experiments.measurePeriodFirst'); return }
    const g = (4 * Math.PI * Math.PI * params.length) / (measured.value.T * measured.value.T)
    const err = Math.abs((g - params.g) / params.g) * 100
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> g = 4π²L/T²<br><b>${t('experiments.substitutionLabel')}:</b> g = 4π² × ${params.length.toFixed(3)} / (${measured.value.T.toFixed(4)})²<br><b>${t('experiments.resultLabel')}:</b> g = <b>${g.toFixed(2)} m/s²</b><br><b>${t('experiments.errorPercent')}:</b> ${err.toFixed(2)}%`
  }
  function calcT() {
    const T = 2 * Math.PI * Math.sqrt(params.length / params.g)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> T = 2π√(L/g)<br><b>${t('experiments.substitutionLabel')}:</b> T = 2π√(${params.length.toFixed(3)} / ${params.g.toFixed(2)})<br><b>${t('experiments.resultLabel')}:</b> T = <b>${T.toFixed(4)} s</b>`
  }
  function calcL() {
    if (!measured.value.T) { calcResult.value = t('experiments.measurePeriodFirst'); return }
    const L = (measured.value.T * measured.value.T * params.g) / (4 * Math.PI * Math.PI)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> L = (T² × g) / (4π²)<br><b>${t('experiments.substitutionLabel')}:</b> L = (${measured.value.T.toFixed(4)}² × ${params.g.toFixed(2)}) / (4π²)<br><b>${t('experiments.resultLabel')}:</b> L = <b>${L.toFixed(3)} m</b>`
  }
  function calcFitG() {
    if (base.trials.value.length < 2) { calcResult.value = t('experiments.atLeastTwoTrials'); return }
    const xs = base.trials.value.map(tr => tr.length)
    const ys = base.trials.value.map(tr => tr.T * tr.T)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = t('experiments.insufficientData'); return }
    const g = (4 * Math.PI * Math.PI) / fit.slope
    const err = Math.abs((g - params.g) / params.g) * 100
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `T² = ${fit.slope.toFixed(5)}·L ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(5)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>g = 4π² / slope = <b>${g.toFixed(2)} m/s²</b><br>${t('experiments.errorPercent')} = <b>${err.toFixed(2)}%</b>`
  }

  return { trials: base.trials, trialStats, recordTrial, removeTrial: base.removeTrial, clearTrials: base.clearTrials, exportCsv, undo: base.undo, redo: base.redo, canUndo: base.canUndo, canRedo: base.canRedo, autoLoad: base.autoLoad, calcResult, calcG, calcT, calcL, calcFitG }
}
