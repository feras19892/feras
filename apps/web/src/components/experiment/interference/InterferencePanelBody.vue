<script setup lang="ts">
import type { InterferenceTrial } from '../../../composables/interference/useInterferenceTrials'
import InterferenceReadingsPanel from './panels/InterferenceReadingsPanel.vue'
import InterferenceChartPanel from './panels/InterferenceChartPanel.vue'
import InterferenceTrialsPanel from './panels/InterferenceTrialsPanel.vue'
import InterferenceParamsPanel from './panels/InterferenceParamsPanel.vue'
import InterferenceLawsPanel from './panels/InterferenceLawsPanel.vue'
import InterferenceResultsPanel from './panels/InterferenceResultsPanel.vue'

interface Props {
  id: string
  trials: InterferenceTrial[]
  params: { slitDistance: number; screenDistance: number; wavelength: number; slitWidth: number }
  fringeSpacing: number
  angularSeparation: number
  intensityPattern: { xMm: number; intensity: number }[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
  lambdaFromRegression: number | null
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', params: { slitDistance: number; screenDistance: number; wavelength: number; slitWidth: number }): void
}>()
</script>

<template>
  <div>
    <InterferenceReadingsPanel
      v-if="id === 'readings'"
      :slit-distance="params.slitDistance"
      :screen-distance="params.screenDistance"
      :wavelength="params.wavelength"
      :slit-width="params.slitWidth"
      :fringe-spacing="fringeSpacing"
      :angular-separation="angularSeparation"
    />
    <InterferenceChartPanel
      v-else-if="id === 'chart'"
      :trials="trials"
      :regression-slope="regressionSlope"
      :regression-intercept="regressionIntercept"
      :r-squared="rSquared"
      :intensity-pattern="intensityPattern"
    />
    <InterferenceTrialsPanel
      v-else-if="id === 'trials'"
      :trials="trials"
      @remove="emit('remove', $event)"
      @clear="emit('clear')"
    />
    <InterferenceParamsPanel
      v-else-if="id === 'params'"
      :params="params"
      @update:params="emit('update:params', $event)"
    />
    <InterferenceLawsPanel
      v-else-if="id === 'laws'"
      :slit-distance="params.slitDistance"
      :screen-distance="params.screenDistance"
      :wavelength="params.wavelength"
      :fringe-spacing="fringeSpacing"
    />
    <InterferenceResultsPanel
      v-else-if="id === 'results'"
      :trials="trials"
      :regression-slope="regressionSlope"
      :regression-intercept="regressionIntercept"
      :r-squared="rSquared"
      :lambda-from-regression="lambdaFromRegression"
      :theoretical-lambda="params.wavelength"
      :screen-distance="params.screenDistance"
    />
  </div>
</template>
