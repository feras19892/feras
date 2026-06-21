import { ref } from 'vue'
import type { LightRayTrial, LightRayParams } from './useLightRayExperiment'

export interface TrialState {
  trials: LightRayTrial[]
  nextId: number
}

const SAVE_KEY = 'lightray:trials:v1'

export function useLightRayTrials(params: { value: LightRayParams }, angleRefraction: { value: number | null }, angleReflection: { value: number }) {
  const trials = ref<LightRayTrial[]>([])
  const nextId = ref(1)

  const undoStack = ref<TrialState[]>([])
  const redoStack = ref<TrialState[]>([])

  // Auto-save to localStorage
  function autoSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        trials: trials.value,
        nextId: nextId.value,
        undoStack: undoStack.value.slice(-10),
        redoStack: redoStack.value.slice(-10),
      }))
    } catch { /* ignore */ }
  }

  function autoLoad() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.trials)) {
        trials.value = parsed.trials
        nextId.value = typeof parsed.nextId === 'number' ? parsed.nextId : (trials.value.length > 0 ? Math.max(...trials.value.map(t => t.id)) + 1 : 1)
        if (Array.isArray(parsed.undoStack)) undoStack.value = parsed.undoStack
        if (Array.isArray(parsed.redoStack)) redoStack.value = parsed.redoStack
      }
    } catch { /* ignore */ }
  }

  function pushState() {
    undoStack.value.push({ trials: [...trials.value], nextId: nextId.value })
    redoStack.value = []
    if (undoStack.value.length > 50) undoStack.value.shift()
    autoSave()
  }

  function recordTrial() {
    pushState()
    const { angleIncidence, n1, n2 } = params.value
    const thetaT = angleRefraction.value ?? 0
    const toRad = (deg: number) => (deg * Math.PI) / 180
    trials.value.push({
      id: nextId.value++,
      angleIncidence,
      angleReflection: angleReflection.value,
      angleRefraction: thetaT,
      sinI: Math.sin(toRad(angleIncidence)),
      sinT: Math.sin(toRad(thetaT)),
      n1,
      n2,
    })
  }

  function undo() {
    if (undoStack.value.length === 0) return
    const current = { trials: [...trials.value], nextId: nextId.value }
    redoStack.value.push(current)
    const prev = undoStack.value.pop()!
    trials.value = prev.trials
    nextId.value = prev.nextId
  }

  function redo() {
    if (redoStack.value.length === 0) return
    const current = { trials: [...trials.value], nextId: nextId.value }
    undoStack.value.push(current)
    const next = redoStack.value.pop()!
    trials.value = next.trials
    nextId.value = next.nextId
  }

  function canUndo() { return undoStack.value.length > 0 }
  function canRedo() { return redoStack.value.length > 0 }

  function removeTrial(id: number) {
    pushState()
    trials.value = trials.value.filter((t) => t.id !== id)
    autoSave()
  }

  function clearTrials() {
    pushState()
    trials.value = []
    nextId.value = 1
    autoSave()
  }

  function exportCsv(): string {
    const headers = ['Trial', 'theta_i(deg)', 'theta_r(deg)', 'theta_t(deg)', 'sin_i', 'sin_t', 'n1', 'n2']
    const rows = trials.value.map(
      (t) => `${t.id},${t.angleIncidence.toFixed(1)},${t.angleReflection.toFixed(1)},${t.angleRefraction.toFixed(1)},${t.sinI.toFixed(4)},${t.sinT.toFixed(4)},${t.n1},${t.n2}`
    )
    return [headers.join(','), ...rows].join('\n')
  }

  return {
    trials,
    recordTrial,
    undo,
    redo,
    canUndo,
    canRedo,
    removeTrial,
    clearTrials,
    exportCsv,
    autoLoad,
  }
}
