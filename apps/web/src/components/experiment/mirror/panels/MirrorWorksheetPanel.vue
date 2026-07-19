<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  focalLength: number
  objectDistance: number
  objectHeight: number
  imageDistance: number | null
  imageHeight: number | null
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
  step2: false,
})

const diCalc = computed(() => {
  const f = props.focalLength
  const do_ = props.objectDistance
  if (Math.abs(do_ - f) < 0.001) return null
  return (f * do_) / (do_ - f)
})
const mCalc = computed(() => {
  if (diCalc.value === null) return null
  return -diCalc.value / props.objectDistance
})
const hiCalc = computed(() => {
  if (mCalc.value === null) return null
  return mCalc.value * props.objectHeight
})

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات معادلة المرآة</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: المسافة البؤرية
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">1/f = 1/do + 1/di</div>
        <div class="calc">
          <div>1/{{ focalLength.toFixed(1) }} = 1/{{ objectDistance.toFixed(1) }} + 1/di</div>
          <div>di = {{ diCalc?.toFixed(2) ?? '∞' }} cm</div>
          <div class="result">f = {{ focalLength.toFixed(1) }} cm</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: التكبير
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">m = -di/do = hi/ho</div>
        <div class="calc">
          <div>m = -{{ (diCalc ?? 0).toFixed(2) }} / {{ objectDistance.toFixed(1) }}</div>
          <div class="result">m = {{ mCalc?.toFixed(3) ?? '--' }}</div>
          <div>hi = {{ hiCalc?.toFixed(2) ?? '--' }} cm</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; }
.ws-title { font-size: 1rem; font-weight: 700; color: #5B8DB8; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.formula { font-family: 'Courier New', monospace; font-size: 1rem; color: #5B8DB8; text-align: center; padding: .5rem; background: rgba(91,141,184,.08); border-radius: 4px; margin-bottom: .5rem; }
.calc { display: flex; flex-direction: column; gap: .25rem; color: #D1D7E0; }
.result { color: #22c55e; font-weight: 700; margin-top: .25rem; }
</style>
