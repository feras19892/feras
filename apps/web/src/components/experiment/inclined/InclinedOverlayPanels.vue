<script setup lang="ts">
import type { InclinedTrial } from '../../../composables/inclined/useInclinedTrials'
import type { InclinedParams } from '../../../modules/physics/experiments/inclined/useInclinedPhysics'
import InclinedPanelBody from './InclinedPanelBody.vue'
import type { PanelId } from '../../../composables/inclined/useInclinedLayout'

const props = defineProps<{
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  trials: InclinedTrial[]
  params: InclinedParams
  sim: { t: number; s: number; v: number; arrived: boolean; running: boolean }
  measured: { acceleration: number | null; timeOfArrival: number | null; finalVelocity: number | null; normalForce: number | null; parallelForce: number | null; frictionForce: number | null; dragForce: number | null }
  trialStats: { a_mean: number; a_std: number; t_mean: number; t_std: number; v_mean: number; v_std: number }
  calcResult: string
}>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'drop', id: string, x: number, y: number): void
  (e: 'update:params', v: Partial<InclinedParams>): void
  (e: 'remove', id: number): void
  (e: 'calcAcceleration'): void
  (e: 'calcTime'): void
  (e: 'calcVelocity'): void
  (e: 'calcNormal'): void
}>()

const allPanelIds: PanelId[] = ['table', 'equations', 'stats', 'scatter', 'signal', 'params', 'guide', 'error']
</script>

<template>
  <div class="overlay-panels">
    <template v-for="id in allPanelIds" :key="id">
      <div v-if="maximized[id]" class="overlay-panel" @dragover.prevent @drop.prevent="emit('drop', id, $event.clientX, $event.clientY)">
        <div class="overlay-header">
          <span>{{ panelTitle(id) }}</span>
          <button @click="emit('maximize', id)">✕</button>
        </div>
        <div class="overlay-body">
          <InclinedPanelBody :id="id" :trials="trials" :params="params" :sim="sim" :measured="measured" :trial-stats="trialStats" :calc-result="calcResult"
            @update:params="emit('update:params', $event)" @remove="emit('remove', $event)" @calc-acceleration="emit('calcAcceleration')" @calc-time="emit('calcTime')" @calc-velocity="emit('calcVelocity')" @calc-normal="emit('calcNormal')" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.overlay-panels { position: fixed; inset: 0; z-index: 150; pointer-events: none; }
.overlay-panel { position: absolute; inset: 5%; background: #161B22; border: 1px solid #2D3645; border-radius: 10px; display: flex; flex-direction: column; pointer-events: auto; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.overlay-header { display: flex; justify-content: space-between; align-items: center; padding: .5rem .7rem; border-bottom: 1px solid #2D3645; font-size: .78rem; color: #D1D7E0; font-weight: 700; }
.overlay-header button { background: none; border: none; color: #8B95A5; cursor: pointer; font-size: 1rem; }
.overlay-body { flex: 1; min-height: 0; overflow: auto; padding: .4rem; }
</style>
