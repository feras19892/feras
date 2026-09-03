<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { eventBus } from '@/composables/shared/useEventBus'

const active = ref(false)
const progress = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
let activeCount = 0

function startProgress() {
  activeCount++
  if (activeCount === 1) {
    active.value = true
    progress.value = 0
    timer = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 10
      }
    }, 200)
  }
}

function stopProgress() {
  activeCount = Math.max(0, activeCount - 1)
  if (activeCount === 0) {
    progress.value = 100
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    setTimeout(() => {
      active.value = false
      progress.value = 0
    }, 300)
  }
}

function onStart() { startProgress() }
function onStop() { stopProgress() }

onMounted(() => {
  eventBus.on('api:request-start', onStart)
  eventBus.on('api:request-end', onStop)
})

onUnmounted(() => {
  eventBus.off('api:request-start', onStart)
  eventBus.off('api:request-end', onStop)
  if (timer) clearInterval(timer)
})
</script>

<template>
  <Transition name="progress-fade">
    <div v-if="active" class="api-progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
  </Transition>
</template>

<style scoped>
.api-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 9999;
  background: transparent;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  border-radius: 0 2px 2px 0;
  transition: width 0.2s ease;
  box-shadow: 0 0 8px rgba(59,130,246,0.5);
}
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.2s;
}
.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
}
</style>
