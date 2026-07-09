<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  mass: number
  period: number
  kActual: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
  step2: false,
  step3: false,
})

const T = computed(() => props.period)
const m = computed(() => props.mass)
const kCalc = computed(() => {
  if (T.value <= 0 || m.value <= 0) return 0
  return (4 * Math.PI * Math.PI * m.value) / (T.value * T.value)
})
const errorPercent = computed(() => {
  if (props.kActual <= 0 || kCalc.value <= 0) return 0
  return Math.abs((kCalc.value - props.kActual) / props.kActual * 100)
})

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات حساب ثابت النابض k</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: كتابة القانون
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">T = 2π√(m/k)</div>
        <div class="explain">حيث T = الدورة الزمنية، m = الكتلة، k = ثابت النابض</div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: حساب k
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">k = 4π²m / T²</div>
        <div class="calc">
          <div>k = 4 × π² × {{ m.toFixed(3) }} / {{ T.toFixed(3) }}²</div>
          <div>k = {{ (4 * Math.PI * Math.PI * m).toFixed(3) }} / {{ (T * T).toFixed(3) }}</div>
          <div class="result">k = {{ kCalc.toFixed(2) }} N/m</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: مقارنة مع القيمة الفعلية
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <div class="compare">
          <div>k المحسوب: <strong>{{ kCalc.toFixed(2) }}</strong> N/m</div>
          <div>k الفعلي: <strong>{{ kActual.toFixed(2) }}</strong> N/m</div>
          <div class="error">
            نسبة الخطأ: {{ errorPercent.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; }
.ws-title { font-size: 1rem; font-weight: 700; color: #5B8DB8; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: right; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.formula { font-family: 'Courier New', monospace; font-size: 1rem; color: #5B8DB8; text-align: center; padding: .5rem; background: rgba(91,141,184,.08); border-radius: 4px; margin-bottom: .5rem; }
.explain { color: #94a3b8; font-size: .8rem; }
.calc { display: flex; flex-direction: column; gap: .25rem; color: #D1D7E0; }
.result { color: #22c55e; font-weight: 700; margin-top: .25rem; }
.compare { display: flex; flex-direction: column; gap: .25rem; }
.error { color: #f87171; margin-top: .25rem; }
</style>
