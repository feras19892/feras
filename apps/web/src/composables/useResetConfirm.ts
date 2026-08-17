import { ref } from 'vue'
import { useI18n } from './useI18n'

const showResetConfirm = ref(false)
let resolveFn: ((value: boolean) => void) | null = null

export function useResetConfirm() {
  const { t } = useI18n()

  function confirmReset(): Promise<boolean> {
    if (resolveFn) { resolveFn(false); resolveFn = null }
    showResetConfirm.value = true
    return new Promise<boolean>((resolve) => {
      resolveFn = resolve
    })
  }

  function acceptReset() {
    showResetConfirm.value = false
    resolveFn?.(true)
    resolveFn = null
  }

  function cancelReset() {
    showResetConfirm.value = false
    resolveFn?.(false)
    resolveFn = null
  }

  return {
    showResetConfirm,
    confirmReset,
    acceptReset,
    cancelReset,
    t,
  }
}
