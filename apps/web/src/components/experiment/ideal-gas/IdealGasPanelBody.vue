<script setup lang="ts">
import type { IdealGasTrial } from '../../../composables/ideal-gas/useIdealGasTrials'
import IdealGasReadingsPanel from './panels/IdealGasReadingsPanel.vue'
import IdealGasChartPanel from './panels/IdealGasChartPanel.vue'
import IdealGasTrialsPanel from './panels/IdealGasTrialsPanel.vue'
import IdealGasParamsPanel from './panels/IdealGasParamsPanel.vue'
import IdealGasLawsPanel from './panels/IdealGasLawsPanel.vue'
import IdealGasResultsPanel from './panels/IdealGasResultsPanel.vue'

interface Props {
  id: string
  trials: IdealGasTrial[]
  params: { n: number; T: number; V: number }
  p: number
  vRms: number
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { n: number; T: number; V: number }): void
}>()
</script>

<template>
  <div>
    <IdealGasReadingsPanel v-if="id === 'readings'" :n="params.n" :temp="params.T" :vol="params.V" :press="p" :v-rms="vRms" />
    <IdealGasChartPanel v-else-if="id === 'chart'" :trials="trials" />
    <IdealGasTrialsPanel v-else-if="id === 'trials'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
    <IdealGasParamsPanel v-else-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
    <IdealGasLawsPanel v-else-if="id === 'laws'" :n="params.n" :temp="params.T" :vol="params.V" :press="p" />
    <IdealGasResultsPanel v-else-if="id === 'results'" :trials="trials" />
  </div>
</template>
