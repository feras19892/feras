<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
const props = defineProps<{

  params: { h: number; g: number; mass: number; airResistance: boolean; dragCoeff: number }
}>()
const emit = defineEmits<{
  (e: 'update:params', p: Partial<typeof props.params>): void
}>()
</script>

<template>
  <div class="params-card">
    <div class="param-row"><label>{{ t('experiments.heightLabel') }} (m)</label><div class="param-inputs"><input type="range" min="0.1" max="10" step="0.01" :value="params.h" @input="emit('update:params', { h: Number(($event.target as HTMLInputElement).value) })" /><input type="number" step="0.01" :value="params.h" @input="emit('update:params', { h: Number(($event.target as HTMLInputElement).value) })" /></div></div>
    <div class="param-row"><label>g (m/s²)</label><div class="param-inputs"><input type="range" min="1" max="50" step="0.1" :value="params.g" @input="emit('update:params', { g: Number(($event.target as HTMLInputElement).value) })" /><input type="number" step="0.1" :value="params.g" @input="emit('update:params', { g: Number(($event.target as HTMLInputElement).value) })" /></div></div>
    <div class="param-row"><label>{{ t('experiments.mass') }} (kg)</label><div class="param-inputs"><input type="range" min="0.01" max="10" step="0.01" :value="params.mass" @input="emit('update:params', { mass: Number(($event.target as HTMLInputElement).value) })" /><input type="number" step="0.01" :value="params.mass" @input="emit('update:params', { mass: Number(($event.target as HTMLInputElement).value) })" /></div></div>
    <div class="param-row checkbox"><label><input type="checkbox" :checked="params.airResistance" @change="emit('update:params', { airResistance: ($event.target as HTMLInputElement).checked })" /> {{ t('experiments.airResistance') }}</label></div>
    <div class="param-row" v-if="params.airResistance"><label>{{ t('experiments.drag') }}</label><div class="param-inputs"><input type="range" min="0" max="2" step="0.01" :value="params.dragCoeff" @input="emit('update:params', { dragCoeff: Number(($event.target as HTMLInputElement).value) })" /><input type="number" step="0.01" :value="params.dragCoeff" @input="emit('update:params', { dragCoeff: Number(($event.target as HTMLInputElement).value) })" /></div></div>
  </div>
</template>

<style scoped>
.params-card { background: #1E2530; border-radius: 8px; padding: .6rem; border: 1px solid #2D3645; }
.param-row { display: flex; flex-direction: column; gap: .1rem; margin-bottom: .25rem; }
.param-row label { font-size: .68rem; color: #8B95A5; font-weight: 600; }
.param-row input, .param-row select { padding: .35rem .4rem; border-radius: 4px; border: 1px solid #2D3645; background: #252D3A; color: #D1D7E0; font-size: .75rem; }
.param-inputs { display: flex; gap: .3rem; align-items: center; }
.param-inputs input[type=range] { flex: 1; }
.param-inputs input[type=number] { width: 60px; text-align: center; }
.param-row.checkbox { flex-direction: row; align-items: center; gap: .3rem; }
.param-row.checkbox input { width: auto; }
</style>