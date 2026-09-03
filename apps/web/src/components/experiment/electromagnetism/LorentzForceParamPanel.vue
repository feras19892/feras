<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
const props = defineProps<{

  V: number
  I: number
  N: number
  R: number
}>()

const emit = defineEmits<{
  (e: 'update:v', v: number): void
  (e: 'update:i', v: number): void
  (e: 'update:n', v: number): void
}>()
</script>

<template>
  <div class="param-panel">
    <div class="param-title">{{ t('experiments.emParams') }}</div>

    <div class="param-row">
      <label>{{ t('experiments.lfParamV') }}</label>
      <input type="range" min="150" max="300" step="5" :value="props.V"
        @input="emit('update:v', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.V.toFixed(0) }} V</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.lfParamI') }}</label>
      <input type="range" min="0" max="3" step="0.05" :value="props.I"
        @input="emit('update:i', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.I.toFixed(2) }} A</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.lfParamN') }}</label>
      <input type="range" min="1" max="500" step="1" :value="props.N"
        @input="emit('update:n', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.N }} {{ t('experiments.genTurns') }}</span>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">{{ t('experiments.lfCoilR') }}</span>
        <span class="info-val">{{ (props.R * 100).toFixed(1) }} cm</span>
      </div>
    </div>

    <div class="formula-box">
      <div class="formula">B = 8μ₀NI / (5√5 · R)</div>
      <div class="const">v = √(2eV/m) &nbsp;|&nbsp; r = mv/(eB)</div>
      <div class="const">e/m = 2V / (B²r²)</div>
    </div>
  </div>
</template>

<style scoped>
.param-panel { padding: .75rem; display: flex; flex-direction: column; gap: .6rem; }
.param-title { font-size: .85rem; font-weight: 700; color: #f59e0b; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.info-box { padding: .5rem; background: rgba(91,141,184,.08); border-radius: 6px; border: 1px solid rgba(91,141,184,.15); }
.info-row { display: flex; justify-content: space-between; align-items: center; }
.info-label { font-size: .7rem; color: #94a3b8; }
.info-val { font-size: .75rem; color: #5B8DB8; font-weight: 700; font-family: 'Courier New', monospace; }
.param-row { display: flex; flex-direction: column; gap: .25rem; }
.param-row label { font-size: .75rem; color: #94a3b8; }
.param-row input[type=range] { width: 100%; accent-color: #22c55e; }
.param-val { font-size: .8rem; color: #22c55e; font-weight: 700; font-family: 'Courier New', monospace; }
.formula-box { margin-top: .25rem; padding: .5rem; background: rgba(245,158,11,.08); border-radius: 6px; border: 1px solid rgba(245,158,11,.15); }
.formula { font-family: 'Courier New', monospace; font-size: .85rem; color: #f59e0b; text-align: center; }
.const { font-size: .7rem; color: #a855f7; text-align: center; margin-top: .25rem; }
</style>