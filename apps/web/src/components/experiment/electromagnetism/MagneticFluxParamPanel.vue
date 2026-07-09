<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  B: number
  A: number
  theta: number
}>()

const emit = defineEmits<{
  (e: 'update:B', v: number): void
  (e: 'update:A', v: number): void
  (e: 'update:theta', v: number): void
}>()
</script>

<template>
  <div class="param-panel">
    <div class="param-title">{{ t('experiments.emParams') }}</div>

    <div class="param-row">
      <label>{{ t('experiments.fluxParamB') }}</label>
      <input type="range" min="0.1" max="2" step="0.05" :value="props.B"
        @input="emit('update:B', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.B.toFixed(2) }} T</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.fluxParamA') }}</label>
      <input type="range" min="10" max="500" step="5" :value="props.A * 10000"
        @input="emit('update:A', +($event.target as HTMLInputElement).value / 10000)" />
      <span class="param-val">{{ (props.A * 10000).toFixed(0) }} cm²</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.fluxParamTheta') }}</label>
      <input type="range" min="0" max="180" step="1" :value="props.theta * 180 / Math.PI"
        @input="emit('update:theta', +($event.target as HTMLInputElement).value * Math.PI / 180)" />
      <span class="param-val">{{ (props.theta * 180 / Math.PI).toFixed(0) }}°</span>
    </div>

    <div class="formula-box">
      <div class="formula">Φ = B · A · cos(θ)</div>
      <div class="const">{{ t('experiments.mfParamFormula1') }}</div>
      <div class="const">{{ t('experiments.mfParamFormula2') }}</div>
      <div class="const">{{ t('experiments.mfParamFormula3') }}</div>
    </div>
  </div>
</template>

<style scoped>
.param-panel { padding: .75rem; display: flex; flex-direction: column; gap: .6rem; }
.param-title { font-size: .85rem; font-weight: 700; color: #f59e0b; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.param-row { display: flex; flex-direction: column; gap: .25rem; }
.param-row label { font-size: .75rem; color: #94a3b8; }
.param-row input[type=range] { width: 100%; accent-color: #22c55e; }
.param-val { font-size: .8rem; color: #22c55e; font-weight: 700; font-family: 'Courier New', monospace; }
.formula-box { margin-top: .25rem; padding: .5rem; background: rgba(59,130,246,.08); border-radius: 6px; border: 1px solid rgba(59,130,246,.15); }
.formula { font-family: 'Courier New', monospace; font-size: .85rem; color: #3b82f6; text-align: center; }
.const { font-size: .65rem; color: #94a3b8; text-align: center; margin-top: .25rem; }
</style>
