<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  polarizerAngle: number
  analyzerAngle: number
  I0: number
  outputIntensity: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
})

const deltaTheta = computed(() => {
  const d = props.analyzerAngle - props.polarizerAngle
  return ((d % 360) + 360) % 360
})
const Icalc = computed(() => props.I0 * Math.pow(Math.cos(deltaTheta.value * Math.PI / 180), 2))

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات قانون مالوس</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: حساب الشدة
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">I = I₀ cos²(Δθ)</div>
        <div class="calc">
          <div>Δθ = {{ analyzerAngle }}° - {{ polarizerAngle }}° = {{ deltaTheta.toFixed(1) }}°</div>
          <div>I = {{ I0 }} × cos²({{ deltaTheta.toFixed(1) }}°)</div>
          <div>I = {{ I0 }} × {{ Math.pow(Math.cos(deltaTheta * Math.PI / 180), 2).toFixed(4) }}</div>
          <div class="result">I = {{ Icalc.toFixed(2) }}</div>
          <div>المقاس: {{ outputIntensity.toFixed(2) }}</div>
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
