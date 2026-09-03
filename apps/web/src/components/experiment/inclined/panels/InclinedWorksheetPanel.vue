<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  thetaDeg: number
  length: number
  g: number
  mu: number
  acceleration: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
  step2: false,
})

const thetaRad = computed(() => props.thetaDeg * Math.PI / 180)
const aCalc = computed(() => {
  const sin = Math.sin(thetaRad.value)
  const cos = Math.cos(thetaRad.value)
  return props.g * (sin - props.mu * cos)
})

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات حساب التسارع على المستوى المائل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: القانون
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">a = g(sinθ − μ·cosθ)</div>
        <div class="explain">حيث θ = زاوية الميل، μ = معامل الاحتكاك</div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: الحساب
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="calc">
          <div>sin({{ thetaDeg.toFixed(1) }}°) = {{ Math.sin(thetaRad).toFixed(4) }}</div>
          <div>cos({{ thetaDeg.toFixed(1) }}°) = {{ Math.cos(thetaRad).toFixed(4) }}</div>
          <div>a = {{ g.toFixed(2) }} × ({{ Math.sin(thetaRad).toFixed(4) }} − {{ mu.toFixed(2) }} × {{ Math.cos(thetaRad).toFixed(4) }})</div>
          <div class="result">a = {{ aCalc.toFixed(2) }} m/s²</div>
          <div>المقاس: {{ acceleration.toFixed(2) }} m/s²</div>
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
.explain { color: #94a3b8; font-size: .8rem; }
.calc { display: flex; flex-direction: column; gap: .25rem; color: #D1D7E0; }
.result { color: #22c55e; font-weight: 700; margin-top: .25rem; }
</style>
