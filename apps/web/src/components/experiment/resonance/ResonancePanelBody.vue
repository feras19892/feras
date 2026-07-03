<script setup lang="ts">
import type { ResonanceTrial } from '../../../composables/resonance/useResonanceTrials'
import ResonanceReadingsPanel from './panels/ResonanceReadingsPanel.vue'
import ResonanceChartPanel from './panels/ResonanceChartPanel.vue'
import ResonanceTrialsPanel from './panels/ResonanceTrialsPanel.vue'
import ResonanceParamsPanel from './panels/ResonanceParamsPanel.vue'
import ResonanceLawsPanel from './panels/ResonanceLawsPanel.vue'
import ResonanceResultsPanel from './panels/ResonanceResultsPanel.vue'

interface Props {
  id: string
  trials: ResonanceTrial[]
  params: { stringLength: number; tension: number; harmonic: number }
  frequency: number
  wavelength: number
  waveSpeed: number
  waveformData: { x: number; y: number }[]
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { stringLength: number; tension: number; harmonic: number }): void
}>()
</script>

<template>
  <div>
    <ResonanceReadingsPanel v-if="id === 'readings'" :string-length="params.stringLength" :tension="params.tension" :harmonic="params.harmonic" :frequency="frequency" :wavelength="wavelength" :wave-speed="waveSpeed" />
    <ResonanceChartPanel v-else-if="id === 'chart'" :waveform-data="waveformData" />
    <ResonanceTrialsPanel v-else-if="id === 'trials'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
    <ResonanceParamsPanel v-else-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
    <ResonanceLawsPanel v-else-if="id === 'laws'" :string-length="params.stringLength" :tension="params.tension" :harmonic="params.harmonic" :frequency="frequency" :wavelength="wavelength" :wave-speed="waveSpeed" />
    <ResonanceResultsPanel v-else-if="id === 'results'" :trials="trials" />
  </div>
</template>
