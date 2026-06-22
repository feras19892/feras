<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  trialStats: { time_mean: number; time_std: number; g_mean: number; g_std: number } | null
  gTheoretical: number
}>()
</script>

<template>
  <div>
    <h5>📊 {{ t('experiments.statisticsLabel') }}</h5>
    <div v-if="trialStats && trialStats.g_mean > 0" class="stats-grid">
      <div class="stat-card"><span class="stat-label">{{ t('experiments.averageTime') }}</span><span class="stat-val">{{ trialStats.time_mean.toFixed(3) }} s</span></div>
      <div class="stat-card"><span class="stat-label">{{ t('experiments.timeDeviation') }}</span><span class="stat-val">{{ trialStats.time_std.toFixed(4) }} s</span></div>
      <div class="stat-card"><span class="stat-label">{{ t('experiments.averageG') }}</span><span class="stat-val">{{ trialStats.g_mean.toFixed(2) }} m/s²</span></div>
      <div class="stat-card"><span class="stat-label">{{ t('experiments.gDeviation') }}</span><span class="stat-val">{{ trialStats.g_std.toFixed(2) }} m/s²</span></div>
      <div class="stat-card"><span class="stat-label">{{ t('experiments.theoreticalG') }}</span><span class="stat-val">{{ gTheoretical.toFixed(2) }} m/s²</span></div>
    </div>
    <p v-else class="no-data">{{ t('experiments.notEnoughData') }}</p>
  </div>
</template>

<style scoped>
h5 { margin: 0 0 .3rem; font-size: .82rem; color: #5B8DB8; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: .3rem; }
.stat-card { background: #111827; border: 1px solid #2D3645; border-radius: 6px; padding: .4rem .5rem; display: flex; flex-direction: column; gap: .1rem; }
.stat-label { font-size: .65rem; color: #64748b; }
.stat-val { font-size: .8rem; color: #5B8DB8; font-weight: 700; font-family: monospace; }
.no-data { text-align: center; color: #64748b; font-size: .75rem; }
</style>
