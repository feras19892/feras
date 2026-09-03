import { ref } from 'vue'

const selectedClassId = ref<string | null>(null)

export function useSelectedClass() {
  function setSelectedClass(id: string) {
    selectedClassId.value = id
  }
  function clearSelectedClass() {
    selectedClassId.value = null
  }
  return { selectedClassId, setSelectedClass, clearSelectedClass }
}
