<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'

import type { CalorimetryTrial } from '../../../../composables/calorimetry/useCalorimetryTrials'





const props = defineProps<{ trials: CalorimetryTrial[] }>()
const avgTf = computed(() => props.trials.length ? props.trials.reduce((s, tr) => s + tr.tf, 0) / props.trials.length : 0)
const avgC = computed(() => props.trials.length ? props.trials.reduce((s, tr) => s + tr.cMetal, 0) / props.trials.length : 0)
const stdDev = computed(() => {
  if (props.trials.length < 2) return 0
  const mean = avgC.value
  const sq = props.trials.reduce((s, tr) => s + Math.pow(tr.cMetal - mean, 2), 0)
  return Math.sqrt(sq / (props.trials.length - 1))
})
const cv = computed(() => avgC.value > 0 ? (stdDev.value / avgC.value * 100) : 0)
const constancy = computed(() => {
  if (props.trials.length < 2) return { label: '', color: '' }
  if (cv.value < 2) return { label: t('experiments.blConstancyExcellent'), color: 'green' }
  if (cv.value < 5) return { label: t('experiments.blConstancyGood'), color: 'amber' }
  return { label: t('experiments.blConstancyNeedsMore'), color: 'red' }
})
const lastTrial = computed(() => props.trials.length ? props.trials[props.trials.length - 1] : null)
const errorPercent = computed(() => {
  if (!lastTrial.value || !lastTrial.value.cTrue || lastTrial.value.cTrue <= 0) return null
  return Math.abs(lastTrial.value.cMetal - lastTrial.value.cTrue) / lastTrial.value.cTrue * 100
})
</script>
<template>
  <div class="results-panel">
    <div class="stat"><span class="label">{{ t('experiments.trialsCount') }}</span><span class="val">{{ trials.length }}</span></div>
    <div class="stat"><span class="label">T̄f</span><span class="val">{{ avgTf.toFixed(1) }} °C</span></div>
    <div class="stat"><span class="label">c̄</span><span class="val highlight">{{ avgC.toFixed(0) }} J/kg·K</span></div>
    <div v-if="trials.length >= 2" class="stat"><span class="label">σ(c)</span><span class="val">±{{ stdDev.toFixed(0) }}</span></div>
    <div v-if="trials.length >= 2" class="stat"><span class="label">CV</span><span class="val" :class="constancy.color">{{ cv.toFixed(1) }}%</span></div>
    <div v-if="trials.length >= 2" class="stat"><span class="label">{{ t('experiments.calCConstancy') }}</span><span class="val" :class="constancy.color">{{ constancy.label }}</span></div>
    <div v-if="lastTrial && errorPercent !== null" class="stat"><span class="label">{{ t('experiments.calLastTrialError') }}</span><span class="val" :class="errorPercent < 5 ? 'green' : errorPercent < 15 ? 'amber' : 'red'">{{ errorPercent.toFixed(1) }}%</span></div>
    <div v-if="lastTrial && lastTrial.cTrue" class="stat"><span class="label">{{ t('experiments.calTrueC') }}</span><span class="val green">{{ lastTrial.cTrue }} J/kg·K</span></div>
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
