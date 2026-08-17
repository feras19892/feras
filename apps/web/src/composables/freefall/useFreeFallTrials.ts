import { ref, computed, type Ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'
import type { FreeFallParams } from '../../modules/physics/experiments/freefall/useFreeFallPhysics'

export interface FreeFallTrial {
  id: number
  heightMeters: number
  timeSec: number
  timeSquaredSec2: number
  impactVelocityMs: number
  gCalc: number
  err: number
}

export interface FreeFallMeasured {
  flightTime: number | null
  impactVelocity: number | null
}

export function useFreeFallTrials(params: FreeFallParams, measured: Ref<FreeFallMeasured>, enableNoise: Ref<boolean>) {
  const { t } = useI18n()
  const calcResult = ref(t('experiments.clickBtnShowCalc'))

  const base = useExperimentTrials<FreeFallTrial>({
    storageKey: 'freefall:trials:v1',
    getExtraData: () => calcResult.value,
    setExtraData: (data) => { if (typeof data === 'string') calcResult.value = data },
  })

  const trialStats = computed(() => {
    if (base.trials.value.length === 0) return { time_mean: 0, time_std: 0, g_mean: 0, g_std: 0 }
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return { time_mean: mean(base.trials.value.map(tr => tr.timeSec)), time_std: std(base.trials.value.map(tr => tr.timeSec)), g_mean: mean(base.trials.value.map(tr => tr.gCalc)), g_std: std(base.trials.value.map(tr => tr.gCalc)) }
  })

  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random(); while (v === 0) v = Math.random()
    return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev
  }

  function recordTrial() {
    if (!measured.value.flightTime) return
    const noiseLevel = 0.02
    const timeToRecord = enableNoise.value
      ? gaussianNoise(measured.value.flightTime, measured.value.flightTime * noiseLevel)
      : measured.value.flightTime
    const gCalc = (2 * params.h) / (timeToRecord * timeToRecord)
    const err = Math.abs((gCalc - params.g) / params.g) * 100
    base.addTrial({
      heightMeters: params.h, timeSec: timeToRecord,
      timeSquaredSec2: timeToRecord * timeToRecord,
      impactVelocityMs: params.g * timeToRecord, gCalc, err,
    })
  }

  function exportCsv() {
    if (!base.trials.value.length) return
    downloadCsv('freefall_data.csv', [
      ['#', 'h (m)', 't (s)', 't² (s²)', 'v_impact (m/s)', 'g_calc (m/s²)', 'error'],
      ...base.trials.value.map((tr, i) => [i + 1, tr.heightMeters.toFixed(2), tr.timeSec.toFixed(3), tr.timeSquaredSec2.toFixed(4), tr.impactVelocityMs.toFixed(2), tr.gCalc.toFixed(2), tr.err.toFixed(2) + '%']),
    ])
  }

  function calcG() {
    if (!measured.value.flightTime) { calcResult.value = t('experiments.measureTimeFirst'); return }
    const g = (2 * params.h) / (measured.value.flightTime * measured.value.flightTime)
    const err = Math.abs((g - params.g) / params.g) * 100
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> g = 2h/t²<br><b>${t('experiments.substitutionLabel')}:</b> g = 2×${params.h.toFixed(2)} / (${measured.value.flightTime.toFixed(4)})²<br><b>${t('experiments.resultLabel')}:</b> g = <b>${g.toFixed(2)} m/s²</b><br><b>${t('experiments.errorPercent')}:</b> ${err.toFixed(2)}%`
  }
  function calcT() {
    const tVal = Math.sqrt((2 * params.h) / params.g)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> t = √(2h/g)<br><b>${t('experiments.substitutionLabel')}:</b> t = √(2×${params.h.toFixed(2)} / ${params.g.toFixed(2)})<br><b>${t('experiments.resultLabel')}:</b> t = <b>${tVal.toFixed(4)} s</b>`
  }
  function calcV() {
    const v = Math.sqrt(2 * params.g * params.h)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> v = √(2gh)<br><b>${t('experiments.substitutionLabel')}:</b> v = √(2×${params.g.toFixed(2)}×${params.h.toFixed(2)})<br><b>${t('experiments.resultLabel')}:</b> v = <b>${v.toFixed(2)} m/s</b>`
  }
  function calcFitG() {
    if (base.trials.value.length < 2) { calcResult.value = t('experiments.atLeastTwoTrials'); return }
    const xs = base.trials.value.map(tr => tr.timeSquaredSec2)
    const ys = base.trials.value.map(tr => tr.heightMeters)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = t('experiments.insufficientData'); return }
    const g = 2 * fit.slope
    const err = Math.abs((g - params.g) / params.g) * 100
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `h = ${fit.slope.toFixed(5)}·t² ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(5)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>g = 2×slope = <b>${g.toFixed(2)} m/s²</b><br>${t('experiments.errorPercent')} = <b>${err.toFixed(2)}%</b>`
  }

  return {
    trials: base.trials, trialStats, recordTrial, removeTrial: base.removeTrial, clearTrials: base.clearTrials, exportCsv,
    undo: base.undo, redo: base.redo, canUndo: base.canUndo, canRedo: base.canRedo, autoLoad: base.autoLoad,
    calcResult, calcG, calcT, calcV, calcFitG,
  }
}
