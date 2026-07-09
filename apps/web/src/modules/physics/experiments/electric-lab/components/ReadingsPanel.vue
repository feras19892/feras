<script setup lang="ts">
import type { CircuitComponent, Trial } from '../types'
import ExperimentReadings from './ExperimentReadings.vue'
import ComponentControls from './ComponentControls.vue'

defineProps<{
  components: CircuitComponent[]
  running: boolean
  voltage: number
  current: number
  resistance: number
  trials: Trial[]
  selectedId: number | null
  instructions: string[]
  isKirchhoff?: boolean
  kirchhoffCurrents?: { I1: number; I2: number; I3: number }
  isParallel?: boolean
  parallelCurrents?: { I1: number; I2: number; Itotal: number }
  isPower?: boolean
  powerReading?: { V: number; I: number; P: number }
  isResistivity?: boolean
  resistivityReading?: { V: number; I: number; R: number; rho: number }
  isRC?: boolean
  rcReading?: { V: number; I: number; t: number; tau: number; charging: boolean }
  rcHistory?: { t: number; V: number; I: number }[]
  isLamp?: boolean
  lampReading?: { V: number; I: number; P: number; PLight: number; PHeat: number; brightness: number }
  isGalvanometer?: boolean
  galvanometerReading?: { emf: number; IuA: number; sensitivity: number; turns: number; speed: number }
  isWheatstone?: boolean
  wheatstoneReading?: { Vg: number; Ig: number; balanced: boolean; Rx: number; R1: number; R2: number; R3: number }
  isVoltageDivider?: boolean
  voltageDividerReading?: { V: number; V1: number; V2: number; R1: number; R2: number; I: number }
  isInternalResistance?: boolean
  internalResistanceReading?: { emf: number; Vt: number; I: number; r: number; Vdrop: number }
  isSeries?: boolean
  seriesReading?: { V: number; I: number; Req: number; V1: number; V2: number; V3: number }
  isCapacitorsCombo?: boolean
  capacitorsComboReading?: { Ceq: number; tau: number; C1: number; C2: number }
  isPotentiometer?: boolean
  potentiometerReading?: { Vref: number; Vx: number; Vslide: number; Ig: number; balanced: boolean }
  isNonOhmic?: boolean
  nonOhmicReading?: { V: number; I_ohmic: number; I_lamp: number; R_dyn: number }
  isMaxPower?: boolean
  maxPowerReading?: { V: number; I: number; P: number; R: number; r: number; Pmax: number; isMax: boolean }
  isJoulesLaw?: boolean
  joulesReading?: { V: number; I: number; P: number; R: number; H: number }
  isAmmeterVoltmeter?: boolean
  ammeterVoltmeterReading?: { V: number; I: number; R_measured: number; R_true: number; error_pct: number }
  isCompound?: boolean
  compoundReading?: { V: number; I: number; Req: number; V1: number; Vpar: number; I2: number; I3: number }
  isEMF?: boolean
  emfReading?: { EMF: number; Vt: number; I: number; r: number; closed: boolean }
  isTempR?: boolean
  tempRReading?: { V: number; I: number; R: number; R0: number; T: number }
  isCellsSeries?: boolean
  cellsSeriesReading?: { EMF: number; Vt: number; I: number; R: number }
  isCellsParallel?: boolean
  cellsParallelReading?: { EMF: number; Vt: number; I: number; R: number }
  isRheostat?: boolean
  rheostatReading?: { V: number; I: number; R: number }
  isCurrentDivider?: boolean
  currentDividerReading?: { V: number; It: number; I1: number; I2: number }
  isSourceEff?: boolean
  sourceEffReading?: { Vt: number; I: number; Pload: number; eta: number }
  isTwoSources?: boolean
  twoSourcesReading?: { netEMF: number; I: number; Vt: number; direction: number }
  isDiodeIV?: boolean
  diodeReading?: { Vd: number; I: number; Vsrc: number }
  isTransformer?: boolean
  transformerReading?: { Vp: number; Vs: number; Ip: number; Is: number }
  isSelfInd?: boolean
  selfIndReading?: { V: number; I: number; E: number; tau: number }
  isThermistor?: boolean
  thermistorReading?: { V: number; I: number; R: number; T: number }
  isMagneticForce?: boolean
  magneticForceReading?: { I: number; F: number; B: number; L: number }
  isLCOsc?: boolean
  lcOscReading?: { V: number; I: number; f: number; E: number }
}>()

