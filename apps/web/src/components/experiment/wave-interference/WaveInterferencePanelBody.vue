<script setup lang="ts">
import type { WaveInterferenceTrial } from '../../../composables/wave-interference/useWaveInterferenceTrials'
import WaveInterferenceReadingsPanel from './panels/WaveInterferenceReadingsPanel.vue'
import WaveInterferenceChartPanel from './panels/WaveInterferenceChartPanel.vue'
import WaveInterferenceTrialsPanel from './panels/WaveInterferenceTrialsPanel.vue'
import WaveInterferenceParamsPanel from './panels/WaveInterferenceParamsPanel.vue'
import WaveInterferenceLawsPanel from './panels/WaveInterferenceLawsPanel.vue'
import WaveInterferenceResultsPanel from './panels/WaveInterferenceResultsPanel.vue'

interface Props {
  id: string
  trials: WaveInterferenceTrial[]
  params: { sourceDistance: number; wavelength: number; frequency: number; screenDistance: number }
  vWave: number
  constructive: { m: number; yMm: number }[]
  destructive: { m: number; yMm: number }[]
  amplitudeMap: { yMm: number; amplitude: number }[]
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { sourceDistance: number; wavelength: number; frequency: number; screenDistance: number }): void
}>()
</script>

<template>
  <div>
    <WaveInterferenceReadingsPanel v-if="id === 'readings'" :source-distance="params.sourceDistance" :wavelength="params.wavelength" :frequency="params.frequency" :screen-distance="params.screenDistance" :v-wave="vWave" :constructive="constructive" :destructive="destructive" />
    <WaveInterferenceChartPanel v-else-if="id === 'chart'" :amplitude-map="amplitudeMap" />
    <WaveInterferenceTrialsPanel v-else-if="id === 'trials'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
    <WaveInterferenceParamsPanel v-else-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
    <WaveInterferenceLawsPanel v-else-if="id === 'laws'" :source-distance="params.sourceDistance" :wavelength="params.wavelength" :frequency="params.frequency" :screen-distance="params.screenDistance" :v-wave="vWave" />
    <WaveInterferenceResultsPanel v-else-if="id === 'results'" :trials="trials" />
  </div>
</template>
