import { ref } from 'vue'

export interface SpecificHeatTrial {
  id: number
  metalType: string
  metalMass: number      // kg
  metalTemp: number       // °C (heated to 100)
  waterMass: number       // kg
  waterTemp: number       // °C
  finalTemp: number        // °C (measured equilibrium)
  cExtracted: number       // J/kg·°C computed from experiment
  cTrue: number           // J/kg·°C actual from catalog
}

export function useSpecificHeatTrials(
  paramsGetter: { get value(): { metalType: string; metalMass: number; metalTemp: number; waterMass: number; waterTemp: number; finalTemp: number; cExtracted: number; cTrue: number } },
) {
  const trials = ref<SpecificHeatTrial[]>([])
  const history = ref<SpecificHeatTrial[][]>([])
  const historyIndex = ref(-1)
  let nextId = 1

  function snapshot() {
    if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push([...trials.value])
    historyIndex.value++
  }

  function recordTrial() {
    const p = paramsGetter.value
    const t: SpecificHeatTrial = {
      id: nextId++, metalType: p.metalType, metalMass: p.metalMass, metalTemp: p.metalTemp,
      waterMass: p.waterMass, waterTemp: p.waterTemp, finalTemp: p.finalTemp,
      cExtracted: p.cExtracted, cTrue: p.cTrue,
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

  const STORAGE_KEY = 'specificheat_trials_v2'
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(trials.value)) }
  function autoLoad() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const arr = JSON.parse(raw) as SpecificHeatTrial[]
      trials.value = arr
      nextId = arr.length ? Math.max(...arr.map(t => t.id)) + 1 : 1
      snapshot()
    } catch { /* ignore */ }
  }

  function exportCsv() {
    const headers = 'ID,MetalType,MetalMass(kg),MetalTemp(C),WaterMass(kg),WaterTemp(C),FinalTemp(C),cExtracted(J/kgK),cTrue(J/kgK)\n'
    const rows = trials.value.map(t =>
      `${t.id},${t.metalType},${t.metalMass.toFixed(3)},${t.metalTemp},${t.waterMass.toFixed(3)},${t.waterTemp},${t.finalTemp.toFixed(2)},${t.cExtracted.toFixed(1)},${t.cTrue.toFixed(1)}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'specific_heat_mixture_trials.csv'
    a.click()
  }

  return { trials, recordTrial, removeTrial, clearTrials, undo, redo, canUndo, canRedo, autoLoad, exportCsv }
}
