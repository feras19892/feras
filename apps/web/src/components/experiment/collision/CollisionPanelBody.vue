<script setup lang="ts">
import CollisionParamsPanel from './CollisionParamsPanel.vue'
import CollisionDataPanel from './CollisionDataPanel.vue'
import CollisionSignalPanel from './CollisionSignalPanel.vue'
import type { CollisionSignalPoint } from '../../../composables/collision/useCollisionLab'

const props = defineProps<{
  id: string
  params: any
  sim: any
  trials: any[]
  signalSeries?: CollisionSignalPoint[]
}>()

const emit = defineEmits<{
  (e: 'update:params', val: any): void
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
