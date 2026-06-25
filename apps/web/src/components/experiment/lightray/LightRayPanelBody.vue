<script setup lang="ts">
import type { LightRayTrial } from '../../../composables/lightray/useLightRayExperiment'
import LightRayChart from './LightRayChart.vue'
import { useI18n } from '../../../composables/useI18n'

interface Props {
  id: string
  trials: LightRayTrial[]
  params: { angleIncidence: number; n1: number; n2: number }
  angleReflection: number
  angleRefraction: number | null
  totalInternalReflection: boolean
  criticalAngle: number | null
  slope: number
  intercept: number
  rSquared: number
  calculatedN2: number | null
  speedInMedium: number | null
}

const { t } = useI18n()
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', params: { angleIncidence: number; n1: number; n2: number }): void
}>()

const chartPoints = props.trials.map((t) => ({ sinI: t.sinI, sinT: t.sinT, thetaI: t.angleIncidence }))
</script>

<template>
  <div class="panel-body">
    <!-- readings panel -->
    <template v-if="id === 'readings'">
      <div class="reading-row">
        <span class="reading-label">{{ t('experiments.angleOfIncidence') }}</span>
        <span class="reading-val">{{ params.angleIncidence.toFixed(1) }}°</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">{{ t('experiments.angleOfReflection') }}</span>
        <span class="reading-val">{{ angleReflection.toFixed(1) }}°</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">{{ t('experiments.angleOfRefraction') }}</span>
        <span class="reading-val">{{ angleRefraction !== null ? angleRefraction.toFixed(1) + '°' : 'TIR' }}</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">{{ t('experiments.criticalAngle') }}</span>
        <span class="reading-val">{{ criticalAngle !== null ? criticalAngle.toFixed(1) + '°' : '—' }}</span>
      </div>
    </template>

    <!-- chart panel -->
    <template v-if="id === 'chart'">
      <LightRayChart :points="chartPoints" :slope="slope" :intercept="intercept" />
      <div v-if="trials.length >= 2" class="reg-summary">
        <span class="reg-badge">{{ t('experiments.slopeN2') }} = {{ slope.toFixed(3) }}</span>
        <span class="reg-badge">R² = {{ rSquared.toFixed(4) }}</span>
      </div>
    </template>

    <!-- trials panel -->
    <template v-if="id === 'trials'">
      <div v-if="trials.length === 0" class="empty">{{ t('experiments.noTrialsRecorded') }}</div>
      <div class="trial-table">
        <div class="trial-header">
          <span>#</span><span>θᵢ</span><span>θₜ</span><span>sin θᵢ</span><span>sin θₜ</span>
        </div>
        <div v-for="trial in trials" :key="trial.id" class="trial-row">
          <span class="trial-num">{{ trial.id }}</span>
          <span>{{ trial.angleIncidence.toFixed(0) }}°</span>
          <span>{{ trial.angleRefraction.toFixed(1) }}°</span>
          <span class="mono">{{ trial.sinI.toFixed(3) }}</span>
          <span class="mono">{{ trial.sinT.toFixed(3) }}</span>
          <button class="trial-del" @click="emit('remove', trial.id)">🗑️</button>
        </div>
      </div>
      <button v-if="trials.length" class="btn-clear" @click="emit('clear')">{{ t('experiments.clearAll') }}</button>
    </template>

    <!-- params panel -->
    <template v-if="id === 'params'">
      <div class="param-row">
        <label>{{ t('experiments.angleOfIncidence') }}</label>
        <input type="range" min="0" max="89" step="1" :value="params.angleIncidence" @input="$emit('update:params', { ...params, angleIncidence: Number(($event.target as HTMLInputElement).value) })" />
        <span class="param-val">{{ params.angleIncidence }}°</span>
      </div>
      <div class="param-row">
        <label>{{ t('experiments.refractiveIndexN1Top') }}</label>
        <select :value="params.n1" @change="$emit('update:params', { ...params, n1: Number(($event.target as HTMLSelectElement).value) })">
          <option :value="1.0">{{ t('experiments.air') }} (1.00)</option>
          <option :value="1.33">{{ t('experiments.water') }} (1.33)</option>
          <option :value="1.5">{{ t('experiments.glass') }} (1.50)</option>
          <option :value="2.42">{{ t('experiments.diamond') }} (2.42)</option>
        </select>
      </div>
      <div class="param-row">
        <label>{{ t('experiments.refractiveIndexN2Bottom') }}</label>
        <select :value="params.n2" @change="$emit('update:params', { ...params, n2: Number(($event.target as HTMLSelectElement).value) })">
          <option :value="1.0">{{ t('experiments.air') }} (1.00)</option>
          <option :value="1.33">{{ t('experiments.water') }} (1.33)</option>
          <option :value="1.5">{{ t('experiments.glass') }} (1.50)</option>
          <option :value="2.42">{{ t('experiments.diamond') }} (2.42)</option>
        </select>
      </div>
    </template>

    <!-- laws panel -->
    <template v-if="id === 'laws'">
      <div class="law-box">
        <div class="law-title">{{ t('experiments.lawOfReflection') }}</div>
        <div class="law-formula">θᵣ = θᵢ = {{ params.angleIncidence }}°</div>
      </div>
      <div class="law-box">
        <div class="law-title">{{ t('experiments.snellsLaw') }}</div>
        <div class="law-formula">n₁ sin θᵢ = n₂ sin θₜ</div>
        <div class="law-calc">{{ params.n1.toFixed(2) }} × sin({{ params.angleIncidence }}°) = {{ (params.n1 * Math.sin(params.angleIncidence * Math.PI / 180)).toFixed(3) }}</div>
        <div class="law-calc">{{ params.n2.toFixed(2) }} × sin({{ angleRefraction !== null ? angleRefraction.toFixed(1) : '?' }}°) = {{ angleRefraction !== null ? (params.n2 * Math.sin(angleRefraction * Math.PI / 180)).toFixed(3) : '—' }}</div>
      </div>
      <div v-if="totalInternalReflection" class="tir-warning">
        ⚠️ {{ t('experiments.totalInternalReflection') }}
      </div>
    </template>

    <!-- results panel -->
    <template v-if="id === 'results'">
      <div v-if="trials.length < 2" class="empty">{{ t('experiments.recordAtLeastTwo') }}</div>
      <template v-else>
        <div class="result-row"><span class="result-label">{{ t('experiments.numberOfReadings') }}</span><span class="result-val">{{ trials.length }}</span></div>
        <div class="result-row"><span class="result-label">{{ t('experiments.slopeLabel') }} (m) = n₂</span><span class="result-val highlight">{{ slope.toFixed(3) }}</span></div>
        <div class="result-row"><span class="result-label">{{ t('experiments.rSquaredLabel') }}</span><span class="result-val">{{ rSquared.toFixed(4) }}</span></div>
        <div class="result-row"><span class="result-label">{{ t('experiments.deducedN2') }}</span><span class="result-val highlight">{{ calculatedN2 !== null ? calculatedN2.toFixed(3) : '—' }}</span></div>
        <div class="result-row"><span class="result-label">{{ t('experiments.speedOfLightInMedium') }}</span><span class="result-val highlight">{{ speedInMedium !== null ? (speedInMedium / 1e8).toFixed(2) + ' × 10⁸ m/s' : '—' }}</span></div>
        <div class="formula-note">v = c / n₂ = 3×10⁸ / {{ calculatedN2 !== null ? calculatedN2.toFixed(3) : '?' }}</div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .4rem; font-size: .82rem; }
