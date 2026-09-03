import { ref } from 'vue'

interface AdminPasswordOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'success'
}

const visible = ref(false)
const options = ref<AdminPasswordOptions>({ message: '' })
const password = ref('')
let resolveFn: ((value: string | null) => void) | null = null

export function useAdminPasswordConfirm() {
  function adminPasswordConfirm(opts: AdminPasswordOptions): Promise<string | null> {
    if (resolveFn) { resolveFn(null); resolveFn = null }
    options.value = opts
    password.value = ''
    visible.value = true
    return new Promise<string | null>((resolve) => {
      resolveFn = resolve
    })
  }

  function acceptDialog() {
    visible.value = false
    resolveFn?.(password.value)
    resolveFn = null
    password.value = ''
  }

  function cancelDialog() {
    visible.value = false
    resolveFn?.(null)
    resolveFn = null
    password.value = ''
  }

  return {
    dialogVisible: visible,
    dialogOptions: options,
    dialogPassword: password,
    adminPasswordConfirm,
    acceptDialog,
    cancelDialog,
  }
}
