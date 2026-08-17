import { ref } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'success'
  icon?: string
}

const visible = ref(false)
const options = ref<ConfirmOptions>({ message: '' })
let resolveFn: ((value: boolean) => void) | null = null

export function useConfirmDialog() {
  function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
    if (resolveFn) { resolveFn(false); resolveFn = null }
    options.value = opts
    visible.value = true
    return new Promise<boolean>((resolve) => {
      resolveFn = resolve
    })
  }

  function acceptDialog() {
    visible.value = false
    resolveFn?.(true)
    resolveFn = null
  }

  function cancelDialog() {
    visible.value = false
    resolveFn?.(false)
    resolveFn = null
  }

  return {
    dialogVisible: visible,
    dialogOptions: options,
    confirmDialog,
    acceptDialog,
    cancelDialog,
  }
}
