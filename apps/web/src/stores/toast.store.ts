import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
  duration: number
}

let nextId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])

  function push(type: ToastType, message: string, duration = 4000) {
    const id = ++nextId
    toasts.value.push({ id, type, message, duration })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  function success(message: string, duration?: number) {
    return push('success', message, duration)
  }

  function error(message: string, duration?: number) {
    return push('error', message, duration ?? 6000)
  }

  function info(message: string, duration?: number) {
    return push('info', message, duration)
  }

  function warning(message: string, duration?: number) {
    return push('warning', message, duration)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function clear() {
    toasts.value = []
  }

  return { toasts, push, success, error, info, warning, dismiss, clear }
})
