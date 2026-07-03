import { ref } from 'vue'

export interface DiffractionTrial {
  id: number
  mode: 'single' | 'grating'
  slitWidth: number
  linesPerMm: number
  screenDistance: number
  wavelength: number
  centralWidth: number
  darkFringe1: number
  firstOrderAngle: number
  firstOrderY: number
}

export interface TrialState {
  trials: DiffractionTrial[]
  nextId: number
}

const SAVE_KEY = 'diffraction:trials:v1'

export function useDiffractionTrials(
  params: { value: { slitWidth: number; linesPerMm: number; screenDistance: number; wavelength: number } },
  mode: { value: 'single' | 'grating' },
  centralWidth: { value: number },
  darkFringe1: { value: number },
  firstOrderAngle: { value: number },
  firstOrderY: { value: number }
) {
  const trials = ref<DiffractionTrial[]>([])
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
    const { slitWidth, linesPerMm, screenDistance, wavelength } = params.value
    trials.value.push({
      id: nextId.value++,
      mode: mode.value,
      slitWidth,
      linesPerMm,
      screenDistance,
      wavelength,
      centralWidth: centralWidth.value,
      darkFringe1: darkFringe1.value,
      firstOrderAngle: firstOrderAngle.value,
      firstOrderY: firstOrderY.value,
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

  function exportCsv(): string {
    const headers = ['Trial', 'Mode', 'a(mm)', 'N(lines/mm)', 'D(m)', 'lambda(nm)', 'w(mm)', 'y1(mm)', 'theta1(deg)', 'y1_grating(mm)']
    const rows = trials.value.map(t =>
      `${t.id},${t.mode},${t.slitWidth.toFixed(2)},${t.linesPerMm},${t.screenDistance.toFixed(2)},${t.wavelength},${t.centralWidth.toFixed(2)},${t.darkFringe1.toFixed(2)},${t.firstOrderAngle.toFixed(3)},${t.firstOrderY.toFixed(3)}`
    )
    return [headers.join(','), ...rows].join('\n')
  }

  return { trials, recordTrial, undo, redo, canUndo, canRedo, removeTrial, clearTrials, exportCsv, autoLoad }
}
