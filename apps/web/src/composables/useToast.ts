import { storeToRefs } from 'pinia'
import { useToastStore } from '../stores/toast.store'

export function useToast() {
  const store = useToastStore()
  const { toasts } = storeToRefs(store)

  return {
    toasts,
    success: store.success,
    error: store.error,
    info: store.info,
    warning: store.warning,
    dismiss: store.dismiss,
    clear: store.clear,
  }
}
