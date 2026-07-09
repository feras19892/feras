<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

const props = defineProps<{
  I: number
  N: number
  a: number
  b: number
  bField: number
  theta: number
}>()

const emit = defineEmits<{
  (e: 'update:I', v: number): void
  (e: 'update:N', v: number): void
  (e: 'update:a', v: number): void
  (e: 'update:b', v: number): void
  (e: 'update:bField', v: number): void
  (e: 'update:theta', v: number): void
}>()
</script>

<template>
  <div class="param-panel">
    <div class="param-title">{{ t('experiments.emParams') }}</div>

    <div class="param-row">
      <label>{{ t('experiments.tcParamI') }}</label>
      <input type="range" min="0" max="10" step="0.1" :value="props.I"
        @input="emit('update:I', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.I.toFixed(1) }} A</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.tcParamN') }}</label>
      <input type="range" min="1" max="200" step="1" :value="props.N"
        @input="emit('update:N', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.N }} {{ t('experiments.genTurns') }}</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.tcParamA') }}</label>
      <input type="range" min="2" max="20" step="0.5" :value="props.a * 100"
        @input="emit('update:a', +($event.target as HTMLInputElement).value / 100)" />
      <span class="param-val">{{ (props.a * 100).toFixed(1) }} cm</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.tcParamB') }}</label>
      <input type="range" min="2" max="20" step="0.5" :value="props.b * 100"
        @input="emit('update:b', +($event.target as HTMLInputElement).value / 100)" />
      <span class="param-val">{{ (props.b * 100).toFixed(1) }} cm</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.tcParamBField') }}</label>
      <input type="range" min="0" max="0.5" step="0.005" :value="props.bField"
        @input="emit('update:bField', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.bField.toFixed(3) }} T</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.tcParamTheta') }}</label>
      <input type="range" min="0" max="180" step="1" :value="props.theta"
        @input="emit('update:theta', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.theta.toFixed(0) }}°</span>
    </div>

    <div class="formula-box">
      <div class="formula">τ = NIAB sin(θ)</div>
      <div class="const">μ = NIA &nbsp;|&nbsp; A = a × b</div>
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
.formula-box { margin-top: .25rem; padding: .5rem; background: rgba(245,158,11,.08); border-radius: 6px; border: 1px solid rgba(245,158,11,.15); }
.formula { font-family: 'Courier New', monospace; font-size: .85rem; color: #f59e0b; text-align: center; }
.const { font-size: .7rem; color: #a855f7; text-align: center; margin-top: .25rem; }
</style>
