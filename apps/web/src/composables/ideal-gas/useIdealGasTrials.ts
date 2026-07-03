import { ref } from 'vue'

export interface IdealGasTrial {
  id: number
  n: number
  T: number
  V: number
  P: number
}

export interface TrialState {
  trials: IdealGasTrial[]
  nextId: number
}

const SAVE_KEY = 'idealgas:trials:v1'

export function useIdealGasTrials(
  params: { value: { n: number; T: number; V: number } },
  pressure: { value: number }
) {
  const trials = ref<IdealGasTrial[]>([])
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
    const { n, T, V } = params.value
    trials.value.push({ id: nextId.value++, n, T, V, P: pressure.value })
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
    const headers = ['Trial', 'n(mol)', 'T(K)', 'V(m3)', 'P(Pa)']
    const rows = trials.value.map(t => `${t.id},${t.n.toFixed(3)},${t.T.toFixed(1)},${t.V.toFixed(5)},${t.P.toFixed(1)}`)
    return [headers.join(','), ...rows].join('\n')
  }
  return { trials, recordTrial, undo, redo, canUndo, canRedo, removeTrial, clearTrials, exportCsv, autoLoad }
}
