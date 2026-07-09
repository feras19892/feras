import { ref } from 'vue'

export interface BoylesLawTrial {
  id: number
  p: number
  v: number
  pv: number
}

export function useBoylesLawTrials(
  paramsGetter: { get value(): { p: number; v: number; pv: number } },
) {
  const trials = ref<BoylesLawTrial[]>([])
  const history = ref<BoylesLawTrial[][]>([])
  const historyIndex = ref(-1)
  let nextId = 1

  function snapshot() {
    if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push([...trials.value])
    historyIndex.value++
  }

  function recordTrial() {
    const p = paramsGetter.value
    const t: BoylesLawTrial = { id: nextId++, p: p.p, v: p.v, pv: p.pv }
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

  const STORAGE_KEY = 'boyleslaw_trials_v1'
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(trials.value)) }
  function autoLoad() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const arr = JSON.parse(raw) as BoylesLawTrial[]
      trials.value = arr
      nextId = arr.length ? Math.max(...arr.map(t => t.id)) + 1 : 1
      snapshot()
    } catch { /* ignore */ }
  }

  function exportCsv() {
    const headers = 'ID,P(atm),V(L),P·V\n'
    const rows = trials.value.map(t => `${t.id},${t.p.toFixed(2)},${t.v.toFixed(2)},${t.pv.toFixed(2)}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'boyles_law_trials.csv'
    a.click()
  }

  return { trials, recordTrial, removeTrial, clearTrials, undo, redo, canUndo, canRedo, autoLoad, exportCsv }
}
