import { ref } from 'vue'

const selectedUserId = ref<number | null>(null)

export function useSelectedUser() {
  function setSelectedUser(id: number) {
    selectedUserId.value = id
  }
  function clearSelectedUser() {
    selectedUserId.value = null
  }
  return { selectedUserId, setSelectedUser, clearSelectedUser }
}
