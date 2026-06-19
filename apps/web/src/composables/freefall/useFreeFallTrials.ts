import { ref, computed, type Ref } from 'vue'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
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

const SAVE_KEY = 'freefall:trials:v1'

export function useFreeFallTrials(params: FreeFallParams, measured: Ref<FreeFallMeasured>, enableNoise: Ref<boolean> = ref(true)) {
  const trials = ref<FreeFallTrial[]>([])
  let nextTrialId = 1
  const history = ref<FreeFallTrial[][]>([])
  const historyIndex = ref(-1)

  function pushHistory() {
    if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push([...trials.value])
    historyIndex.value++
    if (history.value.length > 20) { history.value.shift(); historyIndex.value-- }
  }
  function undo() { if (historyIndex.value > 0) { historyIndex.value--; trials.value = [...history.value[historyIndex.value]]; nextTrialId = trials.value.length > 0 ? Math.max(...trials.value.map(t => t.id)) + 1 : 1 } }
  function redo() { if (historyIndex.value < history.value.length - 1) { historyIndex.value++; trials.value = [...history.value[historyIndex.value]]; nextTrialId = trials.value.length > 0 ? Math.max(...trials.value.map(t => t.id)) + 1 : 1 } }
  function canUndo() { return historyIndex.value > 0 }
  function canRedo() { return historyIndex.value < history.value.length - 1 }

  const trialStats = computed(() => {
    if (trials.value.length === 0) return { time_mean: 0, time_std: 0, g_mean: 0, g_std: 0 }
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return { time_mean: mean(trials.value.map(t => t.timeSec)), time_std: std(trials.value.map(t => t.timeSec)), g_mean: mean(trials.value.map(t => t.gCalc)), g_std: std(trials.value.map(t => t.gCalc)) }
  })

  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random(); while (v === 0) v = Math.random()
    return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev
  }

  function recordTrial() {
    if (!measured.value.flightTime) return
    pushHistory()
    const noiseLevel = 0.02
    const timeToRecord = enableNoise.value
      ? gaussianNoise(measured.value.flightTime, measured.value.flightTime * noiseLevel)
      : measured.value.flightTime
    const gCalc = (2 * params.h) / (timeToRecord * timeToRecord)
    const err = Math.abs((gCalc - params.g) / params.g) * 100
    trials.value = [...trials.value, {
      id: nextTrialId++, heightMeters: params.h, timeSec: timeToRecord,
      timeSquaredSec2: timeToRecord * timeToRecord,
      impactVelocityMs: params.g * timeToRecord,
      gCalc, err,
    }]
    autoSave()
  }

  function removeTrial(id: number) { pushHistory(); trials.value = trials.value.filter(t => t.id !== id); autoSave() }
  function clearTrials() { pushHistory(); trials.value = []; autoSave() }

  function autoSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ trials: trials.value, nextId: nextTrialId, calcResult: calcResult.value })) } catch { /* ignore */ } }
  function autoLoad() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.trials)) {
        const valid = parsed.trials.filter((t: any) => t && typeof t.heightMeters === 'number' && t.heightMeters > 0)
        trials.value = valid
        nextTrialId = parsed.nextId ?? (valid.length > 0 ? Math.max(...valid.map((t: any) => t.id)) + 1 : 1)
        if (parsed.calcResult) calcResult.value = parsed.calcResult
        history.value = [[...valid]]; historyIndex.value = 0
      }
    } catch { /* ignore */ }
  }

  function exportCsv() {
    if (!trials.value.length) return
    downloadCsv('freefall_data.csv', [
      ['#', 'h (m)', 't (s)', 't² (s²)', 'v_impact (m/s)', 'g_calc (m/s²)', 'error'],
      ...trials.value.map((t, i) => [i + 1, t.heightMeters.toFixed(2), t.timeSec.toFixed(3), t.timeSquaredSec2.toFixed(4), t.impactVelocityMs.toFixed(2), t.gCalc.toFixed(2), t.err.toFixed(2) + '%']),
    ])
  }

  const calcResult = ref('اضغط على زر لعرض الحساب')
  function calcG() {
    if (!measured.value.flightTime) { calcResult.value = 'يجب قياس الزمن أولاً'; return }
    const g = (2 * params.h) / (measured.value.flightTime * measured.value.flightTime)
    const err = Math.abs((g - params.g) / params.g) * 100
    calcResult.value = `<b>المعادلة:</b> g = 2h/t²<br><b>التعويض:</b> g = 2×${params.h.toFixed(2)} / (${measured.value.flightTime.toFixed(4)})²<br><b>النتيجة:</b> g = <b>${g.toFixed(2)} m/s²</b><br><b>الخطأ:</b> ${err.toFixed(2)}%`
  }
  function calcT() {
    const t = Math.sqrt((2 * params.h) / params.g)
    calcResult.value = `<b>المعادلة:</b> t = √(2h/g)<br><b>التعويض:</b> t = √(2×${params.h.toFixed(2)} / ${params.g.toFixed(2)})<br><b>النتيجة:</b> t = <b>${t.toFixed(4)} s</b>`
  }
  function calcV() {
    const v = Math.sqrt(2 * params.g * params.h)
    calcResult.value = `<b>المعادلة:</b> v = √(2gh)<br><b>التعويض:</b> v = √(2×${params.g.toFixed(2)}×${params.h.toFixed(2)})<br><b>النتيجة:</b> v = <b>${v.toFixed(2)} m/s</b>`
  }
  function calcFitG() {
    if (trials.value.length < 2) { calcResult.value = 'يجب قياستان على الأقل'; return }
    const xs = trials.value.map(t => t.timeSquaredSec2)
    const ys = trials.value.map(t => t.heightMeters)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = 'بيانات غير كافية'; return }
    const g = 2 * fit.slope
    const err = Math.abs((g - params.g) / params.g) * 100
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `h = ${fit.slope.toFixed(5)}·t² ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(5)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>g = 2×slope = <b>${g.toFixed(2)} m/s²</b><br>الخطأ = <b>${err.toFixed(2)}%</b>`
  }

  return {
    trials, trialStats, recordTrial, removeTrial, clearTrials, exportCsv,
    undo, redo, canUndo, canRedo, autoLoad,
    calcResult, calcG, calcT, calcV, calcFitG,
  }
}
