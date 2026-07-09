<script setup lang="ts">
import type { SpecificHeatTrial } from '../../../composables/specific-heat/useSpecificHeatTrials'
import SpecificHeatReadingsPanel from './panels/SpecificHeatReadingsPanel.vue'
import SpecificHeatChartPanel from './panels/SpecificHeatChartPanel.vue'
import SpecificHeatTrialsPanel from './panels/SpecificHeatTrialsPanel.vue'
import SpecificHeatParamsPanel from './panels/SpecificHeatParamsPanel.vue'
import SpecificHeatLawsPanel from './panels/SpecificHeatLawsPanel.vue'
import SpecificHeatResultsPanel from './panels/SpecificHeatResultsPanel.vue'

interface Props {
  id: string
  trials: SpecificHeatTrial[]
  params: { metalType: string; metalMass: number; waterMass: number; waterTemp: number }
  metalTemp: number
  displayT: number
  finalTemp: number
  cExtracted: number
  cTrue: number
  regressionSlope?: number
  regressionIntercept?: number
  rSquared?: number
  cFromSlope?: number
  unknownMode?: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { metalType: string; metalMass: number; waterMass: number; waterTemp: number }): void
}>()
</script>
<template>
  <div>
    <SpecificHeatReadingsPanel
      v-if="id === 'readings'"
      :metal-type="params.metalType"
      :metal-mass="params.metalMass"
      :water-mass="params.waterMass"
      :water-temp="params.waterTemp"
      :metal-temp="metalTemp"
      :display-t="displayT"
      :unknown-mode="unknownMode"
    />
    <SpecificHeatChartPanel
      v-else-if="id === 'chart'"
      :trials="trials"
      :regression-slope="regressionSlope ?? 0"
      :regression-intercept="regressionIntercept ?? 0"
      :r-squared="rSquared ?? 0"
    />
    <SpecificHeatTrialsPanel
      v-else-if="id === 'trials'"
      :trials="trials"
      :unknown-mode="unknownMode"
      @remove="emit('remove', $event)"
      @clear="emit('clear')"
    />
    <SpecificHeatParamsPanel
      v-else-if="id === 'params'"
      :params="params"
      :unknown-mode="unknownMode"
      @update:params="emit('update:params', $event)"
    />
    <SpecificHeatLawsPanel
      v-else-if="id === 'laws'"
      :metal-mass="params.metalMass"
      :water-mass="params.waterMass"
      :metal-temp="metalTemp"
      :water-temp="params.waterTemp"
      :final-temp="displayT"
      :c-extracted="cExtracted"
      :c-true="cTrue"
    />
    <SpecificHeatResultsPanel
      v-else-if="id === 'results'"
      :trials="trials"
      :regression-slope="regressionSlope ?? 0"
      :r-squared="rSquared ?? 0"
      :c-from-slope="cFromSlope ?? 0"
      :unknown-mode="unknownMode"
    />
  </div>
</template>
