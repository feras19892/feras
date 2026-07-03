<script setup lang="ts">
import type { ThermalExpansionTrial } from '../../../composables/thermal-expansion/useThermalExpansionTrials'
import ThermalExpansionReadingsPanel from './panels/ThermalExpansionReadingsPanel.vue'
import ThermalExpansionChartPanel from './panels/ThermalExpansionChartPanel.vue'
import ThermalExpansionTrialsPanel from './panels/ThermalExpansionTrialsPanel.vue'
import ThermalExpansionParamsPanel from './panels/ThermalExpansionParamsPanel.vue'
import ThermalExpansionLawsPanel from './panels/ThermalExpansionLawsPanel.vue'
import ThermalExpansionResultsPanel from './panels/ThermalExpansionResultsPanel.vue'

interface Props { id: string; trials: ThermalExpansionTrial[]; params: { material: string; L0: number; t0: number; t1: number }; alpha: number; dL: number; L1: number }
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { material: string; L0: number; t0: number; t1: number }): void
}>()
</script>
<template>
  <div>
    <ThermalExpansionReadingsPanel v-if="id === 'readings'" :material="params.material" :L0="params.L0" :t0="params.t0" :t1="params.t1" :dL="dL" :L1="L1" :alpha="alpha" />
    <ThermalExpansionChartPanel v-else-if="id === 'chart'" :trials="trials" />
    <ThermalExpansionTrialsPanel v-else-if="id === 'trials'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
    <ThermalExpansionParamsPanel v-else-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
    <ThermalExpansionLawsPanel v-else-if="id === 'laws'" :L0="params.L0" :t0="params.t0" :t1="params.t1" :alpha="alpha" :dL="dL" />
    <ThermalExpansionResultsPanel v-else-if="id === 'results'" :trials="trials" />
  </div>
</template>
