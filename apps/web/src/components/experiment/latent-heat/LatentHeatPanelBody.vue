<script setup lang="ts">
import type { LatentHeatTrial } from '../../../composables/latent-heat/useLatentHeatTrials'
import LatentHeatReadingsPanel from './panels/LatentHeatReadingsPanel.vue'
import LatentHeatChartPanel from './panels/LatentHeatChartPanel.vue'
import LatentHeatTrialsPanel from './panels/LatentHeatTrialsPanel.vue'
import LatentHeatParamsPanel from './panels/LatentHeatParamsPanel.vue'
import LatentHeatLawsPanel from './panels/LatentHeatLawsPanel.vue'
import LatentHeatResultsPanel from './panels/LatentHeatResultsPanel.vue'

interface Props { id: string; trials: LatentHeatTrial[]; params: { mass: number; phaseType: 'fusion' | 'vaporization'; heatingPower: number }; currentQ: number; totalQ: number; meltedMass: number; remainingMass: number; ratio: number; currentTemp: number }
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { mass: number; phaseType: 'fusion' | 'vaporization'; heatingPower: number }): void
  (e: 'hoverField', field: string): void
}>()
</script>
<template>
  <div>
    <LatentHeatReadingsPanel v-if="id === 'readings'" :mass="params.mass" :phase-type="params.phaseType" :current-q="currentQ" :total-q="totalQ" :melted-mass="meltedMass" :remaining-mass="remainingMass" :current-temp="currentTemp" @hover-field="emit('hoverField', $event)" />
    <LatentHeatChartPanel v-else-if="id === 'chart'" :trials="trials" />
    <LatentHeatTrialsPanel v-else-if="id === 'trials'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
    <LatentHeatParamsPanel v-else-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
    <LatentHeatLawsPanel v-else-if="id === 'laws'" :mass="params.mass" :phase-type="params.phaseType" :current-q="currentQ" :melted-mass="meltedMass" :remaining-mass="remainingMass" />
    <LatentHeatResultsPanel v-else-if="id === 'results'" :trials="trials" />
  </div>
</template>
