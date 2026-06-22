<script setup lang="ts">
import type { InclinedTrial } from '../../../composables/inclined/useInclinedTrials'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  trials: InclinedTrial[]
  params: { thetaDeg: number; length: number; mass: number; g: number; mu: number }
  trialStats: { a_mean: number; a_std: number; t_mean: number; t_std: number; v_mean: number; v_std: number }
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="report-modal" @click.self="emit('close')">
    <div class="report-content">
      <button class="close-btn" @click="emit('close')">✕</button>
      <h2>📋 {{ t('experiments.inclinedPlaneReport') }}</h2>
      <div class="report-section">
        <h4>{{ t('experiments.parameters') }}</h4>
        <p>θ = {{ params.thetaDeg }}°, L = {{ params.length }} m, m = {{ params.mass }} kg, g = {{ params.g }} m/s², μ = {{ params.mu }}</p>
      </div>
      <div class="report-section" v-if="trials.length">
        <h4>{{ t('experiments.readings') }} ({{ trials.length }})</h4>
        <table>
          <thead><tr><th>#</th><th>θ</th><th>a</th><th>t</th><th>v</th><th>err</th></tr></thead>
          <tbody>
            <tr v-for="(t, i) in trials" :key="t.id"><td>{{ i+1 }}</td><td>{{ t.thetaDeg }}°</td><td>{{ t.acceleration }}</td><td>{{ t.timeOfArrival }}</td><td>{{ t.finalVelocity }}</td><td>{{ t.err }}%</td></tr>
          </tbody>
        </table>
      </div>
      <div class="report-section" v-if="trials.length">
        <h4>{{ t('experiments.statisticsLabel') }}</h4>
        <p>a_mean = {{ trialStats.a_mean.toFixed(3) }}, a_std = {{ trialStats.a_std.toFixed(3) }}</p>
        <p>t_mean = {{ trialStats.t_mean.toFixed(3) }}, t_std = {{ trialStats.t_std.toFixed(3) }}</p>
        <p>v_mean = {{ trialStats.v_mean.toFixed(2) }}, v_std = {{ trialStats.v_std.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-modal { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; }
.report-content { background:#161B22; border:1px solid #2D3645; border-radius:12px; padding:1.5rem; max-width:600px; width:90%; max-height:80vh; overflow:auto; position:relative; }
.close-btn { position:absolute; top:.6rem; left:.6rem; background:none; border:none; color:#8B95A5; cursor:pointer; font-size:1.1rem; }
.report-content h2 { color:#5B8DB8; margin:0 0 1rem; font-size:1.1rem; }
.report-section { margin-bottom:1rem; }
.report-section h4 { color:#D1D7E0; margin:0 0 .3rem; font-size:.82rem; }
.report-section p { color:#B8C0CC; font-size:.74rem; margin:.2rem 0; }
.report-section table { width:100%; border-collapse:collapse; font-size:.7rem; }
.report-section th, .report-section td { padding:.2rem .3rem; text-align:center; border:1px solid #2D3645; color:#B8C0CC; }
.report-section th { background:rgba(255,255,255,.03); }
</style>
