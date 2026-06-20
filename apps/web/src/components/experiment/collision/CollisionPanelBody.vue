<script setup lang="ts">
import CollisionParamsPanel from './CollisionParamsPanel.vue'
import CollisionDataPanel from './CollisionDataPanel.vue'
import CollisionStatsPanel from './CollisionStatsPanel.vue'
import CollisionEquationsPanel from './CollisionEquationsPanel.vue'
import CollisionReport from './CollisionReport.vue'

const props = defineProps<{
  id: string
  params: any
  sim: any
  trials: any[]
  trialStats: any
  calcResult: string
}>()

const emit = defineEmits<{
  (e: 'update:params', val: any): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'calcFinalVelocity'): void
  (e: 'calcMomentumDiff'): void
  (e: 'calcEnergyLoss'): void
  (e: 'close'): void
  (e: 'openFullReport'): void
}>()
</script>

<template>
  <CollisionParamsPanel v-if="props.id === 'params'" :params="props.params" @update:params="emit('update:params', $event)" />
  <CollisionDataPanel v-else-if="props.id === 'data'" :trials="props.trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
  <CollisionStatsPanel v-else-if="props.id === 'stats'" :sim="props.sim" :trial-stats="props.trialStats" />
  <CollisionEquationsPanel v-else-if="props.id === 'equations'" @calc-final-velocity="emit('calcFinalVelocity')" @calc-momentum-diff="emit('calcMomentumDiff')" @calc-energy-loss="emit('calcEnergyLoss')" />
  <CollisionReport v-else-if="props.id === 'report'" :trials="props.trials" :params="props.params" :trial-stats="props.trialStats" @close="emit('close')" @open-full-report="emit('openFullReport')" />
  <div v-else class="placeholder">اللوحة {{ props.id }}</div>
</template>

<style scoped>
.placeholder { color: #94a3b8; text-align: center; padding: 2rem; font-size: .75rem; }
</style>
