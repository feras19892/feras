import { ref, computed } from 'vue'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import type { LeverParams } from '../../modules/physics/experiments/lever/useLeverPhysics'
import type { LeverState } from '../../modules/physics/experiments/lever/useLeverPhysics'
import type { LeverBall, LeverForce } from './leverUtils'

export interface LeverTrial {
  id: number
  trialNo: number
  netTorque: number
  tiltDeg: number
  isBalanced: boolean
  balls: Pick<LeverBall, 'mass' | 'x'>[]
  forces: Pick<LeverForce, 'force' | 'x'>[]
  unknownMass?: number
}

const SAVE_KEY = 'lever:trials:v4'

export function useLeverTrials(_params: LeverParams, sim: LeverState) {
  const trials = ref<LeverTrial[]>([])
  let nextTrialId = 1

  const history = ref<LeverTrial[][]>([])
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
    if (trials.value.length === 0) return { count: 0, avgTorque: 0, maxTilt: 0, balanceCount: 0 }
    const torques = trials.value.map(t => t.netTorque)
    const tilts = trials.value.map(t => Math.abs(t.tiltDeg))
    const balanceCount = trials.value.filter(t => t.isBalanced).length
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    return {
      count: trials.value.length,
      avgTorque: mean(torques),
      maxTilt: Math.max(...tilts),
      balanceCount,
    }
  })

  function recordTrial(unknownMass?: number) {
    const t: LeverTrial = {
      id: nextTrialId++,
      trialNo: trials.value.length + 1,
      netTorque: sim.netTorque,
      tiltDeg: sim.tiltDeg,
      isBalanced: sim.isBalanced,
      balls: sim.balls.map(b => ({ mass: b.mass, x: b.x })),
      forces: sim.forces.map(f => ({ force: f.force, x: f.x })),
      unknownMass,
    }
    pushHistory()
    trials.value.push(t)
    autoSave()
  }

  function removeTrial(id: number) {
    pushHistory()
    trials.value = trials.value.filter(t => t.id !== id)
    autoSave()
  }

  function clearTrials() {
    if (!confirm('هل أنت متأكد من مسح جميع القراءات؟')) return
    pushHistory()
    trials.value = []
    nextTrialId = 1
    autoSave()
  }

  function exportCsv() {
    if (trials.value.length === 0) { alert('لا توجد قراءات'); return }
    const rows: (string | number)[][] = [
      ['trialNo', 'massLeft', 'massRight', 'forceLeft', 'forceRight', 'xLeft', 'xRight', 'netTorque', 'tiltDeg', 'isBalanced'],
    ]
    trials.value.forEach(t => {
      const leftB = t.balls.filter(b => b.x < 0)
      const rightB = t.balls.filter(b => b.x > 0)
      const leftF = t.forces.filter(f => f.x < 0)
      const rightF = t.forces.filter(f => f.x > 0)
      rows.push([
        t.trialNo,
        leftB.reduce((s, b) => s + b.mass, 0),
        rightB.reduce((s, b) => s + b.mass, 0),
        leftF.reduce((s, f) => s + f.force, 0),
        rightF.reduce((s, f) => s + f.force, 0),
        leftB.length > 0 ? Math.min(...leftB.map(b => b.x)) : 0,
        rightB.length > 0 ? Math.max(...rightB.map(b => b.x)) : 0,
        t.netTorque.toFixed(3),
        t.tiltDeg.toFixed(2),
        t.isBalanced ? 'نعم' : 'لا',
      ])
    })
    downloadCsv('lever_trials.csv', rows)
  }

  function autoSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(trials.value))
    } catch { /* ignore */ }
  }

  function autoLoad() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          trials.value = parsed.filter((t: Record<string, unknown>) => t && typeof t.id === 'number')
          nextTrialId = trials.value.length > 0 ? Math.max(...trials.value.map(t => t.id)) + 1 : 1
        }
      }
    } catch { /* ignore */ }
  }

  return {
    trials,
    trialStats,
    recordTrial,
    removeTrial,
    clearTrials,
    exportCsv,
    undo,
    redo,
    canUndo,
    canRedo,
    autoLoad,
  }
}
