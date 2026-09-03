import { ref } from 'vue'

const selectedSchoolId = ref<number | null>(null)

export function useSelectedSchool() {
  function setSelectedSchool(id: number) {
    selectedSchoolId.value = id
  }
  function clearSelectedSchool() {
    selectedSchoolId.value = null
  }
  return { selectedSchoolId, setSelectedSchool, clearSelectedSchool }
}
