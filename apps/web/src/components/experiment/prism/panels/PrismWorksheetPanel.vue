<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  angleIncidence: number
  prismAngle: number
  n: number
  deviation: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
})

const theta1Rad = computed(() => props.angleIncidence * Math.PI / 180)
const theta2Calc = computed(() => {
  const sin2 = Math.sin(theta1Rad.value) / props.n
  if (sin2 > 1) return null
  return Math.asin(sin2) * 180 / Math.PI
})

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات انكسار المنشور</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: قانون سنل عند الوجه الأول
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">sin θ₂ = sin θ₁ / n</div>
        <div class="calc">
          <div>sin({{ angleIncidence.toFixed(1) }}°) / {{ n.toFixed(2) }} = {{ Math.sin(theta1Rad).toFixed(4) }} / {{ n.toFixed(2) }}</div>
          <div>θ₂ = {{ theta2Calc?.toFixed(2) ?? 'TIR' }}°</div>
          <div class="result">انحراف = {{ deviation.toFixed(2) }}°</div>
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
