<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'

import type { IdealGasTrial } from '../../../../composables/ideal-gas/useIdealGasTrials'





const props = defineProps<{ trials: IdealGasTrial[] }>()

const avgP = computed(() => props.trials.length ? props.trials.reduce((s, tr) => s + tr.P, 0) / props.trials.length : 0)
const avgT = computed(() => props.trials.length ? props.trials.reduce((s, tr) => s + tr.T, 0) / props.trials.length : 0)
const avgV = computed(() => props.trials.length ? props.trials.reduce((s, tr) => s + tr.V, 0) / props.trials.length : 0)

const nRTvalues = computed(() => props.trials.map(tr => tr.P * tr.V / (tr.n * tr.T)))
const avgR = computed(() => nRTvalues.value.length ? nRTvalues.value.reduce((s, v) => s + v, 0) / nRTvalues.value.length : 0)
const stdR = computed(() => {
  if (nRTvalues.value.length < 2) return 0
  const mean = avgR.value
  return Math.sqrt(nRTvalues.value.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (nRTvalues.value.length - 1))
})
const cvR = computed(() => avgR.value > 0 ? stdR.value / avgR.value * 100 : 0)
const R_TRUE = 8.314
const errR = computed(() => avgR.value > 0 ? Math.abs(avgR.value - R_TRUE) / R_TRUE * 100 : 0)
</script>

<template>
  <div class="results-panel">
    <div class="stat"><span class="label">{{ t('experiments.trialsCount') }}</span><span class="val">{{ trials.length }}</span></div>
    <div class="stat"><span class="label">P̄</span><span class="val">{{ (avgP/1000).toFixed(1) }} kPa</span></div>
    <div class="stat"><span class="label">T̄</span><span class="val">{{ avgT.toFixed(1) }} K</span></div>
    <div class="stat"><span class="label">V̄</span><span class="val">{{ (avgV*1000).toFixed(2) }} L</span></div>
    <div v-if="trials.length >= 1" class="stat"><span class="label">R̄ (PV/nT)</span><span class="val highlight">{{ avgR.toFixed(3) }} J/mol·K</span></div>
    <div v-if="trials.length >= 2" class="stat"><span class="label">σ(R)</span><span class="val">±{{ stdR.toFixed(3) }}</span></div>
    <div v-if="trials.length >= 2" class="stat"><span class="label">CV</span><span class="val" :class="cvR < 2 ? 'green' : cvR < 5 ? 'amber' : 'red'">{{ cvR.toFixed(2) }}%</span></div>
    <div v-if="trials.length >= 1" class="stat"><span class="label">R الحقيقي</span><span class="val green">{{ R_TRUE.toFixed(3) }} J/mol·K</span></div>
    <div v-if="trials.length >= 1" class="stat"><span class="label">خطأ %</span><span class="val" :class="errR < 2 ? 'green' : errR < 5 ? 'amber' : 'red'">{{ errR.toFixed(2) }}%</span></div>
  </div>
</template>

<style scoped>
.results-panel { display:flex; flex-direction:column; gap:.35rem; }
.stat { display:flex; justify-content:space-between; font-size:.78rem; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.03); }
.label { color:#8B95A5; }
.val { color:#D1D7E0; font-weight:600; }
.val.highlight { color:#fbbf24; }
.val.green { color:#4ade80; }
.val.amber { color:#fbbf24; }
.val.red { color:#f87171; }
</style>
