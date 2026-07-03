<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { IdealGasTrial } from '../../../../composables/ideal-gas/useIdealGasTrials'
const { t } = useI18n()
const props = defineProps<{ trials: IdealGasTrial[] }>()

const avgP = computed(() => props.trials.length ? props.trials.reduce((s, t) => s + t.P, 0) / props.trials.length : 0)
const avgT = computed(() => props.trials.length ? props.trials.reduce((s, t) => s + t.T, 0) / props.trials.length : 0)
const avgV = computed(() => props.trials.length ? props.trials.reduce((s, t) => s + t.V, 0) / props.trials.length : 0)
</script>

<template>
  <div class="results-panel">
    <div class="stat"><span class="label">{{ t('experiments.trialsCount') }}</span><span class="val">{{ trials.length }}</span></div>
    <div class="stat"><span class="label">P̄</span><span class="val">{{ (avgP/1000).toFixed(1) }} kPa</span></div>
    <div class="stat"><span class="label">T̄</span><span class="val">{{ avgT.toFixed(1) }} K</span></div>
    <div class="stat"><span class="label">V̄</span><span class="val">{{ (avgV*1000).toFixed(2) }} L</span></div>
  </div>
</template>

<style scoped>
.results-panel { display:flex; flex-direction:column; gap:.35rem; }
.stat { display:flex; justify-content:space-between; font-size:.78rem; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.03); }
.label { color:#8B95A5; }
.val { color:#D1D7E0; font-weight:600; }
</style>
