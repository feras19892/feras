import { ref } from 'vue'

export interface BiotSavartTrial {
  id: number
  I: number
  r: number
  B: number
  shape: string
}

export function useBiotSavartTrials(
  paramsGetter: { get value(): { I: number; r: number; B: number; shape: string } },
) {
  const trials = ref<BiotSavartTrial[]>([])
  const history = ref<BiotSavartTrial[][]>([])
  const historyIndex = ref(-1)
  let nextId = 1

  function snapshot() {
    if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push([...trials.value])
    historyIndex.value++
  }

  function recordTrial() {
    const p = paramsGetter.value
    const t: BiotSavartTrial = { id: nextId++, I: p.I, r: p.r, B: p.B, shape: p.shape }
    snapshot()
    trials.value.push(t)
    save()
  }
  function removeTrial(id: number) { snapshot(); trials.value = trials.value.filter(t => t.id !== id); save() }
  function clearTrials() { snapshot(); trials.value = []; nextId = 1; save() }

  function undo() { if (canUndo()) { historyIndex.value--; trials.value = [...history.value[historyIndex.value]] } }
  function redo() { if (canRedo()) { historyIndex.value++; trials.value = [...history.value[historyIndex.value]] } }
  function canUndo() { return historyIndex.value > 0 }
  function canRedo() { return historyIndex.value < history.value.length - 1 }

  const STORAGE_KEY = 'biotsavart_trials_v1'
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(trials.value)) }
  function autoLoad() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const arr = JSON.parse(raw) as BiotSavartTrial[]
      trials.value = arr
      nextId = arr.length ? Math.max(...arr.map(t => t.id)) + 1 : 1
      snapshot()
    } catch { /* ignore */ }
  }

  function exportCsv() {
    const headers = 'ID,I(A),r(m),B(T),shape\n'
    const rows = trials.value.map(t => `${t.id},${t.I.toFixed(1)},${t.r.toFixed(3)},${t.B.toFixed(6)},${t.shape}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'biot_savart_trials.csv'
    a.click()
  }

  return { trials, recordTrial, removeTrial, clearTrials, undo, redo, canUndo, canRedo, autoLoad, exportCsv }
}
