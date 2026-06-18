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
  calcResult: string
  params: SpringParams
  sim: SimState
  measured: Measured
  effectiveMass: number
  fftResult: { freqs: number[]; amplitudes: number[]; dominantFreq: number } | null
  staticK: number | null
  staticReadings: any[]
  dynamicTrials: any[]
  kDynamic: number | null
  trialStats: { T_mean: number; T_std: number; k_mean: number; k_std: number }
  tutorType: 'info' | 'warn' | 'success'
  tutorMessage: string
}>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'update:trials', val: Trial[]): void
  (e: 'update:fftResult', val: { freqs: number[]; amplitudes: number[]; dominantFreq: number } | null): void
  (e: 'update:params', val: SpringParams): void
  (e: 'update:staticReadings', val: any[]): void
  (e: 'update:staticK', val: number | null): void
  (e: 'update:dynamicTrials', val: any[]): void
  (e: 'update:kDynamic', val: number | null): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'calcK'): void
  (e: 'calcT'): void
  (e: 'calcM'): void
  (e: 'calcFitK'): void
}>()

const allIds: PanelId[] = [
  'table', 'equations', 'scatter', 'tutor', 'signal', 'fft',
  'params', 'guide', 'stats', 'static', 'error',
]

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
            :calc-result="calcResult"
            :params="params"
            :sim="sim"
            :measured="measured"
            :effective-mass="effectiveMass"
            :fft-result="fftResult"
            :static-k="staticK"
            :static-readings="staticReadings"
            :dynamic-trials="dynamicTrials"
            :k-dynamic="kDynamic"
            :trial-stats="trialStats"
            :tutor-type="tutorType"
            :tutor-message="tutorMessage"
            @update:trials="emit('update:trials', $event)"
            @update:fft-result="emit('update:fftResult', $event)"
            @update:params="emit('update:params', $event)"
            @update:static-readings="emit('update:staticReadings', $event)"
            @update:static-k="emit('update:staticK', $event)"
            @update:dynamic-trials="emit('update:dynamicTrials', $event)"
            @update:k-dynamic="emit('update:kDynamic', $event)"
            @remove="emit('remove', $event)"
            @clear="emit('clear')"
            @calc-k="emit('calcK')"
            @calc-t="emit('calcT')"
            @calc-m="emit('calcM')"
            @calc-fit-k="emit('calcFitK')"
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
