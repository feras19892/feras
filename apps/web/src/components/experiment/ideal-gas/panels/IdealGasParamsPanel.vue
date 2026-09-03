<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
const props = defineProps<{ params: { n: number; T: number; V: number } }>()

const emit = defineEmits<{ (e: 'update:params', p: { n: number; T: number; V: number }): void }>()
</script>

<template>
  <div class="params-panel">
    <div class="field">
      <label>{{ t('experiments.idealGasMoles') }} n (mol)</label>
      <input type="range" min="0.1" max="5" step="0.1" :value="params.n" @input="emit('update:params', { ...params, n: Number(($event.target as HTMLInputElement).value) })" />
      <span class="val">{{ params.n.toFixed(1) }}</span>
    </div>
    <div class="field">
      <label>{{ t('experiments.idealGasTemp') }} T (K)</label>
      <input type="range" min="200" max="600" step="10" :value="params.T" @input="emit('update:params', { ...params, T: Number(($event.target as HTMLInputElement).value) })" />
      <span class="val">{{ params.T }}</span>
    </div>
    <div class="field">
      <label>{{ t('experiments.idealGasVolume') }} V (L)</label>
      <input type="range" min="5" max="100" step="1" :value="params.V * 1000" @input="emit('update:params', { ...params, V: Number(($event.target as HTMLInputElement).value) / 1000 })" />
      <span class="val">{{ (params.V * 1000).toFixed(1) }}</span>
    </div>
  </div>
</template>

<style scoped>
.params-panel { display:flex; flex-direction:column; gap:.6rem; }
.field { display:flex; flex-direction:column; gap:.2rem; }
.field label { font-size:.72rem; color:#8B95A5; }
.field input[type=range] { width:100%; }
.val { font-size:.8rem; color:#5B8DB8; font-weight:700; }
</style>