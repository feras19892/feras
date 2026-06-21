<script setup lang="ts">
import CollisionParamsPanel from './CollisionParamsPanel.vue'
import CollisionDataPanel from './CollisionDataPanel.vue'
import CollisionSignalPanel from './CollisionSignalPanel.vue'
import type { CollisionSignalPoint } from '../../../composables/collision/useCollisionLab'
import type { CollisionParams, CollisionState } from '../../../modules/physics/experiments/collision/useCollisionPhysics'
import type { CollisionTrial } from '../../../composables/collision/useCollisionTrials'

const props = defineProps<{
  id: string
  params: CollisionParams
  sim: CollisionState
  trials: CollisionTrial[]
  signalSeries?: CollisionSignalPoint[]
}>()

const emit = defineEmits<{
  (e: 'update:params', val: Partial<CollisionParams>): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>

<template>
  <CollisionParamsPanel v-if="props.id === 'params'" :params="props.params" @update:params="emit('update:params', $event)" />
  <CollisionDataPanel v-else-if="props.id === 'data'" :trials="props.trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
  <CollisionSignalPanel v-else-if="props.id === 'signal'" :series="props.signalSeries || []" />
  <div v-else class="placeholder">اللوحة {{ props.id }}</div>
</template>

<style scoped>
.placeholder { color: #94a3b8; text-align: center; padding: 2rem; font-size: .75rem; }
</style>
