<script setup lang="ts">
import type { SpeedOfSoundTrial } from '../../../composables/speed-of-sound/useSpeedOfSoundTrials'
import SpeedOfSoundReadingsPanel from './panels/SpeedOfSoundReadingsPanel.vue'
import SpeedOfSoundChartPanel from './panels/SpeedOfSoundChartPanel.vue'
import SpeedOfSoundTrialsPanel from './panels/SpeedOfSoundTrialsPanel.vue'
import SpeedOfSoundParamsPanel from './panels/SpeedOfSoundParamsPanel.vue'
import SpeedOfSoundLawsPanel from './panels/SpeedOfSoundLawsPanel.vue'
import SpeedOfSoundResultsPanel from './panels/SpeedOfSoundResultsPanel.vue'

interface Props {
  id: string
  trials: SpeedOfSoundTrial[]
  params: { tubeLength: number; frequency: number; temperature: number; harmonic: 1 | 3 }
  wavelength: number
  vMeasured: number
  vTheory: number
  percentError: number
  waveformData: { x: number; y: number }[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
  vFromRegression: number | null
  endCorrection: number | null
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { tubeLength: number; frequency: number; temperature: number; harmonic: 1 | 3 }): void
}>()
</script>

<template>
  <div>
    <SpeedOfSoundReadingsPanel
      v-if="id === 'readings'"
      :tube-length="params.tubeLength"
      :frequency="params.frequency"
      :temperature="params.temperature"
      :harmonic="params.harmonic"
      :wavelength="wavelength"
      :v-measured="vMeasured"
      :v-theory="vTheory"
      :percent-error="percentError"
    />
    <SpeedOfSoundChartPanel
      v-else-if="id === 'chart'"
      :trials="trials"
      :regression-slope="regressionSlope"
      :regression-intercept="regressionIntercept"
      :r-squared="rSquared"
      :waveform-data="waveformData"
    />
    <SpeedOfSoundTrialsPanel v-else-if="id === 'trials'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
    <SpeedOfSoundParamsPanel v-else-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
    <SpeedOfSoundLawsPanel v-else-if="id === 'laws'" :tube-length="params.tubeLength" :frequency="params.frequency" :temperature="params.temperature" :harmonic="params.harmonic" :wavelength="wavelength" :v-measured="vMeasured" :v-theory="vTheory" />
    <SpeedOfSoundResultsPanel
      v-else-if="id === 'results'"
      :trials="trials"
      :regression-slope="regressionSlope"
      :regression-intercept="regressionIntercept"
      :r-squared="rSquared"
      :v-from-regression="vFromRegression"
      :end-correction="endCorrection"
    />
  </div>
</template>