const emit = defineEmits<{
  (e: 'toggle-run'): void
  (e: 'record'): void
  (e: 'clear-trials'): void
  (e: 'update-comp', id: number, value: number): void
  (e: 'remove-comp', id: number): void
  (e: 'toggle-switch', id: number): void
  (e: 'analyze'): void
}>()
</script>

<template>
  <div class="readings-panel">
    <h3 class="panel-title">📊 القراءات والتحكم</h3>
    <div class="readings-body">
      <div v-if="instructions.length > 0" class="instructions-box">
        <h4 class="instructions-title">📝 خطوات التجربة</h4>
        <ol class="instructions-list">
          <li v-for="(step, i) in instructions" :key="i">{{ step }}</li>
        </ol>
      </div>

      <ExperimentReadings
        :running="running" :voltage="voltage" :current="current" :resistance="resistance"
        :is-kirchhoff="isKirchhoff" :kirchhoff-currents="kirchhoffCurrents"
        :is-parallel="isParallel" :parallel-currents="parallelCurrents"
        :is-power="isPower" :power-reading="powerReading"
        :is-resistivity="isResistivity" :resistivity-reading="resistivityReading"
        :is-r-c="isRC" :rc-reading="rcReading" :rc-history="rcHistory"
        :is-lamp="isLamp" :lamp-reading="lampReading"
        :is-galvanometer="isGalvanometer" :galvanometer-reading="galvanometerReading"
        :is-wheatstone="isWheatstone" :wheatstone-reading="wheatstoneReading"
        :is-voltage-divider="isVoltageDivider" :voltage-divider-reading="voltageDividerReading"
        :is-internal-resistance="isInternalResistance" :internal-resistance-reading="internalResistanceReading"
        :is-series="isSeries" :series-reading="seriesReading"
        :is-capacitors-combo="isCapacitorsCombo" :capacitors-combo-reading="capacitorsComboReading"
        :is-potentiometer="isPotentiometer" :potentiometer-reading="potentiometerReading"
        :is-non-ohmic="isNonOhmic" :non-ohmic-reading="nonOhmicReading"
        :is-max-power="isMaxPower" :max-power-reading="maxPowerReading"
        :is-joules-law="isJoulesLaw" :joules-reading="joulesReading"
        :is-ammeter-voltmeter="isAmmeterVoltmeter" :ammeter-voltmeter-reading="ammeterVoltmeterReading"
        :is-compound="isCompound" :compound-reading="compoundReading"
        :is-emf="isEMF" :emf-reading="emfReading"
        :is-temp-r="isTempR" :temp-r-reading="tempRReading"
        :is-cells-series="isCellsSeries" :cells-series-reading="cellsSeriesReading"
        :is-cells-parallel="isCellsParallel" :cells-parallel-reading="cellsParallelReading"
        :is-rheostat="isRheostat" :rheostat-reading="rheostatReading"
        :is-current-divider="isCurrentDivider" :current-divider-reading="currentDividerReading"
        :is-source-eff="isSourceEff" :source-eff-reading="sourceEffReading"
        :is-two-sources="isTwoSources" :two-sources-reading="twoSourcesReading"
        :is-diode-iv="isDiodeIV" :diode-reading="diodeReading"
        :is-transformer="isTransformer" :transformer-reading="transformerReading"
        :is-self-ind="isSelfInd" :self-ind-reading="selfIndReading"
        :is-thermistor="isThermistor" :thermistor-reading="thermistorReading"
        :is-magnetic-force="isMagneticForce" :magnetic-force-reading="magneticForceReading"
        :is-lc-osc="isLCOsc" :lc-osc-reading="lcOscReading"
      />

      <ComponentControls
        :selected-id="selectedId" :components="components"
        @update-comp="(id, val) => emit('update-comp', id, val)"
        @remove-comp="(id) => emit('remove-comp', id)"
        @toggle-switch="(id) => emit('toggle-switch', id)"
      />

      <div class="actions">
        <button class="btn-run" :class="{ running }" @click="emit('toggle-run')">
          {{ running ? '⏹ إيقاف' : '▶ تشغيل' }}
        </button>
        <button class="btn-record" :disabled="!running" @click="emit('record')">📋 تسجيل</button>
        <button class="btn-clear" @click="emit('clear-trials')">🗑 مسح</button>
      </div>

      <div v-if="trials.length > 0" class="trials-section">
        <h4>المحاولات ({{ trials.length }})</h4>
        <div class="trials-table">
          <div class="trial-row trial-header"><span>#</span><span>V</span><span>I</span><span>R</span></div>
          <div v-for="t in trials" :key="t.id" class="trial-row">
            <span>{{ t.id }}</span><span>{{ t.voltage.toFixed(1) }}</span>
            <span>{{ t.current.toFixed(3) }}</span><span>{{ t.resistance.toFixed(0) }}</span>
          </div>
        </div>
      </div>

      <div class="analyze-section">
        <button class="btn-analyze" :disabled="trials.length < 2" @click="emit('analyze')">📈 تحليل النتائج</button>
        <p v-if="trials.length < 2" class="analyze-hint">سجّل محاولتين على الأقل للتحليل</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.readings-panel { display: flex; flex-direction: column; height: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; overflow: hidden; }
