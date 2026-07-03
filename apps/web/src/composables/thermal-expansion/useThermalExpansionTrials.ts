import { ref } from 'vue'

export interface ThermalExpansionTrial {
  id: number
  material: string
  L0: number
  t0: number
  t1: number
  deltaL: number
  alpha: number
}

export interface TrialState {
  trials: ThermalExpansionTrial[]
  nextId: number
}

const SAVE_KEY = 'thermal-expansion:trials:v1'

export function useThermalExpansionTrials(
  params: { value: { material: string; L0: number; t0: number; t1: number; deltaL: number; alpha: number } }
) {
  const trials = ref<ThermalExpansionTrial[]>([])
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
        nextId.value = typeof parsed.nextId === 'number' ? parsed.nextId : 1
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
    const { material, L0, t0, t1, deltaL, alpha } = params.value
    trials.value.push({ id: nextId.value++, material, L0, t0, t1, deltaL, alpha })
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
    const headers = ['Trial','Material','L0(m)','t0(C)','t1(C)','deltaL(m)','alpha(×10⁻⁶/K)']
    const rows = trials.value.map(t => `${t.id},${t.material},${t.L0.toFixed(3)},${t.t0.toFixed(1)},${t.t1.toFixed(1)},${t.deltaL.toFixed(6)},${t.alpha.toFixed(2)}`)
    return [headers.join(','), ...rows].join('\n')
  }
  return { trials, recordTrial, undo, redo, canUndo, canRedo, removeTrial, clearTrials, exportCsv, autoLoad }
}
