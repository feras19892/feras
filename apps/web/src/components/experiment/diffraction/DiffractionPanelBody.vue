<script setup lang="ts">
import type { DiffractionTrial } from '../../../composables/diffraction/useDiffractionTrials'
import DiffractionReadingsPanel from './panels/DiffractionReadingsPanel.vue'
import DiffractionChartPanel from './panels/DiffractionChartPanel.vue'
import DiffractionTrialsPanel from './panels/DiffractionTrialsPanel.vue'
import DiffractionParamsPanel from './panels/DiffractionParamsPanel.vue'
import DiffractionLawsPanel from './panels/DiffractionLawsPanel.vue'
import DiffractionResultsPanel from './panels/DiffractionResultsPanel.vue'

interface Props {
  id: string
  mode: 'single' | 'grating'
  trials: DiffractionTrial[]
  params: { slitWidth: number; linesPerMm: number; screenDistance: number; wavelength: number }
  centralWidth: number
  darkFringes: { m: number; yMm: number }[]
  intensityPattern: { yMm: number; intensity: number }[]
  firstOrderAngle: number
  firstOrderY: number
  maxOrder: number
  orderPositions: { m: number; yMm: number; intensity: number }[]
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { slitWidth: number; linesPerMm: number; screenDistance: number; wavelength: number }): void
}>()
</script>

<template>
  <div>
    <DiffractionReadingsPanel
      v-if="id === 'readings'"
      :mode="mode"
      :slit-width="params.slitWidth"
      :lines-per-mm="params.linesPerMm"
      :screen-distance="params.screenDistance"
      :wavelength="params.wavelength"
      :central-width="centralWidth"
      :dark-fringes="darkFringes"
      :first-order-angle="firstOrderAngle"
      :first-order-y="firstOrderY"
      :max-order="maxOrder"
    />
    <DiffractionChartPanel
      v-else-if="id === 'chart'"
      :mode="mode"
      :intensity-pattern="intensityPattern"
      :order-positions="orderPositions"
    />
    <DiffractionTrialsPanel
      v-else-if="id === 'trials'"
      :trials="trials"
      @remove="emit('remove', $event)"
      @clear="emit('clear')"
    />
    <DiffractionParamsPanel
      v-else-if="id === 'params'"
      :mode="mode"
      :params="params"
      @update:params="emit('update:params', $event)"
    />
    <DiffractionLawsPanel
      v-else-if="id === 'laws'"
      :mode="mode"
      :slit-width="params.slitWidth"
      :lines-per-mm="params.linesPerMm"
      :screen-distance="params.screenDistance"
      :wavelength="params.wavelength"
      :central-width="centralWidth"
      :first-order-angle="firstOrderAngle"
    />
    <DiffractionResultsPanel
      v-else-if="id === 'results'"
      :trials="trials"
    />
  </div>
</template>