.panel-title { margin: 0; padding: 0.75rem 1rem; font-size: 0.85rem; color: #67e8f9; background: rgba(103,232,249,0.08); border-bottom: 1px solid rgba(255,255,255,0.06); }
.readings-body { flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem; }
.instructions-box { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.15); border-radius: 0.5rem; padding: 0.6rem 0.75rem; }
.instructions-title { margin: 0 0 0.4rem; font-size: 0.8rem; color: #fbbf24; font-weight: 700; }
.instructions-list { margin: 0; padding-right: 1.2rem; padding-left: 0; }
.instructions-list li { font-size: 0.72rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 0.15rem; }
.actions { display: flex; gap: 0.5rem; }
.btn-run, .btn-record, .btn-clear { flex: 1; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; cursor: pointer; font-size: 0.78rem; font-weight: 600; transition: all 0.15s; }
.btn-run { background: rgba(34,197,94,0.12); color: #4ade80; border-color: rgba(34,197,94,0.3); }
.btn-run.running { background: rgba(239,68,68,0.12); color: #f87171; border-color: rgba(239,68,68,0.3); }
.btn-record { background: rgba(245,158,11,0.12); color: #fbbf24; border-color: rgba(245,158,11,0.3); }
.btn-record:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-clear { background: rgba(255,255,255,0.04); color: #94a3b8; }
.trials-section h4 { margin: 0 0 0.4rem; font-size: 0.78rem; color: #94a3b8; }
.trials-table { max-height: 120px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.06); border-radius: 0.4rem; }
.trial-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; padding: 0.25rem 0.5rem; font-size: 0.72rem; font-family: monospace; border-bottom: 1px solid rgba(255,255,255,0.03); }
.trial-row span { text-align: center; }
.trial-header { background: rgba(255,255,255,0.04); color: #64748b; font-weight: 700; }
.analyze-section { margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.btn-analyze { width: 100%; padding: 0.6rem; background: linear-gradient(135deg, #06b6d4, #0891b2); border: none; color: #fff; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 700; transition: all 0.15s; }
.btn-analyze:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(6,182,212,0.3); }
.btn-analyze:disabled { opacity: 0.4; cursor: not-allowed; }
.analyze-hint { margin: 0; font-size: 0.7rem; color: #475569; text-align: center; }
</style>
