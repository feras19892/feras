<script setup lang="ts">
import type { BoylesLawTrial } from '../../../composables/boyles-law/useBoylesLawTrials'
import BoylesLawReadingsPanel from './panels/BoylesLawReadingsPanel.vue'
import BoylesLawChartPanel from './panels/BoylesLawChartPanel.vue'
import BoylesLawTrialsPanel from './panels/BoylesLawTrialsPanel.vue'
import BoylesLawParamsPanel from './panels/BoylesLawParamsPanel.vue'
import BoylesLawLawsPanel from './panels/BoylesLawLawsPanel.vue'
import BoylesLawResultsPanel from './panels/BoylesLawResultsPanel.vue'

interface Props { id: string; trials: BoylesLawTrial[]; params: { p: number; v: number; n: number; T: number }; pv: number; constTarget: number }
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { p: number; v: number; n: number; T: number }): void
}>()
</script>
<template>
  <div>
    <BoylesLawReadingsPanel v-if="id === 'readings'" :p="params.p" :v="params.v" :pv="pv" :n="params.n" :T="params.T" />
    <BoylesLawChartPanel v-else-if="id === 'chart'" :trials="trials" />
    <BoylesLawTrialsPanel v-else-if="id === 'trials'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
    <BoylesLawParamsPanel v-else-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
    <BoylesLawLawsPanel v-else-if="id === 'laws'" :p="params.p" :v="params.v" :pv="pv" :n="params.n" :T="params.T" :const-target="constTarget" />
    <BoylesLawResultsPanel v-else-if="id === 'results'" :trials="trials" />
  </div>
</template>
