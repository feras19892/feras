<script setup lang="ts">
import type { SpringParams } from '../../../modules/physics/experiments/spring/useSpringPhysics'

const params = defineModel<SpringParams>({ required: true })
</script>

<template>
  <div class="lab-card params-card">
    <div class="card-header"><h4>&#x2699;&#xFE0F; معاملات</h4></div>
    <div class="param-row"><label>الكتلة (kg)</label><div class="param-inputs"><input type="range" min="0.1" max="999" step="0.01" v-model.number="params.mass" /><input type="number" step="0.01" v-model.number="params.mass" /></div></div>
    <div class="param-row"><label>ثابت النابض (N/m)</label><div class="param-inputs"><input type="range" min="5" max="9999" step="1" v-model.number="params.k" /><input type="number" step="1" v-model.number="params.k" /></div></div>
    <div class="param-row"><label>السعة (m)</label><div class="param-inputs"><input type="range" min="0.05" max="50" step="0.01" v-model.number="params.amplitude" /><input type="number" step="0.01" v-model.number="params.amplitude" /></div></div>
    <div class="param-row"><label>التخميد</label><div class="param-inputs"><input type="range" min="0" max="999" step="0.05" v-model.number="params.damping" /><input type="number" step="0.05" v-model.number="params.damping" /></div></div>
    <div class="param-row"><label>نمط التخميد</label><select v-model="params.dampingModel"><option value="linear">خطي</option><option value="quadratic">تربيعي</option></select></div>
    <div class="param-row"><label>دورات القياس</label><input type="number" min="1" max="20" step="1" v-model.number="params.measureCycles" /></div>
    <div class="param-row"><label>كتلة النابض (kg)</label><div class="param-inputs"><input type="range" min="0" max="2" step="0.001" v-model.number="params.springMass" /><input type="number" step="0.001" v-model.number="params.springMass" /></div></div>
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
