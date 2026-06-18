<script setup lang="ts">
import SpringDataPanel from './SpringDataPanel.vue'
import SpringStaticPanel from './SpringStaticPanel.vue'
import SpringErrorPanel from './SpringErrorPanel.vue'
import SpringScatterChart from './SpringScatterChart.vue'
import SpringLiveAnalysis from './SpringLiveAnalysis.vue'
import SpringTutorCard from './SpringTutorCard.vue'
import SpringSignalChart from './SpringSignalChart.vue'
import SpringFFTPanel from './SpringFFTPanel.vue'
import SpringParamPanel from './SpringParamPanel.vue'
import SpringGuidePanel from './SpringGuidePanel.vue'
import SpringReport from './SpringReport.vue'
import SpringPhotogate from './SpringPhotogate.vue'
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
  id: PanelId
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
  canvasSnapshot?: string
}>()

const emit = defineEmits<{
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
</script>

<template>
  <SpringDataPanel
    v-if="id === 'table'"
    :model-value="trials"
    @update:model-value="emit('update:trials', $event)"
    :calc-result="calcResult"
    @remove="emit('remove', $event)"
    @clear="emit('clear')"
    @calc-k="emit('calcK')"
    @calc-t="emit('calcT')"
    @calc-m="emit('calcM')"
    @calc-fit-k="emit('calcFitK')"
  />

  <template v-else-if="id === 'equations'">
    <div class="calc-row">
      <button class="btn-calc" @click="emit('calcK')">k من m,T</button>
      <button class="btn-calc" @click="emit('calcT')">T من m,k</button>
      <button class="btn-calc" @click="emit('calcM')">m من T,k</button>
      <button class="btn-calc" @click="emit('calcFitK')">k من regression</button>
    </div>
    <div class="calc-result" v-html="calcResult" />
    <div class="equation-list">
      <div class="equation-item"><span class="eq-type">SHM</span><span class="eq-formula">T = 2π√(m/k)</span></div>
      <div class="equation-item"><span class="eq-type">ω₀</span><span class="eq-formula">ω₀ = √(k/m)</span></div>
      <div class="equation-item"><span class="eq-type">E</span><span class="eq-formula">E = ½kA²</span></div>
    </div>
  </template>

  <SpringStaticPanel
    v-else-if="id === 'static'"
    :params="params"
    @update:static-readings="emit('update:staticReadings', $event)"
    @update:static-k="emit('update:staticK', $event)"
  />
  <SpringErrorPanel
    v-else-if="id === 'error'"
    :k-static="staticK"
    :k-dynamic="measured.kCalc"
    :k-dynamic-eff="measured.kCalcEff"
    :theoretical-k="params.k"
    :measured-t="measured.T"
    :mass="params.mass"
    :spring-mass="params.springMass ?? 0"
  />
  <SpringScatterChart v-else-if="id === 'scatter'" :trials="trials" />

  <template v-else-if="id === 'tutor'">
    <SpringLiveAnalysis
      :params="{ mass: params.mass, k: params.k, amplitude: params.amplitude }"
      :sim-state="sim"
      :measured-t="measured.T"
      :measured-k-calc="measured.kCalc"
      :theoretical-period="(2 * Math.PI * Math.sqrt(effectiveMass / params.k))"
    />
    <SpringTutorCard
      :tutor-type="tutorType"
      :tutor-message="tutorMessage"
      :measured-t="measured.T"
      :measured-f="measured.f"
      :measured-omega="measured.omega"
    />
  </template>

  <SpringSignalChart
    v-else-if="id === 'signal'"
    :series="sim.signalSeries"
    :params="{ mass: params.mass, k: params.k, amplitude: params.amplitude }"
    :sim-t="sim.t"
  />
  <SpringFFTPanel
    v-else-if="id === 'fft'"
    :model-value="fftResult"
    @update:model-value="emit('update:fftResult', $event)"
    :signal-series="sim.signalSeries"
    :params="{ mass: params.mass, k: params.k }"
  />
  <SpringParamPanel
    v-else-if="id === 'params'"
    :model-value="params"
    @update:model-value="emit('update:params', $event)"
  />
  <SpringGuidePanel
    v-else-if="id === 'guide'"
    :mass="params.mass"
    :k="params.k"
    :amplitude="params.amplitude"
    :damping="params.damping"
    :running="sim.running"
    :measured-t="measured.T"
    :measured-f="measured.f"
    :measured-omega="measured.omega"
    :measured-k-calc="measured.kCalc"
  />

  <template v-else-if="id === 'stats'">
    <div class="stat-section-title">القياسة الحالية</div>
    <div class="stat-row"><span class="stat-label">T</span><span class="stat-value">{{ measured.T?.toFixed(4) ?? '--' }} s</span></div>
    <div class="stat-row"><span class="stat-label">f</span><span class="stat-value">{{ measured.f?.toFixed(3) ?? '--' }} Hz</span></div>
    <div class="stat-row"><span class="stat-label">ω</span><span class="stat-value">{{ measured.omega?.toFixed(3) ?? '--' }} rad/s</span></div>
    <div class="stat-row"><span class="stat-label">k<sub>calc</sub></span><span class="stat-value highlight">{{ measured.kCalc?.toFixed(2) ?? '--' }} N/m</span></div>
    <template v-if="trials.length > 0">
      <div class="stat-section-title">إحصائيات القياسات ({{ trials.length }})</div>
      <div class="stat-row"><span class="stat-label">T̄</span><span class="stat-value">{{ trialStats.T_mean.toFixed(4) }} s</span></div>
      <div class="stat-row"><span class="stat-label">σ<sub>T</sub></span><span class="stat-value">{{ trialStats.T_std.toFixed(4) }} s</span></div>
      <div class="stat-row"><span class="stat-label">k̄<sub>calc</sub></span><span class="stat-value">{{ trialStats.k_mean.toFixed(2) }} N/m</span></div>
      <div class="stat-row"><span class="stat-label">σ<sub>k</sub></span><span class="stat-value">{{ trialStats.k_std.toFixed(2) }} N/m</span></div>
    </template>
  </template>

  <SpringPhotogate
    v-else-if="id === 'photogate'"
    :sim-running="sim.running"
    :sim-x="sim.x"
    :sim-v="sim.v"
    :target-count="20"
  />

  <SpringReport
    v-else-if="id === 'report'"
    :static-readings="staticReadings"
    :dynamic-trials="dynamicTrials"
    :k-static="staticK"
    :k-dynamic="kDynamic"
    :theoretical-k="params.k"
    :canvas-snapshot="canvasSnapshot"
    @update:static-readings="emit('update:staticReadings', $event)"
    @update:dynamic-trials="emit('update:dynamicTrials', $event)"
  />
</template>

<style scoped>
.calc-row { display: flex; flex-wrap: wrap; gap: .3rem; margin-bottom: .4rem; }
.btn-calc { background: #252D3A; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 4px; padding: .25rem .5rem; font-size: .72rem; cursor: pointer; }
.btn-calc:hover { background: rgba(91,141,184,.1); color: #5B8DB8; }
.calc-result { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .4rem; font-size: .78rem; margin-bottom: .4rem; min-height: 30px; }
.equation-list { display: flex; flex-direction: column; gap: .2rem; }
.equation-item { display: flex; justify-content: space-between; padding: .15rem .3rem; background: #252D3A; border-radius: 4px; font-size: .75rem; }
.eq-type { color: #5B8DB8; font-weight: 700; }
.eq-formula { color: #D1D7E0; font-family: monospace; }
.stat-section-title { font-size: .72rem; color: #5B8DB8; font-weight: 700; margin: .4rem 0 .2rem; border-bottom: 1px solid #2D3645; padding-bottom: .15rem; }
.stat-row { display: flex; justify-content: space-between; padding: .15rem .3rem; border-radius: 4px; background: #252D3A; margin-bottom: .15rem; }
.stat-label { font-size: .7rem; color: #8B95A5; font-weight: 600; }
.stat-value { font-size: .75rem; font-weight: 700; color: #D1D7E0; font-family: monospace; }
.stat-value.highlight { color: #5B8DB8; }
</style>
