<script setup lang="ts">
import type { PendulumParams } from '../../../modules/physics/experiments/pendulum/usePendulumPhysics'
import PendulumEnvSelector from './PendulumEnvSelector.vue'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const params = defineModel<PendulumParams>({ required: true })
</script>

<template>
  <div class="lab-card params-card">
    <div class="card-header"><h4>&#x2699;&#xFE0F; {{ t('experiments.parameters') }}</h4></div>
    <PendulumEnvSelector v-model="params.g" />
    <div class="param-row"><label>{{ t('experiments.stringLength') }} (m)</label><div class="param-inputs"><input type="range" min="0.10" max="2.00" step="0.01" v-model.number="params.length" /><input type="number" step="0.01" v-model.number="params.length" /></div></div>
    <div class="param-row"><label>{{ t('experiments.initialAngle') }} (°)</label><div class="param-inputs"><input type="range" min="1" max="90" step="1" v-model.number="params.theta0Deg" /><input type="number" step="1" v-model.number="params.theta0Deg" /></div></div>
    <div v-if="params.theta0Deg > 15" class="angle-warning">⚠️ {{ t('experiments.largeAngleWarning') }}</div>
    <div class="param-row"><label>{{ t('experiments.bobMass') }} (kg)</label><div class="param-inputs"><input type="range" min="0.01" max="0.50" step="0.01" v-model.number="params.mass" /><input type="number" step="0.01" v-model.number="params.mass" /></div></div>
    <div class="param-row"><label>{{ t('experiments.gravityAccel') }} (m/s²)</label><div class="param-inputs"><input type="range" min="1.60" max="20.00" step="0.01" v-model.number="params.g" /><input type="number" step="0.01" v-model.number="params.g" /></div></div>
    <div class="param-row"><label>{{ t('experiments.damping') }}</label><div class="param-inputs"><input type="range" min="0" max="0.5" step="0.01" v-model.number="params.damping" /><input type="number" step="0.01" v-model.number="params.damping" /></div></div>
    <div class="param-row"><label>{{ t('experiments.ballRadius') }} (m)</label><div class="param-inputs"><input type="range" min="0.005" max="0.15" step="0.001" v-model.number="params.bobRadius" /><input type="number" step="0.001" v-model.number="params.bobRadius" /></div></div>
    <div class="param-row"><label>{{ t('experiments.airDensity') }} (kg/m³)</label><div class="param-inputs"><input type="range" min="0" max="1.3" step="0.01" v-model.number="params.airDensity" /><input type="number" step="0.01" v-model.number="params.airDensity" /></div></div>
    <div class="param-row"><label>{{ t('experiments.springConstant') }} k (N/m)</label><div class="param-inputs"><input type="range" min="0" max="50" step="0.5" v-model.number="params.springK" /><input type="number" step="0.5" v-model.number="params.springK" /></div></div>
    <div class="param-row"><label>{{ t('experiments.measureCycles') }}</label><input type="number" min="5" max="50" step="1" v-model.number="params.measureCycles" /></div>
  </div>
</template>

<style scoped>
.lab-card { background:linear-gradient(145deg,rgba(30,41,59,0.9),rgba(15,23,42,0.85)); border-radius:10px; padding:.7rem; border:1px solid rgba(71,85,105,0.3); box-shadow:0 4px 12px rgba(0,0,0,.15); }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .4rem; }
.card-header h4 { margin:0; font-size:.85rem; color:#e2e8f0; font-weight:800; }
.param-row { display:flex; flex-direction:column; gap:.15rem; margin-bottom:.3rem; }
.param-row label { font-size:.72rem; color:#94a3b8; font-weight:700; }
.param-row input, .param-row select { padding:.4rem .5rem; border-radius:6px; border:1px solid rgba(71,85,105,0.4); background:rgba(15,23,42,0.6); color:#e2e8f0; font-size:.75rem; transition:all .15s; }
.param-row input:focus, .param-row select:focus { outline:none; border-color:#60a5fa; box-shadow:0 0 0 2px rgba(96,165,250,0.15); }
.param-inputs { display:flex; gap:.4rem; align-items:center; }
.param-inputs input[type=range] { flex:1; -webkit-appearance:none; appearance:none; height:6px; border-radius:3px; background:#334155; outline:none; cursor:pointer; }
.param-inputs input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:16px; height:16px; border-radius:50%; background:linear-gradient(135deg,#60a5fa,#3b82f6); cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,.3); border:2px solid #1e293b; }
.param-inputs input[type=range]::-moz-range-thumb { width:16px; height:16px; border-radius:50%; background:linear-gradient(135deg,#60a5fa,#3b82f6); cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,.3); border:2px solid #1e293b; }
.param-inputs input[type=number] { width:64px; text-align:center; font-weight:700; font-family:monospace; }
.angle-warning { font-size:.68rem; color:#fbbf24; background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.25); border-radius:5px; padding:.25rem .4rem; margin:-.15rem 0 .2rem; text-align:center; }
</style>
