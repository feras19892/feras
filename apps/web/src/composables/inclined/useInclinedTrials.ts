import { ref, computed, type Ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { calculateInclinedSummary } from './inclinedUtils'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'
import type { InclinedParams } from '../../modules/physics/experiments/inclined/useInclinedPhysics'

export interface InclinedTrial {
  id: number
  thetaDeg: number
  length: number
  mass: number
  mu: number
  acceleration: number
  timeOfArrival: number
  finalVelocity: number
  normalForce: number
  parallelForce: number
  frictionForce: number
  err: number
}

export interface InclinedMeasured {
  acceleration: number | null
  timeOfArrival: number | null
  finalVelocity: number | null
  normalForce: number | null
  parallelForce: number | null
  frictionForce: number | null
}

export function useInclinedTrials(params: InclinedParams, measured: Ref<InclinedMeasured>, enableNoise: Ref<boolean>) {
  const { t } = useI18n()
  const calcResult = ref(t('experiments.clickBtnShowCalc'))

  const base = useExperimentTrials<InclinedTrial>({
    storageKey: 'inclined:trials:v1',
  })

  const trialStats = computed(() => {
    if (base.trials.value.length === 0) return { a_mean: 0, a_std: 0, t_mean: 0, t_std: 0, v_mean: 0, v_std: 0 }
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return {
      a_mean: mean(base.trials.value.map(tr => tr.acceleration)),
      a_std: std(base.trials.value.map(tr => tr.acceleration)),
      t_mean: mean(base.trials.value.map(tr => tr.timeOfArrival)),
      t_std: std(base.trials.value.map(tr => tr.timeOfArrival)),
      v_mean: mean(base.trials.value.map(tr => tr.finalVelocity)),
      v_std: std(base.trials.value.map(tr => tr.finalVelocity)),
    }
  })

  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random(); while (v === 0) v = Math.random()
    return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev
  }

  function recordTrial() {
    if (!measured.value.timeOfArrival) return
    const noiseLevel = 0.02
    const a = enableNoise.value
      ? gaussianNoise(measured.value.acceleration!, measured.value.acceleration! * noiseLevel)
      : measured.value.acceleration!
    const tVal = enableNoise.value
      ? gaussianNoise(measured.value.timeOfArrival!, measured.value.timeOfArrival! * noiseLevel)
      : measured.value.timeOfArrival!
    const v = enableNoise.value
      ? gaussianNoise(measured.value.finalVelocity!, measured.value.finalVelocity! * noiseLevel)
      : measured.value.finalVelocity!

    const theoretical = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    const err = Math.abs((a - theoretical.acceleration) / theoretical.acceleration) * 100

    base.addTrial({
      thetaDeg: params.thetaDeg, length: params.length, mass: params.mass, mu: params.mu,
      acceleration: Number(a.toFixed(3)), timeOfArrival: Number(tVal.toFixed(3)), finalVelocity: Number(v.toFixed(2)),
      normalForce: measured.value.normalForce!, parallelForce: measured.value.parallelForce!, frictionForce: measured.value.frictionForce!,
      err: Number(err.toFixed(2)),
    })
  }

  function exportCsv() {
    if (!base.trials.value.length) return
    downloadCsv('inclined_data.csv', [
      ['#', 'theta (deg)', 'L (m)', 'm (kg)', 'mu', 'a (m/s2)', 't (s)', 'v (m/s)', 'N (N)', 'F_parallel (N)', 'f_friction (N)', 'error'],
      ...base.trials.value.map((tr, i) => [i + 1, tr.thetaDeg, tr.length.toFixed(2), tr.mass.toFixed(2), tr.mu.toFixed(2), tr.acceleration.toFixed(3), tr.timeOfArrival.toFixed(3), tr.finalVelocity.toFixed(2), tr.normalForce.toFixed(2), tr.parallelForce.toFixed(2), tr.frictionForce.toFixed(2), tr.err.toFixed(2) + '%']),
    ])
  }

  function calcAcceleration() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> a = g(sinθ − μ·cosθ) − Fd/m<br><b>${t('experiments.substitutionLabel')}:</b> a = ${params.g}×(sin(${params.thetaDeg}°) − ${params.mu}×cos(${params.thetaDeg}°))${params.airResistance ? ' − Fd/' + params.mass : ''}<br><b>${t('experiments.resultLabel')}:</b> a = <b>${summary.acceleration} m/s²</b>`
  }
  function calcTime() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> t = √(2L/a)<br><b>${t('experiments.substitutionLabel')}:</b> t = √(2×${params.length} / ${summary.acceleration})<br><b>${t('experiments.resultLabel')}:</b> t = <b>${summary.timeOfArrival} s</b>`
  }
  function calcVelocity() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> v = √(2aL)<br><b>${t('experiments.substitutionLabel')}:</b> v = √(2×${summary.acceleration}×${params.length})<br><b>${t('experiments.resultLabel')}:</b> v = <b>${summary.finalVelocity} m/s</b>`
  }
  function calcNormal() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> N = m·g·cos(θ)<br><b>${t('experiments.substitutionLabel')}:</b> N = ${params.mass}×${params.g}×cos(${params.thetaDeg}°)<br><b>${t('experiments.resultLabel')}:</b> N = <b>${summary.normalForce} N</b>`
  }
  function calcGFromSlope() {
    const smooth = base.trials.value.filter(tr => tr.mu < 0.05)
    if (smooth.length < 2) { calcResult.value = t('experiments.needTwoSmoothTrials'); return }
    const xs = smooth.map(tr => Math.sin(tr.thetaDeg * Math.PI / 180))
    const ys = smooth.map(tr => tr.acceleration)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = t('experiments.insufficientData'); return }
    const gCalc = fit.slope
    const err = Math.abs((gCalc - params.g) / params.g) * 100
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `a = ${fit.slope.toFixed(4)}·sin(θ) ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(4)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>a = g·sin(θ) → g = slope = <b>${gCalc.toFixed(2)} m/s²</b><br>${t('experiments.errorPercent')} = <b>${err.toFixed(2)}%</b>`
  }

  return {
    trials: base.trials, trialStats, recordTrial, removeTrial: base.removeTrial, clearTrials: base.clearTrials, exportCsv,
    undo: base.undo, redo: base.redo, canUndo: base.canUndo, canRedo: base.canRedo, autoLoad: base.autoLoad,
    calcResult, calcAcceleration, calcTime, calcVelocity, calcNormal, calcGFromSlope,
  }
}
