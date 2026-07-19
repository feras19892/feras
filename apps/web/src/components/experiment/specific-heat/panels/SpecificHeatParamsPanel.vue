<script setup lang="ts">
import { METAL_CATALOG } from '../../../../composables/specific-heat/useSpecificHeatCalculations'
const props = defineProps<{
  params: { metalType: string; metalMass: number; waterMass: number; waterTemp: number }
  unknownMode?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:params', p: { metalType: string; metalMass: number; waterMass: number; waterTemp: number }): void
}>()
</script>
<template>
  <div class="panel-body">
    <div class="param-row"><label>المعدن المجهول</label>
      <select v-if="!unknownMode" :value="params.metalType" @change="emit('update:params', { ...params, metalType: ($event.target as HTMLSelectElement).value })">
        <option v-for="(m, key) in METAL_CATALOG" :key="key" :value="key">{{ m.nameAr }}</option>
      </select>
      <div v-else class="unknown-badge">❓ مجهول</div>
    </div>
    <div class="param-row"><label>كتلة المعدن m_m (g)</label>
      <input type="range" :value="params.metalMass*1000" min="50" max="200" step="10"
             @input="emit('update:params', { ...params, metalMass: +($event.target as HTMLInputElement).value/1000 })" />
      <span>{{ (params.metalMass*1000).toFixed(0) }} g</span>
    </div>
    <div class="param-row"><label>كتلة الماء m_w (g)</label>
      <input type="range" :value="params.waterMass*1000" min="100" max="300" step="10"
             @input="emit('update:params', { ...params, waterMass: +($event.target as HTMLInputElement).value/1000 })" />
      <span>{{ (params.waterMass*1000).toFixed(0) }} g</span>
    </div>
    <div class="param-row"><label>حرارة الماء البارد T_w (°C)</label>
      <input type="range" :value="params.waterTemp" min="5" max="35" step="1"
             @input="emit('update:params', { ...params, waterTemp: +($event.target as HTMLInputElement).value })" />
      <span>{{ params.waterTemp }}°C</span>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.param-row { display:flex; flex-direction:column; gap:.25rem; margin-bottom:.4rem; }
.param-row label { color:#8B95A5; font-size:.72rem; }
.param-row input[type=range] { width:100%; accent-color:#5B8DB8; }
.param-row select { background:#0d1117; border:1px solid #1e2530; color:#D1D7E0; padding:.3rem .45rem; border-radius:4px; font-size:.72rem; }
.param-row span { color:#5B8DB8; font-weight:600; font-size:.72rem; text-align: end; }
.unknown-badge { background:rgba(245,158,11,.12); border:1px solid rgba(245,158,11,.3); color:#fbbf24; font-size:.72rem; font-weight:700; padding:.35rem .45rem; border-radius:4px; text-align:center; }
</style>
