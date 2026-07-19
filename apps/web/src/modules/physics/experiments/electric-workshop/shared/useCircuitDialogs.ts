import { ref } from 'vue'
import type { useWorkshop } from './useWorkshop'

type Workshop = ReturnType<typeof useWorkshop>

export function useCircuitDialogs(workshop: Workshop) {
  const showSaveDialog = ref(false)
  const showLoadDialog = ref(false)
  const circuitName = ref('')
  const savedCircuits = ref<string[]>([])

  function doSaveCircuit() {
    const name = circuitName.value.trim()
    if (!name) return
    workshop.saveCircuit(name)
    circuitName.value = ''
    showSaveDialog.value = false
  }

  function openLoadDialog() {
    savedCircuits.value = workshop.getSavedCircuits()
    showLoadDialog.value = true
  }

  function doLoadCircuit(name: string, redraw: () => void) {
    workshop.loadCircuit(name)
    showLoadDialog.value = false
    if (workshop.running.value) workshop.solve()
    redraw()
  }

  function doDeleteCircuit(name: string) {
    workshop.deleteCircuit(name)
    savedCircuits.value = workshop.getSavedCircuits()
  }

  return {
    showSaveDialog,
    showLoadDialog,
    circuitName,
    savedCircuits,
    doSaveCircuit,
    openLoadDialog,
    doLoadCircuit,
    doDeleteCircuit,
  }
}
