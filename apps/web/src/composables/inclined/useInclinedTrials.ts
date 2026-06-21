import { ref, computed, type Ref } from 'vue'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { calculateInclinedSummary } from './inclinedUtils'
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

const SAVE_KEY = 'inclined:trials:v1'

export function useInclinedTrials(params: InclinedParams, measured: Ref<InclinedMeasured>, enableNoise: Ref<boolean> = ref(true)) {
  const trials = ref<InclinedTrial[]>([])
  let nextTrialId = 1
  const history = ref<InclinedTrial[][]>([])
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
    if (trials.value.length === 0) return { a_mean: 0, a_std: 0, t_mean: 0, t_std: 0, v_mean: 0, v_std: 0 }
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length) }
    return {
      a_mean: mean(trials.value.map(t => t.acceleration)),
      a_std: std(trials.value.map(t => t.acceleration)),
      t_mean: mean(trials.value.map(t => t.timeOfArrival)),
      t_std: std(trials.value.map(t => t.timeOfArrival)),
      v_mean: mean(trials.value.map(t => t.finalVelocity)),
      v_std: std(trials.value.map(t => t.finalVelocity)),
    }
  })

  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random(); while (v === 0) v = Math.random()
    return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev
  }

  function recordTrial() {
    if (!measured.value.timeOfArrival) return
    pushHistory()
    const noiseLevel = 0.02
    const a = enableNoise.value
      ? gaussianNoise(measured.value.acceleration!, measured.value.acceleration! * noiseLevel)
      : measured.value.acceleration!
    const t = enableNoise.value
      ? gaussianNoise(measured.value.timeOfArrival!, measured.value.timeOfArrival! * noiseLevel)
      : measured.value.timeOfArrival!
    const v = enableNoise.value
      ? gaussianNoise(measured.value.finalVelocity!, measured.value.finalVelocity! * noiseLevel)
      : measured.value.finalVelocity!

    const theoretical = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    const err = Math.abs((a - theoretical.acceleration) / theoretical.acceleration) * 100

    trials.value = [...trials.value, {
      id: nextTrialId++, thetaDeg: params.thetaDeg, length: params.length, mass: params.mass, mu: params.mu,
      acceleration: Number(a.toFixed(3)), timeOfArrival: Number(t.toFixed(3)), finalVelocity: Number(v.toFixed(2)),
      normalForce: measured.value.normalForce!, parallelForce: measured.value.parallelForce!, frictionForce: measured.value.frictionForce!,
      err: Number(err.toFixed(2)),
    }]
    autoSave()
  }

  function removeTrial(id: number) { pushHistory(); trials.value = trials.value.filter(t => t.id !== id); autoSave() }
  function clearTrials() { pushHistory(); trials.value = []; autoSave() }

  function autoSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ trials: trials.value, nextId: nextTrialId })) } catch { /* ignore */ } }
  function autoLoad() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.trials)) {
        const valid = parsed.trials.filter((t: Record<string, unknown>) => t && typeof t.thetaDeg === 'number')
        trials.value = valid
        nextTrialId = parsed.nextId ?? (valid.length > 0 ? Math.max(...valid.map((t: Record<string, unknown>) => Number(t.id))) + 1 : 1)
        history.value = [[...valid]]; historyIndex.value = 0
      }
    } catch { /* ignore */ }
  }

  function exportCsv() {
    if (!trials.value.length) return
    downloadCsv('inclined_data.csv', [
      ['#', 'theta (deg)', 'L (m)', 'm (kg)', 'mu', 'a (m/s2)', 't (s)', 'v (m/s)', 'N (N)', 'F_parallel (N)', 'f_friction (N)', 'error'],
      ...trials.value.map((t, i) => [i + 1, t.thetaDeg, t.length.toFixed(2), t.mass.toFixed(2), t.mu.toFixed(2), t.acceleration.toFixed(3), t.timeOfArrival.toFixed(3), t.finalVelocity.toFixed(2), t.normalForce.toFixed(2), t.parallelForce.toFixed(2), t.frictionForce.toFixed(2), t.err.toFixed(2) + '%']),
    ])
  }

  const calcResult = ref('اضغط على زر لعرض الحساب')
  function calcAcceleration() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    calcResult.value = `<b>المعادلة:</b> a = g(sinθ − μ·cosθ) − Fd/m<br><b>التعويض:</b> a = ${params.g}×(sin(${params.thetaDeg}°) − ${params.mu}×cos(${params.thetaDeg}°))${params.airResistance ? ' − Fd/' + params.mass : ''}<br><b>النتيجة:</b> a = <b>${summary.acceleration} m/s²</b>`
  }
  function calcTime() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    calcResult.value = `<b>المعادلة:</b> t = √(2L/a)<br><b>التعويض:</b> t = √(2×${params.length} / ${summary.acceleration})<br><b>النتيجة:</b> t = <b>${summary.timeOfArrival} s</b>`
  }
  function calcVelocity() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    calcResult.value = `<b>المعادلة:</b> v = √(2aL)<br><b>التعويض:</b> v = √(2×${summary.acceleration}×${params.length})<br><b>النتيجة:</b> v = <b>${summary.finalVelocity} m/s</b>`
  }
  function calcNormal() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
    calcResult.value = `<b>المعادلة:</b> N = m·g·cos(θ)<br><b>التعويض:</b> N = ${params.mass}×${params.g}×cos(${params.thetaDeg}°)<br><b>النتيجة:</b> N = <b>${summary.normalForce} N</b>`
  }

  return {
    trials, trialStats, recordTrial, removeTrial, clearTrials, exportCsv,
    undo, redo, canUndo, canRedo, autoLoad,
    calcResult, calcAcceleration, calcTime, calcVelocity, calcNormal,
  }
}
