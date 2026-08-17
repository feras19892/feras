import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '../stores/notifications.store'

export function useApprovalBadge() {
  const store = useNotificationsStore()
  const { pendingCount } = storeToRefs(store)

  function onApprovalChanged() { store.onApprovalChanged() }

  onMounted(() => {
    store.startPolling(30000)
    window.addEventListener('approval:changed', onApprovalChanged)
  })
  onUnmounted(() => {
    window.removeEventListener('approval:changed', onApprovalChanged)
    store.stopPolling()
  })

  return { pendingCount, reload: store.loadApprovals }
}
