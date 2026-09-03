<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import type { BiotSavartTrial } from '../../../composables/biot-savart/useBiotSavartTrials'

interface Props { id: string; trials: BiotSavartTrial[]; params: { I: number; r: number; R: number; n: number; shape: 'wire' | 'loop' | 'solenoid' }; B: number }
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { I: number; r: number; R: number; n: number; shape: 'wire' | 'loop' | 'solenoid' }): void
}>()
</script>
<template>
  <div>
    <div v-if="id === 'readings'" class="panel-body">
      <div class="read-row"><span class="label">{{ t('experiments.currentI') }}</span><span class="value">{{ params.I.toFixed(1) }} A</span></div>
      <div class="read-row"><span class="label">{{ t('experiments.distanceR') }}</span><span class="value">{{ params.r.toFixed(3) }} m</span></div>
      <div class="read-row"><span class="label">B</span><span class="value">{{ B.toExponential(2) }} T</span></div>
      <div class="read-row"><span class="label">{{ t('experiments.shapeLabel') }}</span><span class="value">{{ params.shape }}</span></div>
    </div>
    <div v-else-if="id === 'chart'" class="panel-body center">{{ trials.length < 2 ? t('experiments.needTwoTrials') : t('experiments.chartBvsR') }}</div>
    <div v-else-if="id === 'trials'" class="panel-body">
      <div class="trials-header"><span>#</span><span>I</span><span>r</span><span>B</span><span>shape</span><span></span></div>
      <div v-for="t in trials" :key="t.id" class="trial-row">
        <span>{{ t.id }}</span><span>{{ t.I.toFixed(1) }}</span><span>{{ t.r.toFixed(3) }}</span><span>{{ t.B.toExponential(2) }}</span><span>{{ t.shape }}</span>
        <button class="del-btn" @click="emit('remove', t.id)">x</button>
      </div>
      <div v-if="!trials.length" class="no-trials">{{ t('experiments.noTrials') }}</div>
      <div class="trials-actions"><button class="clear-btn" @click="emit('clear')">{{ t('experiments.clearAll') }}</button></div>
    </div>
    <div v-else-if="id === 'params'" class="panel-body">
      <div class="param-row"><label>{{ t('experiments.shapeLabel') }}</label>
        <select :value="params.shape" @change="emit('update:params', { ...params, shape: ($event.target as HTMLSelectElement).value as 'wire' | 'loop' | 'solenoid' })">
          <option value="wire">{{ t('experiments.shapeWire') }}</option><option value="loop">{{ t('experiments.shapeLoop') }}</option><option value="solenoid">{{ t('experiments.shapeSolenoid') }}</option>
        </select>
      </div>
      <div class="param-row"><label>{{ t('experiments.currentI') }} (A)</label><input type="range" :value="params.I" min="0.1" max="20" step="0.1" @input="emit('update:params', { ...params, I: +($event.target as HTMLInputElement).value })" /><span>{{ params.I.toFixed(1) }}</span></div>
      <div class="param-row"><label>{{ t('experiments.distanceR') }} (m)</label><input type="range" :value="params.r" min="0.001" max="1" step="0.001" @input="emit('update:params', { ...params, r: +($event.target as HTMLInputElement).value })" /><span>{{ params.r.toFixed(3) }}</span></div>
      <div class="param-row"><label>{{ t('experiments.loopRadiusR') }} (m)</label><input type="range" :value="params.R" min="0.01" max="1" step="0.01" @input="emit('update:params', { ...params, R: +($event.target as HTMLInputElement).value })" /><span>{{ params.R.toFixed(2) }}</span></div>
      <div class="param-row"><label>{{ t('experiments.turnsPerMeter') }}</label><input type="range" :value="params.n" min="10" max="1000" step="10" @input="emit('update:params', { ...params, n: +($event.target as HTMLInputElement).value })" /><span>{{ params.n }}</span></div>
    </div>
    <div v-else-if="id === 'laws'" class="panel-body">
      <div class="law-box"><div class="law-title">{{ t('experiments.biotSavartWire') }}</div><div class="formula">B = μ₀I / 2πr</div></div>
      <div class="law-box"><div class="law-title">{{ t('experiments.biotSavartLoop') }}</div><div class="formula">B = μ₀IR² / 2(R²+x²)^³⁄₂</div></div>
      <div class="law-box"><div class="law-title">{{ t('experiments.biotSavartSolenoid') }}</div><div class="formula">B = μ₀nI</div></div>
    </div>
    <div v-else-if="id === 'results'" class="panel-body">
      <div class="stat-box"><div class="stat-label">{{ t('experiments.trialCount') }}</div><div class="stat-value">{{ trials.length }}</div></div>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.read-row { display:flex; justify-content:space-between; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,0.02); }
.label { color:#8B95A5; font-size:.72rem; }
.value { color:#D1D7E0; font-weight:600; font-size:.72rem; }
.center { text-align:center; color:#475569; font-size:.75rem; padding:.5rem; }
.trials-header { display:grid; grid-template-columns:30px 1fr 1fr 1fr 1fr 24px; gap:.3rem; font-size:.65rem; color:#5B8DB8; font-weight:700; padding:0 .2rem; border-bottom:1px solid #1e2530; padding-bottom:.25rem; }
.trial-row { display:grid; grid-template-columns:30px 1fr 1fr 1fr 1fr 24px; gap:.3rem; align-items:center; padding:.25rem .2rem; font-size:.65rem; color:#D1D7E0; border-bottom:1px solid rgba(30,37,48,.5); }
.del-btn { width:20px; height:20px; border-radius:50%; border:none; background:transparent; color:#8B95A5; cursor:pointer; font-size:.7rem; display:flex; align-items:center; justify-content:center; }
.del-btn:hover { background:rgba(248,113,113,.15); color:#f87171; }
.no-trials { text-align:center; color:#475569; font-size:.75rem; padding:.5rem; }
.trials-actions { display:flex; justify-content:center; padding-top:.3rem; }
.clear-btn { padding:.25rem .6rem; border-radius:5px; border:1px solid rgba(248,113,113,.3); background:rgba(248,113,113,.08); color:#f87171; font-size:.7rem; cursor:pointer; }
.param-row { display:flex; flex-direction:column; gap:.25rem; margin-bottom:.4rem; }
.param-row label { color:#8B95A5; font-size:.72rem; }
.param-row input[type=range] { width:100%; accent-color:#5B8DB8; }
.param-row select { background:#0d1117; border:1px solid #1e2530; color:#D1D7E0; padding:.3rem .45rem; border-radius:4px; font-size:.72rem; }
.param-row span { color:#5B8DB8; font-weight:600; font-size:.72rem; text-align: end; }
.law-box { background:rgba(91,141,184,.05); border:1px solid rgba(91,141,184,.15); border-radius:6px; padding:.5rem .6rem; margin-bottom:.4rem; }
.law-title { color:#5B8DB8; font-weight:700; font-size:.78rem; margin-bottom:.35rem; }
.formula { font-family:'Courier New', monospace; font-size:.9rem; color:#D1D7E0; text-align:center; margin:.3rem 0; }
.stat-box { background:rgba(255,255,255,0.02); border:1px solid #1e2530; border-radius:6px; padding:.45rem .55rem; display:flex; justify-content:space-between; align-items:center; }
.stat-label { color:#8B95A5; font-size:.72rem; }
.stat-value { color:#D1D7E0; font-weight:700; font-size:.85rem; }
</style>
