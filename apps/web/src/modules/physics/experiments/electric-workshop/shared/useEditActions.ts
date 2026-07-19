import type { Ref } from 'vue'
import type { useWorkshop } from './useWorkshop'
import type { WorkshopComponent, WorkshopWire } from './types'

type Workshop = ReturnType<typeof useWorkshop>

export function useEditActions(
  workshop: Workshop,
  redraw: () => void,
  editingComp: Ref<WorkshopComponent | null>,
  editValue: Ref<number>,
  editRotation: Ref<number>,
  editingWire: Ref<WorkshopWire | null>,
  editWireColor: Ref<string>,
  editWireThickness: Ref<number>,
  showValueEditor: Ref<boolean>,
  showWireEditor: Ref<boolean>,
) {
  function saveEdit() {
    if (editingComp.value) {
      workshop.updateComponentValue(editingComp.value.id, editValue.value)
      while (editingComp.value.rotation !== editRotation.value) {
        workshop.rotateComponent(editingComp.value.id)
      }
      workshop.rerouteAllWires()
      if (workshop.running.value) workshop.solve()
    }
    showValueEditor.value = false
    editingComp.value = null
    redraw()
  }

  function saveWireEdit() {
    if (editingWire.value) {
      workshop.updateWireColor(editingWire.value.id, editWireColor.value)
      workshop.updateWireThickness(editingWire.value.id, editWireThickness.value)
    }
    showWireEditor.value = false
    editingWire.value = null
    redraw()
  }

  function deleteEditingComp() {
    if (editingComp.value) {
      workshop.removeComponent(editingComp.value.id)
      if (workshop.running.value) workshop.solve()
    }
    showValueEditor.value = false
    editingComp.value = null
    redraw()
  }

  function deleteEditingWire() {
    if (editingWire.value) {
      workshop.removeWire(editingWire.value.id)
      if (workshop.running.value) workshop.solve()
    }
    showWireEditor.value = false
    editingWire.value = null
    redraw()
  }

  return { saveEdit, saveWireEdit, deleteEditingComp, deleteEditingWire }
}
