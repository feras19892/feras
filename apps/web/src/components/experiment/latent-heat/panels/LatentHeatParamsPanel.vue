<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
const props = defineProps<{ params: { mass: number; phaseType: 'fusion' | 'vaporization'; heatingPower: number } }>()
const emit = defineEmits<{ (e: 'update:params', p: { mass: number; phaseType: 'fusion' | 'vaporization'; heatingPower: number }): void }>()
</script>
<template>
  <div class="panel-body">
    <div class="param-row">
      <label>الكتلة (kg)</label>
      <input type="range" :value="params.mass" min="0.1" max="2" step="0.05" @input="emit('update:params', { ...params, mass: +($event.target as HTMLInputElement).value })" />
      <span>{{ params.mass.toFixed(2) }}</span>
    </div>
    <div class="param-row">
      <label>نوع التحول</label>
      <select :value="params.phaseType" @change="emit('update:params', { ...params, phaseType: ($event.target as HTMLSelectElement).value as 'fusion' | 'vaporization' })">
        <option value="fusion">انصهار (ثلج → ماء)</option>
        <option value="vaporization">تبخر (ماء → بخار)</option>
      </select>
    </div>
    <div class="param-row">
      <label>قوة التسخين (W)</label>
      <input type="range" :value="params.heatingPower" min="100" max="2000" step="50" @input="emit('update:params', { ...params, heatingPower: +($event.target as HTMLInputElement).value })" />
      <span>{{ params.heatingPower }}</span>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.6rem; }
.param-row { display:flex; flex-direction:column; gap:.25rem; }
.param-row label { color:#8B95A5; font-size:.72rem; }
.param-row input[type=range] { width:100%; accent-color:#5B8DB8; }
.param-row select { background:#0d1117; border:1px solid #1e2530; color:#D1D7E0; padding:.3rem .45rem; border-radius:4px; font-size:.72rem; }
.param-row span { color:#5B8DB8; font-weight:600; font-size:.72rem; text-align: end; }
</style>