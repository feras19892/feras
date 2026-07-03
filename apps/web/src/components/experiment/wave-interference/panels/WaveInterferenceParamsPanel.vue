<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
interface Props { params: { sourceDistance: number; wavelength: number; frequency: number; screenDistance: number } }
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:params', p: { sourceDistance: number; wavelength: number; frequency: number; screenDistance: number }): void }>()
function set(key: string, val: number) { emit('update:params', { ...props.params, [key]: val }) }
</script>

<template>
  <div class="panel-body">
    <div class="param-row">
      <div class="param-header"><span class="param-label">d - Source distance</span><span class="param-val cyan">{{ params.sourceDistance.toFixed(3) }} m</span></div>
      <input class="slider" type="range" min="0.01" max="0.5" step="0.001" :value="params.sourceDistance" @input="set('sourceDistance', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header"><span class="param-label">lambda - Wavelength</span><span class="param-val amber">{{ (params.wavelength * 1000).toFixed(1) }} mm</span></div>
      <input class="slider" type="range" min="0.005" max="0.1" step="0.001" :value="params.wavelength" @input="set('wavelength', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header"><span class="param-label">f - Frequency</span><span class="param-val green">{{ params.frequency }} Hz</span></div>
      <input class="slider" type="range" min="1" max="100" step="1" :value="params.frequency" @input="set('frequency', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header"><span class="param-label">D - Screen distance</span><span class="param-val">{{ params.screenDistance.toFixed(2) }} m</span></div>
      <input class="slider" type="range" min="0.1" max="5" step="0.05" :value="params.screenDistance" @input="set('screenDistance', Number(($event.target as HTMLInputElement).value))" />
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .55rem; font-size: .82rem; padding: .1rem 0; }
.param-row { display: flex; flex-direction: column; gap: .3rem; }
.param-header { display: flex; justify-content: space-between; align-items: center; }
.param-label { font-size: .75rem; color: #8B95A5; }
.param-val { font-family: monospace; color: #67e8f9; font-size: .8rem; font-weight: 700; }
.slider { width: 100%; accent-color: #67e8f9; height: 3px; }
</style>
