<script setup lang="ts">
import type { ChemistryExperimentApi } from '../../../composables/chemistry/useChemistryExperiment'
import ChemPanelBody from './ChemPanelBody.vue'

const props = defineProps<{
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  ex: ChemistryExperimentApi
}>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
}>()

const ids = ['inventory', 'tools', 'readings', 'instructions', 'report']
</script>

<template>
  <div class="overlay-wrap">
    <div v-for="id in ids" :key="id" v-show="maximized[id]" class="overlay-panel">
      <div class="overlay-header">
        <h4>{{ panelTitle(id) }}</h4>
        <button class="close-btn" @click="emit('maximize', id)">&#x2715;</button>
      </div>
      <ChemPanelBody :id="id" :ex="ex" />
    </div>
  </div>
</template>

<style scoped>
.overlay-wrap { position: fixed; inset: 0; z-index: 100; pointer-events: none; }
.overlay-panel { position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 520px; max-width: 90vw; max-height: 80vh; background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: .75rem; display: flex; flex-direction: column; gap: .5rem; pointer-events: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.overlay-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: .25rem; }
.overlay-header h4 { margin: 0; font-size: .85rem; color: #67e8f9; }
.close-btn { background: none; border: none; color: #8B95A5; cursor: pointer; font-size: .8rem; }
.close-btn:hover { color: #ef4444; }
</style>
