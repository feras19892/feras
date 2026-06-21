import { ref } from 'vue'
import type { ThinLensTrial, ThinLensParams } from './useThinLensExperiment'

export interface TrialState {
  trials: ThinLensTrial[]
  nextId: number
}

const SAVE_KEY = 'thinlens:trials:v1'

export function useThinLensTrials(
  params: { value: ThinLensParams },
  imageDistance: { value: number | null },
  imageHeight: { value: number | null },
  magnification: { value: number | null }
) {
  const trials = ref<ThinLensTrial[]>([])
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
    pushState()
    const { lensType, focalLength, objectDistance, objectHeight } = params.value
    const di = imageDistance.value ?? 0
    const hi = imageHeight.value ?? 0
    const m = magnification.value ?? 0
    trials.value.push({
      id: nextId.value++,
      lensType,
      focalLength,
      objectDistance,
      objectHeight,
      imageDistance: di,
      imageHeight: hi,
      magnification: m,
      invDo: 1 / objectDistance,
      invDi: di !== 0 ? 1 / di : 0,
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
    const headers = ['Trial', 'Type', 'f(cm)', 'do(cm)', 'ho(cm)', 'di(cm)', 'hi(cm)', 'm', '1/do', '1/di']
    const rows = trials.value.map(
      (t) => `${t.id},${t.lensType},${t.focalLength.toFixed(1)},${t.objectDistance.toFixed(1)},${t.objectHeight.toFixed(1)},${t.imageDistance.toFixed(1)},${t.imageHeight.toFixed(1)},${t.magnification.toFixed(3)},${t.invDo.toFixed(4)},${t.invDi.toFixed(4)}`
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
