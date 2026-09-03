<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
const props = defineProps<{

  B: number
  N: number
  A: number
  v: number
  R: number
  d: number
  mode: 'faraday' | 'lenz'
}>()

const emit = defineEmits<{
  (e: 'update:B', v: number): void
  (e: 'update:N', v: number): void
  (e: 'update:A', v: number): void
  (e: 'update:v', v: number): void
  (e: 'update:R', v: number): void
  (e: 'update:d', v: number): void
}>()
</script>

<template>
  <div class="param-panel">
    <div class="param-title">{{ t('experiments.emParams') }}</div>

    <div class="param-row">
      <label>{{ t('experiments.faradayParamB') }}</label>
      <input type="range" min="0.1" max="2" step="0.05" :value="props.B"
        @input="emit('update:B', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.B.toFixed(2) }} T</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.faradayParamN') }}</label>
      <input type="range" min="1" max="500" step="1" :value="props.N"
        @input="emit('update:N', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.N }} {{ t('experiments.genTurns') }}</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.faradayParamA') }}</label>
      <input type="range" min="10" max="500" step="5" :value="props.A * 10000"
        @input="emit('update:A', +($event.target as HTMLInputElement).value / 10000)" />
      <span class="param-val">{{ (props.A * 10000).toFixed(0) }} cm²</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.faradayParamV') }}</label>
      <input type="range" min="0.1" max="5" step="0.1" :value="props.v"
        @input="emit('update:v', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.v.toFixed(1) }} m/s</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.faradayParamR') }}</label>
      <input type="range" min="1" max="100" step="1" :value="props.R"
        @input="emit('update:R', +($event.target as HTMLInputElement).value)" />
      <span class="param-val">{{ props.R.toFixed(0) }} Ω</span>
    </div>

    <div class="param-row">
      <label>{{ t('experiments.faradayParamD') }}</label>
      <input type="range" min="2" max="15" step="0.5" :value="props.d * 100"
        @input="emit('update:d', +($event.target as HTMLInputElement).value / 100)" />
      <span class="param-val">{{ (props.d * 100).toFixed(1) }} cm</span>
    </div>

    <div class="formula-box">
      <div class="formula">EMF = -N · dΦ/dt</div>
      <div class="const">Φ = B·A &nbsp;|&nbsp; I = EMF / R</div>
      <div v-if="props.mode === 'lenz'" class="const" style="color:#ef4444">{{ t('experiments.flParamLenz') }}</div>
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