import { ref, computed, type Ref } from 'vue'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
import type { PendulumParams } from '../../modules/physics/experiments/pendulum/usePendulumPhysics'

export interface PendulumTrial {
  id: number; length: number; g: number
  T: number; f: number; omega: number; gCalc: number; err: number
}

export interface PendulumMeasured {
  T: number | null; f: number | null; omega: number | null; gCalc: number | null
}

const SAVE_KEY = 'pendulum:trials:v1'

export function usePendulumTrials(params: PendulumParams, measured: Ref<PendulumMeasured>) {
  const trials = ref<PendulumTrial[]>([])
  let nextTrialId = 1
  const history = ref<PendulumTrial[][]>([])
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
    if (trials.value.length === 0) return { T_mean: 0, T_std: 0, g_mean: 0, g_std: 0 }
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return { T_mean: mean(trials.value.map(t => t.T)), T_std: std(trials.value.map(t => t.T)), g_mean: mean(trials.value.map(t => t.gCalc)), g_std: std(trials.value.map(t => t.gCalc)) }
  })

  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random(); while (v === 0) v = Math.random()
    return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev
  }

  function recordTrial() {
    if (!measured.value.T) return
    if (params.length < 0.05 || params.length > 3) { alert('طول الخيط يجب أن يكون بين 0.05 و 3 أمتار'); return }
    pushHistory()
    const noiseLevel = 0.02
    const noisyT = gaussianNoise(measured.value.T, measured.value.T * noiseLevel)
    const gCalc = (4 * Math.PI * Math.PI * params.length) / (noisyT * noisyT)
    const err = Math.abs((gCalc - params.g) / params.g) * 100
    trials.value = [...trials.value, { id: nextTrialId++, length: params.length, g: params.g, T: noisyT, f: 1 / noisyT, omega: (2 * Math.PI) / noisyT, gCalc, err }]
    autoSave()
  }

  function removeTrial(id: number) { pushHistory(); trials.value = trials.value.filter(t => t.id !== id); autoSave() }
  function clearTrials() { pushHistory(); trials.value = []; autoSave() }

  function autoSave() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ trials: trials.value, nextId: nextTrialId, calcResult: calcResult.value })) } catch { /* ignore */ }
  }
  function autoLoad() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.trials)) {
        const valid = parsed.trials.filter((t: any) => t && typeof t.length === 'number' && t.length >= 0.05 && t.length <= 3)
        trials.value = valid
        nextTrialId = parsed.nextId ?? (valid.length > 0 ? Math.max(...valid.map((t: any) => t.id)) + 1 : 1)
        if (parsed.calcResult) calcResult.value = parsed.calcResult
        history.value = [[...valid]]; historyIndex.value = 0
      }
    } catch { /* ignore */ }
  }

  function exportCsv() {
    if (!trials.value.length) return
    downloadCsv('pendulum_data.csv', [
      ['#', 'L', 'T', 'f', 'ω', 'gCalc', 'error'],
      ...trials.value.map((t, i) => [i + 1, t.length.toFixed(3), t.T.toFixed(4), t.f.toFixed(3), t.omega.toFixed(3), t.gCalc.toFixed(2), t.err.toFixed(2) + '%']),
    ])
  }

  const calcResult = ref('اضغط على زر لعرض الحساب')
  function calcG() {
    if (!measured.value.T) { calcResult.value = 'يجب قياس الدورة أولاً'; return }
    const g = (4 * Math.PI * Math.PI * params.length) / (measured.value.T * measured.value.T)
    const err = Math.abs((g - params.g) / params.g) * 100
    calcResult.value = `<b>المعادلة:</b> g = 4π²L/T²<br><b>التعويض:</b> g = 4π² × ${params.length.toFixed(3)} / (${measured.value.T.toFixed(4)})²<br><b>النتيجة:</b> g = <b>${g.toFixed(2)} m/s²</b><br><b>الخطأ:</b> ${err.toFixed(2)}%`
  }
  function calcT() {
    const T = 2 * Math.PI * Math.sqrt(params.length / params.g)
    calcResult.value = `<b>المعادلة:</b> T = 2π√(L/g)<br><b>التعويض:</b> T = 2π√(${params.length.toFixed(3)} / ${params.g.toFixed(2)})<br><b>النتيجة:</b> T = <b>${T.toFixed(4)} s</b>`
  }
  function calcL() {
    if (!measured.value.T) { calcResult.value = 'يجب قياس الدورة أولاً'; return }
    const L = (measured.value.T * measured.value.T * params.g) / (4 * Math.PI * Math.PI)
    calcResult.value = `<b>المعادلة:</b> L = (T² × g) / (4π²)<br><b>التعويض:</b> L = (${measured.value.T.toFixed(4)}² × ${params.g.toFixed(2)}) / (4π²)<br><b>النتيجة:</b> L = <b>${L.toFixed(3)} m</b>`
  }
  function calcFitG() {
    if (trials.value.length < 2) { calcResult.value = 'يجب قياستان على الأقل'; return }
    const xs = trials.value.map(t => t.length)
    const ys = trials.value.map(t => t.T * t.T)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = 'بيانات غير كافية'; return }
    const g = (4 * Math.PI * Math.PI) / fit.slope
    const err = Math.abs((g - params.g) / params.g) * 100
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `T² = ${fit.slope.toFixed(5)}·L ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(5)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>g = 4π² / slope = <b>${g.toFixed(2)} m/s²</b><br>الخطأ = <b>${err.toFixed(2)}%</b>`
  }

  return { trials, trialStats, recordTrial, removeTrial, clearTrials, exportCsv, undo, redo, canUndo, canRedo, autoLoad, calcResult, calcG, calcT, calcL, calcFitG }
}
