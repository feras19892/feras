import { ref } from 'vue'

export interface PrismTrial {
  id: number
  prismAngle: number
  angleIncidence: number
  wavelength: number
  angleEmergence: number | null
  deviation: number | null
  n: number
}

export interface TrialState {
  trials: PrismTrial[]
  nextId: number
}

const SAVE_KEY = 'prism:trials:v1'

export function usePrismTrials(
  params: { value: { prismAngle: number; angleIncidence: number; wavelength: number } },
  angleEmergence: { value: number | null },
  deviation: { value: number | null },
  nValue: { value: number }
) {
  const trials = ref<PrismTrial[]>([])
  const nextId = ref(1)
  const undoStack = ref<TrialState[]>([])
  const redoStack = ref<TrialState[]>([])

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
    const ae = angleEmergence.value
    const dev = deviation.value
    if (ae === null || dev === null) return
    pushState()
    const { prismAngle, angleIncidence, wavelength } = params.value
    trials.value.push({
      id: nextId.value++,
      prismAngle,
      angleIncidence,
      wavelength,
      angleEmergence: ae,
      deviation: dev,
      n: nValue.value,
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
    trials.value = trials.value.filter(t => t.id !== id)
    autoSave()
  }

  function clearTrials() {
    pushState()
    trials.value = []
    nextId.value = 1
    autoSave()
  }

  function fmt(v: number | null, digits = 1): string {
    return v !== null ? v.toFixed(digits) : 'TIR'
  }

  function exportCsv(): string {
    const headers = ['Trial', 'A(deg)', 'theta_i(deg)', 'lambda(nm)', 'theta_e(deg)', 'delta(deg)', 'n']
    const rows = trials.value.map(t =>
      `${t.id},${t.prismAngle.toFixed(1)},${t.angleIncidence.toFixed(1)},${t.wavelength},${fmt(t.angleEmergence)},${fmt(t.deviation)},${t.n.toFixed(3)}`
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
