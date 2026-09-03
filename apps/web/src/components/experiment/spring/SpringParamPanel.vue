<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import type { SpringParams } from '../../../modules/physics/experiments/spring/useSpringPhysics'

const params = defineModel<SpringParams>({ required: true })
</script>

<template>
  <div class="lab-card params-card">
    <div class="card-header"><h4>&#x2699;&#xFE0F; {{ t('experiments.params') }}</h4></div>
    <div class="param-row"><label>{{ t('experiments.mass') }} (kg)</label><div class="param-inputs"><input type="range" min="0.1" max="20" step="0.01" v-model.number="params.mass" /><input type="number" min="0.01" max="20" step="0.01" v-model.number="params.mass" /></div></div>
    <div class="param-row"><label>{{ t('experiments.springConstant') }} (N/m)</label><div class="param-inputs"><input type="range" min="5" max="500" step="1" v-model.number="params.k" /><input type="number" step="1" v-model.number="params.k" /></div></div>
    <div class="param-row"><label>{{ t('experiments.amplitude') }} (m)</label><div class="param-inputs"><input type="range" min="0.005" max="0.5" step="0.005" v-model.number="params.amplitude" /><input type="number" min="0.005" max="0.5" step="0.005" v-model.number="params.amplitude" /></div></div>
    <div class="param-row"><label>{{ t('experiments.damping') }}</label><div class="param-inputs"><input type="range" min="0" max="10" step="0.05" v-model.number="params.damping" /><input type="number" step="0.05" v-model.number="params.damping" /></div></div>
    <div class="param-row"><label>{{ t('experiments.dampingModel') }}</label><select v-model="params.dampingModel"><option value="linear">{{ t('experiments.linear') }}</option><option value="quadratic">{{ t('experiments.quadratic') }}</option></select></div>
    <div class="param-row"><label>{{ t('experiments.measureCycles') }}</label><input type="number" min="1" max="20" step="1" v-model.number="params.measureCycles" /></div>
    <div class="param-row"><label>{{ t('experiments.springMass') }} (kg)</label><div class="param-inputs"><input type="range" min="0" max="2" step="0.001" v-model.number="params.springMass" /><input type="number" step="0.001" v-model.number="params.springMass" /></div></div>
  </div>
</template>

<style scoped>
.lab-card { background:#1E2530; border-radius:8px; padding:.6rem; border:1px solid #2D3645; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .3rem; }
.card-header h4 { margin:0; font-size:.82rem; color:#D1D7E0; font-weight:700; }
.param-row { display:flex; flex-direction:column; gap:.1rem; margin-bottom:.25rem; }
.param-row label { font-size:.68rem; color:#8B95A5; font-weight:600; }
.param-row input, .param-row select { padding:.35rem .4rem; border-radius:4px; border:1px solid #2D3645; background:#252D3A; color:#D1D7E0; font-size:.75rem; }
.param-inputs { display:flex; gap:.3rem; align-items:center; }
.param-inputs input[type=range] { flex:1; }
.param-inputs input[type=number] { width:60px; text-align:center; }
</style>
