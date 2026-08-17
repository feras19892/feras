<script setup lang="ts">
import type { CalorimetryTrial } from '../../../composables/calorimetry/useCalorimetryTrials'
import CalorimetryReadingsPanel from './panels/CalorimetryReadingsPanel.vue'
import CalorimetryChartPanel from './panels/CalorimetryChartPanel.vue'
import CalorimetryTrialsPanel from './panels/CalorimetryTrialsPanel.vue'
import CalorimetryParamsPanel from './panels/CalorimetryParamsPanel.vue'
import CalorimetryLawsPanel from './panels/CalorimetryLawsPanel.vue'
import CalorimetryResultsPanel from './panels/CalorimetryResultsPanel.vue'

interface Props {
  id: string
  trials: CalorimetryTrial[]
  params: { mWater: number; tWater: number; mMetal: number; tMetal: number; cMetal: number; mCup: number; metalType: string }
  metalOptions?: Record<string, { c: number; nameAr: string; nameEn: string }>
  tf: number
  cMetal: number
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { mWater: number; tWater: number; mMetal: number; tMetal: number; cMetal: number; mCup: number; metalType: string }): void
}>()
</script>
<template>
  <div>
    <CalorimetryReadingsPanel v-if="id === 'readings'" :m-water="params.mWater" :t-water="params.tWater" :m-metal="params.mMetal" :t-metal="params.tMetal" :tf="tf" :c-metal="cMetal" :metal-type="params.metalType" :metal-options="metalOptions" />
    <CalorimetryChartPanel v-else-if="id === 'chart'" :trials="trials" />
    <CalorimetryTrialsPanel v-else-if="id === 'trials'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
    <CalorimetryParamsPanel v-else-if="id === 'params'" :params="params" :metal-options="metalOptions" @update:params="emit('update:params', $event)" />
    <CalorimetryLawsPanel v-else-if="id === 'laws'" :m-water="params.mWater" :t-water="params.tWater" :m-metal="params.mMetal" :t-metal="params.tMetal" :tf="tf" :c-metal="params.cMetal" :m-cup="params.mCup" />
    <CalorimetryResultsPanel v-else-if="id === 'results'" :trials="trials" />
  </div>
</template>
