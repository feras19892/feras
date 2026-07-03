import { ref } from 'vue'

export interface CalorimetryTrial {
  id: number
  mWater: number
  tWater: number
  mMetal: number
  tMetal: number
  tf: number
  cMetal: number
}

export interface TrialState {
  trials: CalorimetryTrial[]
  nextId: number
}

const SAVE_KEY = 'calorimetry:trials:v1'

export function useCalorimetryTrials(
  params: { value: { mWater: number; tWater: number; mMetal: number; tMetal: number; tf: number; cMetal: number } }
) {
  const trials = ref<CalorimetryTrial[]>([])
  const nextId = ref(1)
  const undoStack = ref<TrialState[]>([])
  const redoStack = ref<TrialState[]>([])

  function autoSave() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ trials: trials.value, nextId: nextId.value, undoStack: undoStack.value.slice(-10), redoStack: redoStack.value.slice(-10) })) } catch { /* ignore */ }
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
    const { mWater, tWater, mMetal, tMetal, tf, cMetal } = params.value
    trials.value.push({ id: nextId.value++, mWater, tWater, mMetal, tMetal, tf, cMetal })
  }
  function undo() {
    if (undoStack.value.length === 0) return
    const current = { trials: [...trials.value], nextId: nextId.value }
    redoStack.value.push(current)
    const prev = undoStack.value.pop()!
    trials.value = prev.trials; nextId.value = prev.nextId
  }
  function redo() {
    if (redoStack.value.length === 0) return
    const current = { trials: [...trials.value], nextId: nextId.value }
    undoStack.value.push(current)
    const next = redoStack.value.pop()!
    trials.value = next.trials; nextId.value = next.nextId
  }
  function canUndo() { return undoStack.value.length > 0 }
  function canRedo() { return redoStack.value.length > 0 }
  function removeTrial(id: number) { pushState(); trials.value = trials.value.filter(t => t.id !== id); autoSave() }
  function clearTrials() { pushState(); trials.value = []; nextId.value = 1; autoSave() }
  function exportCsv(): string {
    const headers = ['Trial','mWater(kg)','tWater(C)','mMetal(kg)','tMetal(C)','tf(C)','cMetal(J/kgK)']
    const rows = trials.value.map(t => `${t.id},${t.mWater.toFixed(3)},${t.tWater.toFixed(1)},${t.mMetal.toFixed(3)},${t.tMetal.toFixed(1)},${t.tf.toFixed(1)},${t.cMetal.toFixed(0)}`)
    return [headers.join(','), ...rows].join('\n')
  }
  return { trials, recordTrial, undo, redo, canUndo, canRedo, removeTrial, clearTrials, exportCsv, autoLoad }
}
