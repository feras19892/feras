<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  sumFx: number
  sumFy: number
  resultantMag: number
  eqForceMag: number
  isBalanced: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
  step2: false,
})

const rCalc = computed(() => Math.sqrt(props.sumFx * props.sumFx + props.sumFy * props.sumFy))
const angleCalc = computed(() => {
  if (rCalc.value < 1e-9) return 0
  return Math.atan2(props.sumFy, props.sumFx) * 180 / Math.PI
})

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات حساب المحصلة والاتزان</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: المحصلة
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">R = √(ΣFx² + ΣFy²)</div>
        <div class="calc">
          <div>R = √({{ sumFx.toFixed(2) }}² + {{ sumFy.toFixed(2) }}²)</div>
          <div>R = √({{ (sumFx*sumFx).toFixed(2) }} + {{ (sumFy*sumFy).toFixed(2) }})</div>
          <div class="result">R = {{ rCalc.toFixed(2) }} N</div>
          <div>θ = {{ angleCalc.toFixed(1) }}°</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: قوة الاتزان
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">F_eq = −R</div>
        <div class="calc">
          <div>F_eq = {{ eqForceMag.toFixed(2) }} N</div>
          <div class="result">{{ isBalanced ? '⚖️ النظام متزن' : '⚠️ النظام غير متزن' }}</div>
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
