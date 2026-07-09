import { ref, computed } from 'vue'

export interface LatentHeatTrial {
  id: number
  mass: number
  phaseType: 'fusion' | 'vaporization'
  Q: number
  L: number
  meltedMass: number
  remainingMass: number
  temp: number
}

export function useLatentHeatTrials(
  paramsGetter: { get value(): { mass: number; phaseType: 'fusion' | 'vaporization'; Q: number; L: number; meltedMass: number; remainingMass: number; temp: number } },
) {
  const trials = ref<LatentHeatTrial[]>([])
  const history = ref<LatentHeatTrial[][]>([])
  const historyIndex = ref(-1)
  let nextId = 1

  function snapshot() {
    if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push([...trials.value])
    historyIndex.value++
  }

  function recordTrial() {
    const p = paramsGetter.value
    const t: LatentHeatTrial = {
      id: nextId++, mass: p.mass, phaseType: p.phaseType, Q: p.Q, L: p.L,
      meltedMass: p.meltedMass, remainingMass: p.remainingMass, temp: p.temp,
    }
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

  const STORAGE_KEY = 'latentheat_trials_v1'
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(trials.value)) }
  function autoLoad() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const arr = JSON.parse(raw) as LatentHeatTrial[]
      trials.value = arr
      nextId = arr.length ? Math.max(...arr.map(t => t.id)) + 1 : 1
      snapshot()
    } catch { /* ignore */ }
  }

  function exportCsv() {
    const headers = 'ID,Mass(kg),Phase,Q(J),L(J/kg),Melted(kg),Remaining(kg),Temp(C)\n'
    const rows = trials.value.map(t => `${t.id},${t.mass},${t.phaseType},${t.Q.toFixed(0)},${t.L.toFixed(0)},${t.meltedMass.toFixed(3)},${t.remainingMass.toFixed(3)},${t.temp}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'latent_heat_trials.csv'
    a.click()
  }

  const avgL = computed(() => {
    if (!trials.value.length) return 0
    return trials.value.reduce((s, t) => s + t.L, 0) / trials.value.length
  })

  return { trials, recordTrial, removeTrial, clearTrials, undo, redo, canUndo, canRedo, autoLoad, exportCsv, avgL }
}
