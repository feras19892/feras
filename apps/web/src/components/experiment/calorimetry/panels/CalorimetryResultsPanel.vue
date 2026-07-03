<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { CalorimetryTrial } from '../../../../composables/calorimetry/useCalorimetryTrials'
const { t } = useI18n()
const props = defineProps<{ trials: CalorimetryTrial[] }>()
const avgTf = computed(() => props.trials.length ? props.trials.reduce((s, t) => s + t.tf, 0) / props.trials.length : 0)
const avgC = computed(() => props.trials.length ? props.trials.reduce((s, t) => s + t.cMetal, 0) / props.trials.length : 0)
</script>
<template>
  <div class="results-panel">
    <div class="stat"><span class="label">{{ t('experiments.trialsCount') }}</span><span class="val">{{ trials.length }}</span></div>
    <div class="stat"><span class="label">T̄f</span><span class="val">{{ avgTf.toFixed(1) }} °C</span></div>
    <div class="stat"><span class="label">c̄</span><span class="val">{{ avgC.toFixed(0) }} J/kg·K</span></div>
  </div>
</template>
<style scoped>
.results-panel { display:flex; flex-direction:column; gap:.35rem; }
.stat { display:flex; justify-content:space-between; font-size:.78rem; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.03); }
.label { color:#8B95A5; }
.val { color:#D1D7E0; font-weight:600; }
</style>
