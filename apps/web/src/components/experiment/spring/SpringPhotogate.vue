<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction, t } = useI18n();
import { ref, watch } from 'vue'


const props = defineProps<{
  simRunning: boolean
  simX: number
  simV: number
  targetCount: number
}>()

const emit = defineEmits<{
  (e: 'complete', count: number, timeMs: number): void
}>()

const count = ref(0)
const isCounting = ref(false)
const startTime = ref(0)
const elapsed = ref(0)
const lastX = ref(0)

// Trials for 3 repetitions
const t1 = ref(0)
const t2 = ref(0)
const t3 = ref(0)
const currentTrial = ref(0) // 0 = t1, 1 = t2, 2 = t3

let rafId: number | null = null

function start() {
  if (currentTrial.value >= 3) return
  count.value = 0
  isCounting.value = true
  startTime.value = performance.now()
  elapsed.value = 0
  lastX.value = props.simX
  tick()
}

function stop() {
  isCounting.value = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
}

function resetAll() {
  stop()
  count.value = 0
  elapsed.value = 0
  t1.value = 0
  t2.value = 0
  t3.value = 0
  currentTrial.value = 0
}

function recordTrial() {
  const t = elapsed.value / 1000 // seconds for 20 oscillations
  if (currentTrial.value === 0) t1.value = t
  else if (currentTrial.value === 1) t2.value = t
  else if (currentTrial.value === 2) t3.value = t
  currentTrial.value++
  emit('complete', count.value, elapsed.value)
}

watch(() => props.simRunning, (running) => {
  if (!running && isCounting.value) stop()
})

watch(() => props.simX, (newX) => {
  if (!isCounting.value || !props.simRunning) return

  // Zero crossing: from positive to negative
  if (lastX.value > 0 && newX <= 0) {
    count.value++
    if (count.value >= props.targetCount) {
      elapsed.value = performance.now() - startTime.value
      stop()
      recordTrial()
    }
  }
  lastX.value = newX
}, { immediate: false })

function tick() {
  if (!isCounting.value) return
  elapsed.value = performance.now() - startTime.value
  rafId = requestAnimationFrame(tick)
}

defineExpose({ start, stop, resetAll, count, elapsed, t1, t2, t3 })
</script>

<template>
  <div class="photogate">
    <div class="gate-display">
      <div class="gate-label">{{ t('experiments.photogateTitle') }}</div>
      <div class="gate-count" :class="{ active: isCounting }">
        {{ count }} <span class="gate-target">/ {{ targetCount }}</span>
      </div>
      <div class="gate-time" v-if="elapsed > 0 || isCounting">
        {{ t('experiments.time') }}: {{ (elapsed / 1000).toFixed(2) }} s
      </div>
    </div>

    <div class="trials-table" v-if="t1 > 0 || t2 > 0 || t3 > 0">
      <table>
        <thead>
          <tr><th>{{ t('experiments.repetition') }}</th><th>t (s)</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>{{ t1 > 0 ? t1.toFixed(2) : '--' }}</td></tr>
          <tr><td>2</td><td>{{ t2 > 0 ? t2.toFixed(2) : '--' }}</td></tr>
          <tr><td>3</td><td>{{ t3 > 0 ? t3.toFixed(2) : '--' }}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="gate-controls">
      <button class="btn" :disabled="isCounting || currentTrial >= 3" @click="start">{{ t('experiments.startCounting') }}</button>
      <button class="btn secondary" :disabled="!isCounting" @click="stop">{{ t('experiments.stopAction') }}</button>
      <button class="btn danger" @click="resetAll">{{ t('experiments.redoBtn') }}</button>
    </div>
  </div>
</template>

<style scoped>
.photogate { display: flex; flex-direction: column; gap: .4rem; }
.gate-display { background: #161B22; border: 1px solid #2D3645; border-radius: 8px; padding: .5rem; text-align: center; }
.gate-label { font-size: .7rem; color: #8B95A5; margin-bottom: .2rem; }
.gate-count { font-size: 1.8rem; font-weight: 700; color: #D1D7E0; font-family: monospace; }
.gate-count.active { color: #5B8DB8; }
.gate-target { font-size: .9rem; color: #8B95A5; }
.gate-time { font-size: .75rem; color: #5B8DB8; margin-top: .2rem; }
.trials-table table { width: 100%; border-collapse: collapse; font-size: .75rem; }
.trials-table th, .trials-table td { border: 1px solid #2D3645; padding: .25rem; text-align: center; color: #D1D7E0; }
.trials-table th { background: #252D3A; }
.gate-controls { display: flex; gap: .3rem; flex-wrap: wrap; }
.btn { background: #252D3A; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 4px; padding: .25rem .5rem; font-size: .75rem; cursor: pointer; }
.btn:hover:not(:disabled) { background: #2D3645; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn.secondary { background: #3a4a5c; border-color: #4a5a6c; }
.btn.danger:hover { background: rgba(212,117,107,.2); color: #D4756B; border-color: rgba(212,117,107,.3); }
</style>
