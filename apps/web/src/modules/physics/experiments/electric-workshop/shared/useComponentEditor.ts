import type { Ref } from 'vue'
import type { useWorkshop } from './useWorkshop'
import type { WorkshopComponent, WorkshopWire } from './types'

type Workshop = ReturnType<typeof useWorkshop>

export function useComponentEditor(
  workshop: Workshop,
  redraw: () => void,
  selectedFault: Ref<any>,
) {
  function applyEditValue(editingComp: Ref<WorkshopComponent | null>, editValue: Ref<number>) {
    if (editingComp.value) {
      workshop.updateComponentValue(editingComp.value.id, editValue.value)
      if (workshop.running.value) {
        workshop.solve()
      } else {
        workshop.faults.value = []
      }
      redraw()
    }
  }

  function applyRotate(editingComp: Ref<WorkshopComponent | null>, editRotation: Ref<number>) {
    if (editingComp.value) {
      while (editingComp.value.rotation !== editRotation.value) {
        workshop.rotateComponent(editingComp.value.id)
      }
      workshop.rerouteAllWires()
      if (workshop.running.value) workshop.solve()
      redraw()
    }
  }

  function zoomComp(editingComp: Ref<WorkshopComponent | null>, delta: number) {
    if (editingComp.value) {
      const cur = editingComp.value.scale ?? 1
      workshop.setComponentScale(editingComp.value.id, cur + delta)
      workshop.rerouteAllWires()
      redraw()
    }
  }

  function zoomCompVal(editingComp: Ref<WorkshopComponent | null>, val: number) {
    if (editingComp.value) {
      workshop.setComponentScale(editingComp.value.id, val)
      workshop.rerouteAllWires()
      redraw()
    }
  }

  function deleteSelectedComp() {
    if (workshop.selectedComponentId.value !== null) {
      workshop.removeComponent(workshop.selectedComponentId.value)
      if (workshop.running.value) {
        workshop.solve()
      } else {
        workshop.faults.value = []
      }
      selectedFault.value = null
      redraw()
    }
  }

  function deleteSelectedWire(
    showWireEditor: Ref<boolean>,
    editingWire: Ref<WorkshopWire | null>,
  ) {
    if (workshop.selectedWireId.value !== null) {
      workshop.removeWire(workshop.selectedWireId.value)
      if (workshop.running.value) {
        workshop.solve()
      } else {
        workshop.faults.value = []
      }
      showWireEditor.value = false
      editingWire.value = null
      redraw()
    }
  }

  return {
    applyEditValue,
    applyRotate,
    zoomComp,
    zoomCompVal,
    deleteSelectedComp,
    deleteSelectedWire,
  }
}
