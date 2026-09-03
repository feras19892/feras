<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  L0: number
  t0: number
  t1: number
  alpha: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
})

const dLcalc = computed(() => props.alpha * 1e-6 * props.L0 * (props.t1 - props.t0))
const L1calc = computed(() => props.L0 + dLcalc.value)

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات التمدد الحراري</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: التمدد الطولي
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">ΔL = α · L₀ · ΔT</div>
        <div class="calc">
          <div>ΔT = {{ t1 }}°C - {{ t0 }}°C = {{ t1 - t0 }}°C</div>
          <div>ΔL = {{ alpha }}×10⁻⁶ × {{ L0 }} m × {{ t1 - t0 }}°C</div>
          <div class="result">ΔL = {{ (dLcalc * 1e6).toFixed(2) }} μm</div>
          <div>L₁ = {{ L0 }} + {{ dLcalc.toFixed(6) }} = {{ L1calc.toFixed(6) }} m</div>
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
