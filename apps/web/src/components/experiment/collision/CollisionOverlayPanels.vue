<script setup lang="ts">
import CollisionPanelBody from './CollisionPanelBody.vue'

import type { CollisionSignalPoint } from '../../../composables/collision/useCollisionLab'
import type { CollisionParams, CollisionState } from '../../../modules/physics/experiments/collision/useCollisionPhysics'
import type { CollisionTrial } from '../../../composables/collision/useCollisionTrials'

const props = defineProps<{
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  params: CollisionParams
  sim: CollisionState
  trials: CollisionTrial[]
  signalSeries?: CollisionSignalPoint[]
}>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'update:params', val: Partial<CollisionParams>): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-for="[id, active] in Object.entries(maximized).filter(([,a]) => a)" :key="id" class="overlay-backdrop" @click="emit('maximize', id)">
      <div class="overlay-panel" @click.stop>
        <div class="overlay-header">
          <span>{{ panelTitle(id) }}</span>
          <button @click="emit('maximize', id)">×</button>
        </div>
        <CollisionPanelBody :id="id" :params="params" :sim="sim" :trials="trials" :signal-series="signalSeries || []"
          @update:params="emit('update:params', $event)" @remove="emit('remove', $event)" @clear="emit('clear')"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 150; display: flex; align-items: center; justify-content: center; }
.overlay-panel { background: #161B22; border: 1px solid #2D3645; border-radius: 10px; width: 90vw; max-width: 800px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; }
.overlay-header { display: flex; justify-content: space-between; align-items: center; padding: .6rem .8rem; border-bottom: 1px solid #2D3645; }
.overlay-header span { color: #D1D7E0; font-size: .82rem; font-weight: 600; }
.overlay-header button { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; }
</style>
