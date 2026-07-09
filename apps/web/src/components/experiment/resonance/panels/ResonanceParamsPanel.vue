<script setup lang="ts">
interface Props { params: { stringLength: number; tension: number; harmonic: number; damping: number } }
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:params', p: { stringLength: number; tension: number; harmonic: number; damping: number }): void }>()
function set(key: string, val: number) { emit('update:params', { ...props.params, [key]: val }) }
</script>

<template>
  <div class="panel-body">
    <div class="param-row">
      <div class="param-header"><span class="param-label">L - String length</span><span class="param-val cyan">{{ params.stringLength.toFixed(2) }} m</span></div>
      <input class="slider" type="range" min="0.1" max="3.0" step="0.01" :value="params.stringLength" @input="set('stringLength', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header"><span class="param-label">T - Tension</span><span class="param-val amber">{{ params.tension }} N</span></div>
      <input class="slider" type="range" min="1" max="100" step="1" :value="params.tension" @input="set('tension', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header"><span class="param-label">n - Harmonic</span><span class="param-val green">{{ params.harmonic }}</span></div>
      <input class="slider" type="range" min="1" max="10" step="1" :value="params.harmonic" @input="set('harmonic', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header"><span class="param-label">gamma - Damping</span><span class="param-val red">{{ params.damping.toFixed(2) }}</span></div>
      <input class="slider" type="range" min="0" max="2" step="0.01" :value="params.damping" @input="set('damping', Number(($event.target as HTMLInputElement).value))" />
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .55rem; font-size: .82rem; padding: .1rem 0; }
.param-row { display: flex; flex-direction: column; gap: .3rem; }
.param-header { display: flex; justify-content: space-between; align-items: center; }
.param-label { font-size: .75rem; color: #8B95A5; }
.param-val { font-family: monospace; color: #67e8f9; font-size: .8rem; font-weight: 700; }
.red { color: #f87171; }
.slider { width: 100%; accent-color: #67e8f9; height: 3px; }
</style>
