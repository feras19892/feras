<script setup lang="ts">
import type { PolarizationTrial } from '../../../composables/polarization/usePolarizationTrials'
import PolarizationReadingsPanel from './panels/PolarizationReadingsPanel.vue'
import PolarizationChartPanel from './panels/PolarizationChartPanel.vue'
import PolarizationTrialsPanel from './panels/PolarizationTrialsPanel.vue'
import PolarizationParamsPanel from './panels/PolarizationParamsPanel.vue'
import PolarizationLawsPanel from './panels/PolarizationLawsPanel.vue'
import PolarizationResultsPanel from './panels/PolarizationResultsPanel.vue'

interface Props {
  id: string
  trials: PolarizationTrial[]
  params: { polarizerAngle: number; analyzerAngle: number; I0: number }
  outputIntensity: number
  relativeAngle: number
  transmissionPercent: number
  intensityCurve: { theta: number; intensity: number }[]
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { polarizerAngle: number; analyzerAngle: number; I0: number }): void
}>()
</script>

<template>
  <div>
    <PolarizationReadingsPanel
      v-if="id === 'readings'"
      :polarizer-angle="params.polarizerAngle"
      :analyzer-angle="params.analyzerAngle"
      :i0="params.I0"
      :output-intensity="outputIntensity"
      :relative-angle="relativeAngle"
      :transmission-percent="transmissionPercent"
    />
    <PolarizationChartPanel
      v-else-if="id === 'chart'"
      :intensity-curve="intensityCurve"
      :relative-angle="relativeAngle"
    />
    <PolarizationTrialsPanel
      v-else-if="id === 'trials'"
      :trials="trials"
      @remove="emit('remove', $event)"
      @clear="emit('clear')"
    />
    <PolarizationParamsPanel
      v-else-if="id === 'params'"
      :params="params"
      @update:params="emit('update:params', $event)"
    />
    <PolarizationLawsPanel
      v-else-if="id === 'laws'"
      :polarizer-angle="params.polarizerAngle"
      :analyzer-angle="params.analyzerAngle"
      :i0="params.I0"
      :output-intensity="outputIntensity"
      :relative-angle="relativeAngle"
    />
    <PolarizationResultsPanel
      v-else-if="id === 'results'"
      :trials="trials"
    />
  </div>
</template>
