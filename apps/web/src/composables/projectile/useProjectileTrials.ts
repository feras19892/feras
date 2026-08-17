import { ref, computed, type Ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'
import type { ProjectileParams } from '../../modules/physics/experiments/projectile/useProjectilePhysics'

export interface ProjectileTrial {
  id: number
  angleDegrees: number
  initialVelocity: number
  flightTimeSec: number
  maxHeightMeters: number
  rangeMeters: number
  err: number
}

export interface ProjectileMeasured {
  flightTime: number | null
  maxHeight: number | null
  range: number | null
}

export const SAVE_KEY = 'projectile:trials:v1'

export function useProjectileTrials(params: ProjectileParams, measured: Ref<ProjectileMeasured>) {
  const { t } = useI18n()
  const calcResult = ref(t('experiments.clickBtnShowCalc'))
  const fitResult = ref<{ slope: number; intercept: number; r2: number } | null>(null)

  const base = useExperimentTrials<ProjectileTrial>({
    storageKey: 'projectile:trials:v1',
    getExtraData: () => calcResult.value,
    setExtraData: (data) => { if (typeof data === 'string') calcResult.value = data },
  })

  const trialStats = computed(() => {
    if (base.trials.value.length === 0) return { range_mean: 0, range_std: 0, flightTime_mean: 0, flightTime_std: 0 }
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return {
      range_mean: mean(base.trials.value.map(tr => tr.rangeMeters)),
      range_std: std(base.trials.value.map(tr => tr.rangeMeters)),
      flightTime_mean: mean(base.trials.value.map(tr => tr.flightTimeSec)),
      flightTime_std: std(base.trials.value.map(tr => tr.flightTimeSec)),
    }
  })

  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return mean + z * stdDev
  }

  function recordTrial() {
    if (!measured.value.range) return
    const noiseLevel = 0.02
    const noisyRange = gaussianNoise(measured.value.range, measured.value.range * noiseLevel)
    const noisyTime = gaussianNoise(measured.value.flightTime ?? 0, (measured.value.flightTime ?? 0) * noiseLevel)
    const noisyHeight = gaussianNoise(measured.value.maxHeight ?? 0, (measured.value.maxHeight ?? 0) * noiseLevel)
    const err = Math.abs((noisyRange - measured.value.range) / measured.value.range) * 100
    base.addTrial({
      angleDegrees: params.angleDeg, initialVelocity: params.v0,
      flightTimeSec: noisyTime, maxHeightMeters: noisyHeight, rangeMeters: noisyRange, err,
    })
  }

  function exportCsv() {
    if (!base.trials.value.length) return
    downloadCsv('projectile_data.csv', [
      ['#', 'angle', 'v0', 'flightTime', 'maxHeight', 'range', 'error'],
      ...base.trials.value.map((tr, i) => [
        i + 1, tr.angleDegrees.toFixed(1), tr.initialVelocity.toFixed(2),
        tr.flightTimeSec.toFixed(3), tr.maxHeightMeters.toFixed(3), tr.rangeMeters.toFixed(3),
        tr.err.toFixed(2) + '%',
      ]),
    ])
  }

  function calcFlightTime() {
    const rad = (params.angleDeg * Math.PI) / 180
    const timeVal = (2 * params.v0 * Math.sin(rad)) / params.g
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> t = 2v₀sin(θ) / g<br><b>${t('experiments.substitutionLabel')}:</b> t = 2×${params.v0}×sin(${params.angleDeg}°) / ${params.g}<br><b>${t('experiments.resultLabel')}:</b> t = <b>${timeVal.toFixed(3)} s</b>`
  }

  function calcMaxHeight() {
    const rad = (params.angleDeg * Math.PI) / 180
    const h = (Math.pow(params.v0 * Math.sin(rad), 2)) / (2 * params.g)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> H = (v₀sinθ)² / 2g<br><b>${t('experiments.substitutionLabel')}:</b> H = (${params.v0}×sin(${params.angleDeg}°))² / (2×${params.g})<br><b>${t('experiments.resultLabel')}:</b> H = <b>${h.toFixed(3)} m</b>`
  }

  function calcRange() {
    const rad = (params.angleDeg * Math.PI) / 180
    const r = (Math.pow(params.v0, 2) * Math.sin(2 * rad)) / params.g
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> R = v₀²sin(2θ) / g<br><b>${t('experiments.substitutionLabel')}:</b> R = ${params.v0}²×sin(${2 * params.angleDeg}°) / ${params.g}<br><b>${t('experiments.resultLabel')}:</b> R = <b>${r.toFixed(3)} m</b>`
  }

  function calcFitRange() {
    if (base.trials.value.length < 2) { calcResult.value = t('experiments.atLeastTwoTrials'); return }
    const xs = base.trials.value.map(tr => Math.sin(2 * (tr.angleDegrees * Math.PI) / 180))
    const ys = base.trials.value.map(tr => tr.rangeMeters)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = t('experiments.insufficientData'); fitResult.value = null; return }
    fitResult.value = { slope: fit.slope, intercept: fit.intercept, r2: fit.r2 }
    const v0Est = Math.sqrt(Math.abs(fit.slope) * params.g)
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `R = ${fit.slope.toFixed(5)}·sin(2θ) ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(5)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>v₀ ≈ <b>${v0Est.toFixed(2)} m/s</b>`
  }

  return {
    trials: base.trials, trialStats,
    recordTrial, removeTrial: base.removeTrial, clearTrials: base.clearTrials, exportCsv,
    undo: base.undo, redo: base.redo, canUndo: base.canUndo, canRedo: base.canRedo,
    autoLoad: base.autoLoad,
    calcResult, fitResult, calcFlightTime, calcMaxHeight, calcRange, calcFitRange,
  }
}
