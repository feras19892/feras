<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  I: number
  N: number
}>()

const emit = defineEmits<{
  (e: 'update:I', v: number): void
  (e: 'update:N', v: number): void
}>()
</script>

<template>
  <div class="param-panel">
    <div class="param-title">{{ t('experiments.emParams') }}</div>

    <div class="param-row">
      <label>{{ t('experiments.ccParamI') }}</label>
      <input type="range" min="0.5" max="50" step="0.5" :value="props.I"
        @input="emit('update:I', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.I.toFixed(1) }} A</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.ccParamN') }}</label>
      <input type="range" min="1" max="50" step="1" :value="props.N"
        @input="emit('update:N', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.N }} {{ t('experiments.genTurns') }}</span>
    </div>

    <div class="param-hint">
      {{ t('experiments.swHintR') }}
    </div>

    <div class="formula-box">
      <div class="formula">B = μ₀NI / (2R)</div>
      <div class="const">μ₀ = 4π × 10⁻⁷ T·m/A</div>
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
.param-hint { font-size: .7rem; color: #a855f7; text-align: center; padding: .4rem; background: rgba(168,85,247,.08); border-radius: 6px; border: 1px solid rgba(168,85,247,.15); }
.formula-box { margin-top: .25rem; padding: .5rem; background: rgba(245,158,11,.08); border-radius: 6px; border: 1px solid rgba(245,158,11,.15); }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #f59e0b; text-align: center; }
.const { font-size: .7rem; color: #64748b; text-align: center; margin-top: .25rem; }
</style>
