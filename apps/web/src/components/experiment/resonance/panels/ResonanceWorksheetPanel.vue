<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  stringLength: number
  tension: number
  harmonic: number
  frequency: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
})

const mu = computed(() => 0.01)
const vCalc = computed(() => Math.sqrt(props.tension / mu.value))
const fCalc = computed(() => (props.harmonic * vCalc.value) / (2 * props.stringLength))

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">{{ t('experiments.resWsTitle') }}</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} {{ t('experiments.resWsStep1') }}
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">f = n·v / (2L) = n·√(T/μ) / (2L)</div>
        <div class="calc">
          <div>v = √({{ tension }} / {{ mu.toFixed(2) }}) = {{ vCalc.toFixed(1) }} m/s</div>
          <div>f = {{ harmonic }} × {{ vCalc.toFixed(1) }} / (2 × {{ stringLength }})</div>
          <div class="result">f = {{ fCalc.toFixed(1) }} Hz</div>
          <div>{{ t('experiments.resWsMeasured') }}: {{ frequency.toFixed(1) }} Hz</div>
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
.calc { display: flex; flex-direction: column; gap: .25rem; color: #D1D7E0; }
.result { color: #22c55e; font-weight: 700; margin-top: .25rem; }
</style>
