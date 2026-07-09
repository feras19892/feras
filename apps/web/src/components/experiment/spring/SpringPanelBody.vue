<script setup lang="ts">
import SpringDataPanel from './SpringDataPanel.vue'
import SpringSignalChart from './SpringSignalChart.vue'
import SpringParamPanel from './SpringParamPanel.vue'
import type { SpringTrial } from '../../../composables/spring/useSpringTrials'
import type { SpringParams } from '../../../modules/physics/experiments/spring/useSpringPhysics'

interface Measured {
  T: number | null; f: number | null; omega: number | null; kCalc: number | null; kCalcEff: number | null
}

interface SimState {
  x: number; v: number; t: number; running: boolean; paused: boolean
  signalSeries: { t: number; x: number }[]; measurementPeriod: number | null
}

const props = defineProps<{
  id: string
  trials: SpringTrial[]
  params: SpringParams
  sim: SimState
  measured: Measured
  effectiveMass: number
}>()

const emit = defineEmits<{
  (e: 'update:trials', val: SpringTrial[]): void
  (e: 'update:params', val: SpringParams): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>

<template>
  <SpringDataPanel
    v-if="id === 'table'"
    :model-value="trials"
    @update:model-value="emit('update:trials', $event)"
    @remove="emit('remove', $event)"
    @clear="emit('clear')"
  />

  <SpringSignalChart
    v-else-if="id === 'signal'"
    :series="sim.signalSeries"
    :params="{ mass: params.mass, k: params.k, amplitude: params.amplitude }"
    :sim-t="sim.t"
  />
  <SpringParamPanel
    v-else-if="id === 'params'"
    :model-value="params"
    @update:model-value="emit('update:params', $event)"
  />
</template>
