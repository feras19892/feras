<script setup lang="ts">
import LeverTablePanel from './LeverTablePanel.vue'
import LeverStatsPanel from './LeverStatsPanel.vue'
import LeverSignalPanel from './LeverSignalPanel.vue'
import LeverEquationPanel from './LeverEquationPanel.vue'
import LeverReportPanel from './LeverReportPanel.vue'
import LeverChallengePanel from './LeverChallengePanel.vue'

import type { LeverTrial } from '../../../composables/lever/useLeverTrials'
import type { LeverState } from '../../../modules/physics/experiments/lever/useLeverPhysics'

const props = defineProps<{
  id: string
  sim: LeverState
  trials: LeverTrial[]
  challengeSolved?: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'startChallenge'): void
  (e: 'checkChallenge', guess: number): void
}>()
</script>

<template>
  <LeverTablePanel v-if="id === 'table'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
  <LeverStatsPanel v-else-if="id === 'stats'" :count="trials.length" :avg-torque="trials.reduce((s,t)=>s+t.netTorque,0)/Math.max(trials.length,1)" :max-tilt="Math.max(...trials.map(t=>Math.abs(t.tiltDeg)),0)" :balance-count="trials.filter(t=>t.isBalanced).length" />
  <LeverSignalPanel v-else-if="id === 'signal'" :trials="trials" />
  <LeverEquationPanel v-else-if="id === 'equation'" />
  <LeverReportPanel v-else-if="id === 'report'" :trials="trials" />
  <LeverChallengePanel v-else-if="id === 'challenge'" :challenge-solved="challengeSolved ?? false" @start-challenge="emit('startChallenge')" @check-challenge="emit('checkChallenge', $event)" />
  <div v-else class="placeholder">اللوحة {{ id }}</div>
</template>

<style scoped>
.placeholder { color:#94a3b8; text-align:center; padding:2rem; font-size:.75rem; }
</style>
