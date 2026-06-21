import { ref, computed, type Ref } from 'vue'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
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
  const trials = ref<ProjectileTrial[]>([])
  let nextTrialId = 1

  const history = ref<ProjectileTrial[][]>([])
  const historyIndex = ref(-1)

  function pushHistory() {
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push([...trials.value])
    historyIndex.value++
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
    if (trials.value.length === 0) return { range_mean: 0, range_std: 0, flightTime_mean: 0, flightTime_std: 0 }
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return {
      range_mean: mean(trials.value.map(t => t.rangeMeters)),
      range_std: std(trials.value.map(t => t.rangeMeters)),
      flightTime_mean: mean(trials.value.map(t => t.flightTimeSec)),
      flightTime_std: std(trials.value.map(t => t.flightTimeSec)),
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
    pushHistory()
    const noiseLevel = 0.02
    const noisyRange = gaussianNoise(measured.value.range, measured.value.range * noiseLevel)
    const noisyTime = gaussianNoise(measured.value.flightTime ?? 0, (measured.value.flightTime ?? 0) * noiseLevel)
    const noisyHeight = gaussianNoise(measured.value.maxHeight ?? 0, (measured.value.maxHeight ?? 0) * noiseLevel)
    const err = Math.abs((noisyRange - measured.value.range) / measured.value.range) * 100
    trials.value = [...trials.value, {
      id: nextTrialId++, angleDegrees: params.angleDeg, initialVelocity: params.v0,
      flightTimeSec: noisyTime, maxHeightMeters: noisyHeight, rangeMeters: noisyRange, err,
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

  function autoSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ trials: trials.value, nextId: nextTrialId, calcResult: calcResult.value }))
    } catch { /* ignore */ }
  }

  function autoLoad() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.trials)) {
        const valid = parsed.trials.filter((t: Record<string, unknown>) => t && typeof t.angleDegrees === 'number' && t.angleDegrees >= 0 && t.angleDegrees <= 90)
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
    downloadCsv('projectile_data.csv', [
      ['#', 'angle', 'v0', 'flightTime', 'maxHeight', 'range', 'error'],
      ...trials.value.map((t, i) => [
        i + 1, t.angleDegrees.toFixed(1), t.initialVelocity.toFixed(2),
        t.flightTimeSec.toFixed(3), t.maxHeightMeters.toFixed(3), t.rangeMeters.toFixed(3),
        t.err.toFixed(2) + '%',
      ]),
    ])
  }

  const calcResult = ref('اضغط على زر لعرض الحساب')
  const fitResult = ref<{ slope: number; intercept: number } | null>(null)

  function calcFlightTime() {
    const rad = (params.angleDeg * Math.PI) / 180
    const t = (2 * params.v0 * Math.sin(rad)) / params.g
    calcResult.value = `<b>المعادلة:</b> t = 2v₀sin(θ) / g<br><b>التعويض:</b> t = 2×${params.v0}×sin(${params.angleDeg}°) / ${params.g}<br><b>النتيجة:</b> t = <b>${t.toFixed(3)} s</b>`
  }

  function calcMaxHeight() {
    const rad = (params.angleDeg * Math.PI) / 180
    const h = (Math.pow(params.v0 * Math.sin(rad), 2)) / (2 * params.g)
    calcResult.value = `<b>المعادلة:</b> H = (v₀sinθ)² / 2g<br><b>التعويض:</b> H = (${params.v0}×sin(${params.angleDeg}°))² / (2×${params.g})<br><b>النتيجة:</b> H = <b>${h.toFixed(3)} m</b>`
  }

  function calcRange() {
    const rad = (params.angleDeg * Math.PI) / 180
    const r = (Math.pow(params.v0, 2) * Math.sin(2 * rad)) / params.g
    calcResult.value = `<b>المعادلة:</b> R = v₀²sin(2θ) / g<br><b>التعويض:</b> R = ${params.v0}²×sin(${2 * params.angleDeg}°) / ${params.g}<br><b>النتيجة:</b> R = <b>${r.toFixed(3)} m</b>`
  }

  function calcFitRange() {
    if (trials.value.length < 2) { calcResult.value = 'يجب قياستان على الأقل'; return }
    const xs = trials.value.map(t => Math.sin(2 * (t.angleDegrees * Math.PI) / 180))
    const ys = trials.value.map(t => t.rangeMeters)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = 'بيانات غير كافية'; fitResult.value = null; return }
    fitResult.value = { slope: fit.slope, intercept: fit.intercept }
    const v0Est = Math.sqrt(Math.abs(fit.slope) * params.g)
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `R = ${fit.slope.toFixed(5)}·sin(2θ) ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(5)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>v₀ ≈ <b>${v0Est.toFixed(2)} m/s</b>`
  }

  return {
    trials, trialStats,
    recordTrial, removeTrial, clearTrials, exportCsv,
    undo, redo, canUndo, canRedo,
    autoLoad,
    calcResult, fitResult, calcFlightTime, calcMaxHeight, calcRange, calcFitRange,
  }
}
