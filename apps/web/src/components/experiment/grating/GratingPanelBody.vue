<script setup lang="ts">
import type { GratingTrial } from '../../../composables/grating/useGratingTrials'
import GratingReadingsPanel from './panels/GratingReadingsPanel.vue'
import GratingChartPanel from './panels/GratingChartPanel.vue'
import GratingTrialsPanel from './panels/GratingTrialsPanel.vue'
import GratingParamsPanel from './panels/GratingParamsPanel.vue'
import GratingLawsPanel from './panels/GratingLawsPanel.vue'
import GratingResultsPanel from './panels/GratingResultsPanel.vue'

interface Props {
  id: string
  trials: GratingTrial[]
  params: { linesPerMm: number; screenDistance: number; wavelength: number }
  firstOrderAngle: number
  firstOrderY: number
  maxOrder: number
  orderPositions: { m: number; yMm: number; intensity: number }[]
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { linesPerMm: number; screenDistance: number; wavelength: number }): void
}>()
</script>

<template>
  <div>
    <GratingReadingsPanel
      v-if="id === 'readings'"
      :lines-per-mm="params.linesPerMm"
      :screen-distance="params.screenDistance"
      :wavelength="params.wavelength"
      :first-order-angle="firstOrderAngle"
      :first-order-y="firstOrderY"
      :max-order="maxOrder"
    />
    <GratingChartPanel
      v-else-if="id === 'chart'"
      :order-positions="orderPositions"
    />
    <GratingTrialsPanel
      v-else-if="id === 'trials'"
      :trials="trials"
      @remove="emit('remove', $event)"
      @clear="emit('clear')"
    />
    <GratingParamsPanel
      v-else-if="id === 'params'"
      :params="params"
      @update:params="emit('update:params', $event)"
    />
    <GratingLawsPanel
      v-else-if="id === 'laws'"
      :lines-per-mm="params.linesPerMm"
      :screen-distance="params.screenDistance"
      :wavelength="params.wavelength"
      :first-order-angle="firstOrderAngle"
    />
    <GratingResultsPanel
      v-else-if="id === 'results'"
      :trials="trials"
    />
  </div>
</template>
