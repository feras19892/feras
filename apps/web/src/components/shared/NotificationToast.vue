<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  show: boolean
  title: string
  message?: string
  icon?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  timeoutMs?: number
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

let timer: ReturnType<typeof setTimeout> | null = null

function startTimer() {
  clearTimer()
  if (props.timeoutMs && props.timeoutMs > 0) {
    timer = setTimeout(() => emit('close'), props.timeoutMs)
  }
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

onMounted(startTimer)
onUnmounted(clearTimer)

watch(() => props.show, (v) => {
  if (v) startTimer()
  else clearTimer()
})
</script>

<template>
  <transition name="toast-slide">
    <div v-if="show" class="toast" :class="type">
      <div class="left">
        <span class="icon">{{ icon || '🔔' }}</span>
        <div class="content">
          <div class="title">{{ title }}</div>
          <div v-if="message" class="message">{{ message }}</div>
        </div>
      </div>
      <button class="close" @click="emit('close')">✕</button>
    </div>
  </transition>
</template>

<style scoped>
.toast {
  min-width: 280px;
  max-width: 380px;
  padding: 0.75rem 0.9rem;
  border-radius: 0.75rem;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.toast.info { border-color: rgba(59,130,246,0.25); }
.toast.success { border-color: rgba(34,197,94,0.25); }
.toast.warning { border-color: rgba(234,179,8,0.35); }
.toast.error { border-color: rgba(239,68,68,0.35); }

.left { display: flex; align-items: center; gap: 0.6rem; flex: 1; }
.icon { font-size: 1.2rem; }
.content { display: flex; flex-direction: column; gap: 0.2rem; }
.title { font-weight: 700; font-size: 0.95rem; }
.message { font-size: 0.85rem; color: #cbd5e1; }
.close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.2rem;
}
.close:hover { color: #e2e8f0; }

.toast-slide-enter-active,
.toast-slide-leave-active { transition: all 0.2s ease; }
.toast-slide-enter-from { opacity: 0; transform: translateX(12px) translateY(8px); }
.toast-slide-leave-to { opacity: 0; transform: translateX(12px) translateY(8px); }
</style>
