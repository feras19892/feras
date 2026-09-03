<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
interface Props {
  params: { tubeLength: number; frequency: number; temperature: number; harmonic: 1 | 3 }
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:params', p: { tubeLength: number; frequency: number; temperature: number; harmonic: 1 | 3 }): void
}>()

function set(key: string, val: number) {
  emit('update:params', { ...props.params, [key]: val })
}
</script>

<template>
  <div class="panel-body">
    <div class="param-row">
      <div class="param-header">
        <span class="param-label">L — Tube length</span>
        <span class="param-val cyan">{{ params.tubeLength.toFixed(3) }} m</span>
      </div>
      <input class="slider" type="range" min="0.05" max="2.0" step="0.005"
        :value="params.tubeLength"
        @input="set('tubeLength', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header">
        <span class="param-label">f — Frequency</span>
        <span class="param-val amber">{{ params.frequency }} Hz</span>
      </div>
      <input class="slider" type="range" min="20" max="2000" step="5"
        :value="params.frequency"
        @input="set('frequency', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header">
        <span class="param-label">T — Temperature</span>
        <span class="param-val green">{{ params.temperature }}°C</span>
      </div>
      <input class="slider" type="range" min="-10" max="50" step="1"
        :value="params.temperature"
        @input="set('temperature', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header">
        <span class="param-label">Harmonic</span>
      </div>
      <div class="harmonic-btns">
        <button class="harmonic-btn" :class="{ active: params.harmonic === 1 }" @click="set('harmonic', 1)">1st (λ/4)</button>
        <button class="harmonic-btn" :class="{ active: params.harmonic === 3 }" @click="set('harmonic', 3)">3rd (3λ/4)</button>
      </div>
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
.harmonic-btns { display: flex; gap: .3rem; }
.harmonic-btn { flex: 1; padding: .25rem; border-radius: 4px; border: 1px solid #2D3645; background: #0d1117; color: #8B95A5; font-size: .7rem; cursor: pointer; }
.harmonic-btn.active { background: rgba(91,141,184,.15); border-color: #5B8DB8; color: #5B8DB8; font-weight: 600; }
</style>