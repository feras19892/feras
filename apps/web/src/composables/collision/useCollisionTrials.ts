import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { CollisionParams, CollisionState } from '../../modules/physics/experiments/collision/useCollisionPhysics'
import { computeCollisionResult } from './collisionUtils'
import { linearRegression } from '../../components/experiment/spring/linearRegression'

export interface CollisionTrial {
  id: number
  m1: number
  m2: number
  v1i: number
  v2i: number
  e: number
  v1f: number
  v2f: number
  Pi: number
  Pf: number
  KEi: number
  KEf: number
  lossPercent: number
  timestamp: string
}

const STORAGE_KEY = 'collision:trials:v1'

export function useCollisionTrials(params: CollisionParams, sim: CollisionState) {
  const { t } = useI18n()
  const trials = ref<CollisionTrial[]>([])
  const history = ref<CollisionTrial[][]>([])
  const historyIndex = ref(-1)
  const calcResult = ref('')

  function recordTrial() {
    if (!sim.collided) return
    const trial: CollisionTrial = {
      id: Date.now(),
      m1: params.m1,
      m2: params.m2,
      v1i: params.v1i,
      v2i: params.v2i,
      e: params.e,
      v1f: sim.v1f ?? 0,
      v2f: sim.v2f ?? 0,
      Pi: sim.Pi ?? 0,
      Pf: sim.Pf ?? 0,
      KEi: sim.KEi ?? 0,
      KEf: sim.KEf ?? 0,
      lossPercent: sim.lossPercent ?? 0,
      timestamp: new Date().toISOString(),
    }
    trials.value.push(trial)
    pushHistory()
    saveToStorage()
  }

  function removeTrial(id: number) {
    trials.value = trials.value.filter((t) => t.id !== id)
    pushHistory()
    saveToStorage()
  }

  function clearTrials() {
    trials.value = []
    pushHistory()
    saveToStorage()
  }

  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--
      trials.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      trials.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    }
  }

  function canUndo() { return historyIndex.value > 0 }
  function canRedo() { return historyIndex.value < history.value.length - 1 }

  function pushHistory() {
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push(JSON.parse(JSON.stringify(trials.value)))
    historyIndex.value++
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trials.value))
  }

  function autoLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        trials.value = JSON.parse(raw)
        history.value = [JSON.parse(JSON.stringify(trials.value))]
        historyIndex.value = 0
      }
    } catch { /* ignore */ }
  }

  function exportCsv() {
    const headers = 'ID,m1,m2,v1i,v2i,e,v1f,v2f,Pi,Pf,KEi,KEf,Loss%,Timestamp\n'
    const rows = trials.value
      .map(
        (t) =>
          `${t.id},${t.m1},${t.m2},${t.v1i},${t.v2i},${t.e},${t.v1f},${t.v2f},${t.Pi},${t.Pf},${t.KEi},${t.KEf},${t.lossPercent},${t.timestamp}`,
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `collision_trials_${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const trialStats = computed(() => {
    const n = trials.value.length
    if (n === 0) return { count: 0, avgV1f: 0, avgV2f: 0, avgLoss: 0, momentumDiff: 0 }
    const v1fs = trials.value.map((t) => t.v1f)
    const v2fs = trials.value.map((t) => t.v2f)
    const losses = trials.value.map((t) => t.lossPercent)
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const momDiffs = trials.value.map((t) => Math.abs(t.Pf - t.Pi))
    return {
      count: n,
      avgV1f: Number(avg(v1fs).toFixed(3)),
      avgV2f: Number(avg(v2fs).toFixed(3)),
      avgLoss: Number(avg(losses).toFixed(2)),
      momentumDiff: Number(avg(momDiffs).toFixed(4)),
    }
  })

  function calcMomentumDiff() {
    if (!trials.value.length) { calcResult.value = t('experiments.noTrialsRecorded'); return }
    const tval = trials.value[trials.value.length - 1]
    calcResult.value = `ΔP = ${(tval.Pf - tval.Pi).toFixed(4)} kg·m/s`
  }

  function calcEnergyLoss() {
    if (!trials.value.length) { calcResult.value = t('experiments.noTrialsRecorded'); return }
    const tval = trials.value[trials.value.length - 1]
    calcResult.value = `${t('experiments.energyLossLabel')} = ${tval.lossPercent}% (KEi=${tval.KEi} J, KEf=${tval.KEf} J)`
  }

  function calcFinalVelocity() {
    const result = computeCollisionResult(params)
    calcResult.value = `v₁f = ${result.v1f.toFixed(3)} m/s, v₂f = ${result.v2f.toFixed(3)} m/s`
  }

  function calcM2FromSlope() {
    const valid = trials.value.filter(t => t.e < 0.15 && Math.abs(t.v2i) < 0.15)
    if (valid.length < 2) { calcResult.value = t('experiments.needTwoInelasticTrials'); return }
    const xs = valid.map(t => t.v1f)
    const ys = valid.map(t => t.Pi)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = t('experiments.insufficientData'); return }
    const avgM1 = valid.reduce((s, t) => s + t.m1, 0) / valid.length
    const m2 = fit.slope - avgM1
    const actualM2 = valid[0].m2
    const err = Math.abs((m2 - actualM2) / actualM2) * 100
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `pᵢ = ${fit.slope.toFixed(4)}·v_f ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(4)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>slope ≈ m₁ + m₂ → m₂ = slope − m̄₁ = <b>${m2.toFixed(2)} kg</b><br>${t('experiments.errorPercent')} = <b>${err.toFixed(2)}%</b>`
  }

  return {
    trials,
    calcResult,
    trialStats,
    recordTrial,
    removeTrial,
    clearTrials,
    undo,
    redo,
    canUndo,
    canRedo,
    exportCsv,
    autoLoad,
    calcMomentumDiff,
    calcEnergyLoss,
    calcFinalVelocity,
    calcM2FromSlope,
  }
}