.reading-row { display: flex; justify-content: space-between; align-items: center; }
.reading-label { color: #8B95A5; }
.reading-val { font-family: monospace; color: #fbbf24; font-weight: 700; }
.empty { text-align: center; color: #475569; font-size: .8rem; padding: .5rem; }
.trial-table { display: flex; flex-direction: column; gap: .2rem; font-size: .7rem; }
.trial-header { display: grid; grid-template-columns: 24px 36px 42px 52px 52px 20px; gap: .2rem; padding: .15rem .3rem; color: #8B95A5; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06); }
.trial-row { display: grid; grid-template-columns: 24px 36px 42px 52px 52px 20px; gap: .2rem; padding: .15rem .3rem; align-items: center; }
.trial-row:nth-child(even) { background: rgba(255,255,255,0.02); }
.mono { font-family: monospace; color: #67e8f9; }
.trial-del { background: none; border: none; cursor: pointer; font-size: .65rem; opacity: .5; }
.trial-del:hover { opacity: 1; }
.btn-clear { padding: .3rem; border-radius: 4px; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); color: #f87171; font-size: .75rem; cursor: pointer; font-family: inherit; margin-top: .3rem; }
.param-row { display: flex; flex-direction: column; gap: .25rem; }
.param-row label { font-size: .75rem; color: #8B95A5; }
.param-row input[type='range'] { accent-color: #67e8f9; }
.param-row select { padding: .3rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #D1D7E0; font-family: inherit; font-size: .8rem; }
.param-val { font-family: monospace; color: #67e8f9; font-size: .8rem; text-align: center; }
.law-box { background: rgba(255,255,255,0.02); border-radius: 6px; padding: .5rem; }
.law-title { font-size: .75rem; color: #8B95A5; margin-bottom: .2rem; }
.law-formula { font-family: monospace; font-size: .9rem; color: #fbbf24; }
.law-calc { font-family: monospace; font-size: .75rem; color: #67e8f9; margin-top: .2rem; }
.tir-warning { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 6px; padding: .5rem; color: #f87171; font-size: .8rem; text-align: center; }
.results { gap: .35rem; }
.result-row { display: flex; justify-content: space-between; align-items: center; }
.result-label { color: #8B95A5; font-size: .78rem; }
.result-val { font-family: monospace; color: #D1D7E0; font-size: .82rem; }
.result-val.highlight { color: #22c55e; font-weight: 700; }
.formula-note { font-family: monospace; font-size: .72rem; color: #475569; text-align: center; margin-top: .3rem; padding-top: .3rem; border-top: 1px solid rgba(255,255,255,0.04); }
.reg-summary { display: flex; gap: .4rem; margin-top: .4rem; flex-wrap: wrap; }
.reg-badge { padding: .15rem .4rem; border-radius: 999px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #22c55e; font-size: .7rem; font-weight: 700; font-family: monospace; }
</style>
