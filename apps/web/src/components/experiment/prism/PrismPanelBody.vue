<script setup lang="ts">
import type { PrismTrial } from '../../../composables/prism/usePrismTrials'
import PrismReadingsPanel from './panels/PrismReadingsPanel.vue'
import PrismChartPanel from './panels/PrismChartPanel.vue'
import PrismTrialsPanel from './panels/PrismTrialsPanel.vue'
import PrismParamsPanel from './panels/PrismParamsPanel.vue'
import PrismLawsPanel from './panels/PrismLawsPanel.vue'
import PrismResultsPanel from './panels/PrismResultsPanel.vue'

interface Props {
  id: string
  trials: PrismTrial[]
  params: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }
  angleRefraction1: number | null
  angleIncidence2: number | null
  angleEmergence: number | null
  deviation: number | null
  totalInternalReflection: boolean
  criticalAngle: number | null
  slope: number
  intercept: number
  rSquared: number
  nValue: number
  avgN: number | null
  speedInMedium: number | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', params: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }): void
}>()
</script>

<template>
  <div>
    <PrismReadingsPanel
      v-if="id === 'readings'"
      :prism-angle="params.prismAngle"
      :angle-incidence="params.angleIncidence"
      :angle-refraction1="angleRefraction1"
      :angle-incidence2="angleIncidence2"
      :angle-emergence="angleEmergence"
      :deviation="deviation"
      :n-value="nValue"
      :wavelength="params.wavelength"
      :speed-in-medium="speedInMedium"
    />
    <PrismChartPanel
      v-else-if="id === 'chart'"
      :trials="trials"
      :slope="slope"
      :intercept="intercept"
      :r-squared="rSquared"
    />
    <PrismTrialsPanel
      v-else-if="id === 'trials'"
      :trials="trials"
      @remove="emit('remove', $event)"
      @clear="emit('clear')"
    />
    <PrismParamsPanel
      v-else-if="id === 'params'"
      :params="params"
      @update:params="emit('update:params', $event)"
    />
    <PrismLawsPanel
      v-else-if="id === 'laws'"
      :prism-angle="params.prismAngle"
      :angle-incidence="params.angleIncidence"
      :angle-refraction1="angleRefraction1"
      :deviation="deviation"
      :n-value="nValue"
      :wavelength="params.wavelength"
      :material="params.material"
    />
    <PrismResultsPanel
      v-else-if="id === 'results'"
      :trials="trials"
      :material="params.material"
      :avg-n="avgN"
      :r-squared="rSquared"
      :slope="slope"
      :intercept="intercept"
    />
  </div>
</template>
