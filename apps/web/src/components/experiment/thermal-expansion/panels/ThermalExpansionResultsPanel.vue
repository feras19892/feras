<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { ThermalExpansionTrial } from '../../../../composables/thermal-expansion/useThermalExpansionTrials'
const { t } = useI18n()
const props = defineProps<{ trials: ThermalExpansionTrial[] }>()
const avgAlpha = computed(() => props.trials.length ? props.trials.reduce((s, t) => s + t.alpha, 0) / props.trials.length : 0)
const avgDL = computed(() => props.trials.length ? props.trials.reduce((s, t) => s + t.deltaL, 0) / props.trials.length : 0)
</script>
<template>
  <div class="results-panel">
    <div class="stat"><span class="label">{{ t('experiments.trialsCount') }}</span><span class="val">{{ trials.length }}</span></div>
    <div class="stat"><span class="label">ᾱ</span><span class="val">{{ avgAlpha.toFixed(1) }} × 10⁻⁶/K</span></div>
    <div class="stat"><span class="label">ΔL̄</span><span class="val">{{ (avgDL * 1000).toFixed(2) }} mm</span></div>
  </div>
</template>
<style scoped>
.results-panel { display:flex; flex-direction:column; gap:.35rem; }
.stat { display:flex; justify-content:space-between; font-size:.78rem; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.03); }
.label { color:#8B95A5; }
.val { color:#D1D7E0; font-weight:600; }
</style>
