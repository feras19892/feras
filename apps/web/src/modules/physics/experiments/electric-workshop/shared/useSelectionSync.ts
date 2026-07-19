import { watch } from 'vue'
import type { Ref } from 'vue'
import type { useWorkshop } from './useWorkshop'
import type { WorkshopComponent, WorkshopWire } from './types'

type Workshop = ReturnType<typeof useWorkshop>

export function useSelectionSync(
  workshop: Workshop,
  editingComp: Ref<WorkshopComponent | null>,
  editValue: Ref<number>,
  editRotation: Ref<number>,
  showValueEditor: Ref<boolean>,
  editingWire: Ref<WorkshopWire | null>,
  editWireColor: Ref<string>,
  editWireThickness: Ref<number>,
  showWireEditor: Ref<boolean>,
) {
  watch(() => workshop.selectedComponentId.value, (id) => {
    if (id !== null) {
      const comp = workshop.components.find(c => c.id === id)
      if (comp) {
        editingComp.value = comp
        editValue.value = comp.value
        editRotation.value = comp.rotation
        showValueEditor.value = true
        showWireEditor.value = false
      }
    } else {
      showValueEditor.value = false
      editingComp.value = null
    }
  })

  watch(() => workshop.selectedWireId.value, (id) => {
    if (id !== null) {
      const wire = workshop.wires.find(w => w.id === id)
      if (wire) {
        editingWire.value = wire
        editWireColor.value = wire.color
        editWireThickness.value = wire.thickness
        showWireEditor.value = true
        showValueEditor.value = false
      }
    } else {
      showWireEditor.value = false
      editingWire.value = null
    }
  })
}
