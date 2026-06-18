<script setup lang="ts">
import PendulumPanelBody from './PendulumPanelBody.vue'
import type { PanelId } from '../../../composables/pendulum/usePendulumLayout'
import type { PendulumTrial } from '../../../composables/pendulum/usePendulumTrials'
import type { PendulumParams } from '../../../modules/physics/experiments/pendulum/usePendulumPhysics'

interface Measured { T: number | null; f: number | null; omega: number | null; gCalc: number | null }
interface SimState { theta: number; omega: number; t: number; running: boolean; paused: boolean; signalSeries: { t: number; theta: number }[]; measurementPeriod: number | null }

const props = defineProps<{
  maximized: Record<PanelId, boolean>; panelTitle: (id: PanelId) => string; trials: PendulumTrial[]; calcResult: string
  params: PendulumParams; sim: SimState; measured: Measured; fftResult: any
  trialStats: { T_mean: number; T_std: number; g_mean: number; g_std: number }
  tutorType: 'info' | 'warn' | 'success'; tutorMessage: string; canvasSnapshot?: string
}>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void; (e: 'update:trials', val: PendulumTrial[]): void; (e: 'update:fftResult', val: any): void
  (e: 'update:params', val: PendulumParams): void; (e: 'remove', id: number): void; (e: 'clear'): void
  (e: 'calcG'): void; (e: 'calcT'): void; (e: 'calcL'): void; (e: 'calcFitG'): void; (e: 'showCalc', html: string): void
}>()

const allIds: PanelId[] = ['table', 'equations', 'scatter', 'tutor', 'signal', 'fft', 'params', 'guide', 'stats', 'error']
function isMaximized(id: string) { return (props.maximized as any)[id] as boolean }
function emitMaximize(id: string) { emit('maximize', id) }
</script>

<template>
  <Teleport to="body">
    <template v-for="id in allIds" :key="id">
      <div v-if="isMaximized(id)" class="panel-overlay" @click.self="emitMaximize(id)">
        <div class="overlay-card">
          <div class="card-header"><h4>{{ panelTitle(id) }}</h4><button class="pa-btn" @click="emitMaximize(id)">&#x2715;</button></div>
          <PendulumPanelBody :id="id" :trials="trials" :calc-result="calcResult" :params="params" :sim="sim" :measured="measured"
            :fft-result="fftResult" :trial-stats="trialStats" :tutor-type="tutorType" :tutor-message="tutorMessage" :canvas-snapshot="canvasSnapshot"
            @update:trials="emit('update:trials', $event)" @update:fft-result="emit('update:fftResult', $event)" @update:params="emit('update:params', $event)"
            @remove="emit('remove', $event)" @clear="emit('clear')" @calc-g="emit('calcG')" @calc-t="emit('calcT')" @calc-l="emit('calcL')" @calc-fit-g="emit('calcFitG')" @show-calc="emit('showCalc', $event)" />
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
