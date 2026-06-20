<script setup lang="ts">
import SpringPanelBody from './SpringPanelBody.vue'
import type { PanelId } from '../../../composables/spring/useSpringLayout'
import type { Trial } from '../../../composables/spring/useSpringTrials'
import type { SpringParams } from '../../../modules/physics/experiments/spring/useSpringPhysics'

interface Measured {
  T: number | null; f: number | null; omega: number | null; kCalc: number | null; kCalcEff: number | null
}

interface SimState {
  x: number; v: number; t: number; running: boolean; paused: boolean
  signalSeries: { t: number; x: number }[]; measurementPeriod: number | null
}

const props = defineProps<{
  maximized: Record<PanelId, boolean>
  panelTitle: (id: PanelId) => string
  trials: Trial[]
  params: SpringParams
  sim: SimState
  measured: Measured
  effectiveMass: number
}>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'update:trials', val: Trial[]): void
  (e: 'update:params', val: SpringParams): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()

const allIds: PanelId[] = ['table', 'signal', 'params', 'guide']

function isMaximized(id: string) {
  return (props.maximized as any)[id] as boolean
}
function emitMaximize(id: string) {
  emit('maximize', id)
}
</script>

<template>
  <Teleport to="body">
    <template v-for="id in allIds" :key="id">
      <div
        v-if="isMaximized(id)"
        class="panel-overlay"
        @click.self="emitMaximize(id)"
      >
        <div class="overlay-card">
          <div class="card-header">
            <h4>{{ panelTitle(id) }}</h4>
            <button class="pa-btn" @click="emitMaximize(id)">&#x2715;</button>
          </div>
          <SpringPanelBody
            :id="id"
            :trials="trials"
            :params="params"
            :sim="sim"
            :measured="measured"
            :effective-mass="effectiveMass"
            @update:trials="emit('update:trials', $event)"
            @update:params="emit('update:params', $event)"
            @remove="emit('remove', $event)"
            @clear="emit('clear')"
          />
        </div>
      </div>
    </template>
  </Teleport>
</template>

<style scoped>
.panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.overlay-card { background: #1E2530; border: 1px solid #2D3645; border-radius: 10px; padding: 1rem; width: 90vw; max-width: 1200px; height: 85vh; display: flex; flex-direction: column; overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin: 0 0 .3rem; flex-shrink: 0; }
.card-header h4 { margin: 0; font-size: .82rem; color: #D1D7E0; font-weight: 700; }
.pa-btn { background: transparent; border: 1px solid #2D3645; color: #8B95A5; border-radius: 4px; cursor: pointer; font-size: .7rem; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; padding: 0; }
.pa-btn:hover { background: rgba(91,141,184,.15); color: #5B8DB8; }
</style>
