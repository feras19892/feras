<script setup lang="ts">
import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'

const params = defineModel<SpringParams>({ required: true })
</script>

<template>
  <div class="lab-card params-card">
    <div class="card-header"><h4>⚙️ معاملات</h4></div>
    <div class="param-row">
      <label>الكتلة (kg)</label>
      <div class="param-inputs">
        <input type="range" min="0.1" max="2" step="0.01" v-model.number="params.mass" />
        <input type="number" step="0.01" v-model.number="params.mass" />
      </div>
    </div>
    <div class="param-row">
      <label>ثابت النابض (N/m)</label>
      <div class="param-inputs">
        <input type="range" min="5" max="200" step="1" v-model.number="params.k" />
        <input type="number" step="1" v-model.number="params.k" />
      </div>
    </div>
    <div class="param-row">
      <label>السعة (m)</label>
      <div class="param-inputs">
        <input type="range" min="0.05" max="0.5" step="0.01" v-model.number="params.amplitude" />
        <input type="number" step="0.01" v-model.number="params.amplitude" />
      </div>
    </div>
    <div class="param-row">
      <label>التخميد</label>
      <div class="param-inputs">
        <input type="range" min="0" max="5" step="0.05" v-model.number="params.damping" />
        <input type="number" step="0.05" v-model.number="params.damping" />
      </div>
    </div>
    <div class="param-row">
      <label>نمط التخميد</label>
      <select v-model="params.dampingModel">
        <option value="linear">خطي</option>
        <option value="quadratic">تربيعي</option>
      </select>
    </div>
    <div class="param-row">
      <label>دورات القياس</label>
      <input type="number" min="1" max="20" step="1" v-model.number="params.measureCycles" />
    </div>
  </div>
</template>

<style scoped>
.param-row { display: flex; flex-direction: column; gap: 0.2rem; margin-bottom: 0.5rem; }
.param-row label { font-size: 0.7rem; color: #94a3b8; }
.param-inputs { display: flex; gap: 0.35rem; align-items: center; }
.param-inputs input[type="range"] { flex: 1; }
.param-inputs input[type="number"] { width: 60px; padding: 0.2rem 0.35rem; border-radius: 0.3rem; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.75rem; }
.param-row select, .param-row input[type="number"] {
  padding: 0.25rem 0.4rem; border-radius: 0.3rem; border: 1px solid #334155;
  background: #0f172a; color: #e2e8f0; font-size: 0.75rem;
}
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.card-header h4 { margin: 0; font-size: 0.85rem; color: #67e8f9; }
</style>
