<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  v0: number
  angleDeg: number
  g: number
  range: number
  maxHeight: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
  step2: false,
  step3: false,
})

const thetaRad = computed(() => props.angleDeg * Math.PI / 180)
const sin2Theta = computed(() => Math.sin(2 * thetaRad.value))
const sinTheta = computed(() => Math.sin(thetaRad.value))
const rangeCalc = computed(() => {
  if (props.v0 <= 0 || props.g <= 0) return 0
  return (props.v0 * props.v0 * sin2Theta.value) / props.g
})
const heightCalc = computed(() => {
  if (props.v0 <= 0 || props.g <= 0) return 0
  return (props.v0 * props.v0 * sinTheta.value * sinTheta.value) / (2 * props.g)
})

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات حساب المقذوف</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: المدى الأفقي R
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">R = v₀²·sin(2θ) / g</div>
        <div class="calc">
          <div>R = {{ v0.toFixed(1) }}² × sin(2×{{ angleDeg.toFixed(1) }}°) / {{ g.toFixed(2) }}</div>
          <div>R = {{ (v0*v0).toFixed(1) }} × {{ sin2Theta.toFixed(4) }} / {{ g.toFixed(2) }}</div>
          <div class="result">R = {{ rangeCalc.toFixed(2) }} m</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: الارتفاع الأقصى H
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">H = v₀²·sin²(θ) / (2g)</div>
        <div class="calc">
          <div>H = {{ v0.toFixed(1) }}² × sin²({{ angleDeg.toFixed(1) }}°) / (2×{{ g.toFixed(2) }})</div>
          <div>H = {{ (v0*v0).toFixed(1) }} × {{ (sinTheta*sinTheta).toFixed(4) }} / {{ (2*g).toFixed(2) }}</div>
          <div class="result">H = {{ heightCalc.toFixed(2) }} m</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: مقارنة مع القياس
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <div class="compare">
          <div>المدى المحسوب: <strong>{{ rangeCalc.toFixed(2) }}</strong> m</div>
          <div>المدى المقاس: <strong>{{ range.toFixed(2) }}</strong> m</div>
          <div>الارتفاع المحسوب: <strong>{{ heightCalc.toFixed(2) }}</strong> m</div>
          <div>الارتفاع المقاس: <strong>{{ maxHeight.toFixed(2) }}</strong> m</div>
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
.compare { display: flex; flex-direction: column; gap: .25rem; }
</style>
