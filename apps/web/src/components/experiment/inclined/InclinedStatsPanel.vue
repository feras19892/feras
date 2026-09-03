<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
const props = defineProps<{

  trialStats: {
    a_mean: number; a_std: number
    t_mean: number; t_std: number
    v_mean: number; v_std: number
  }
  trialCount: number
}>()
</script>

<template>
  <div class="stats-panel">
    <h4>{{ t('experiments.statisticsLabel') }} — {{ trialCount }} {{ t('experiments.experimentCount') }}</h4>
    <div class="stat-group">
      <h5>{{ t('experiments.acceleration') }} a (m/s²)</h5>
      <div class="stat-row"><span>{{ t('experiments.avgLabel') }}</span><b>{{ trialCount ? trialStats.a_mean.toFixed(3) : '--' }}</b></div>
      <div class="stat-row"><span>{{ t('experiments.stdDev') }}</span><b>{{ trialCount ? trialStats.a_std.toFixed(3) : '--' }}</b></div>
    </div>
    <div class="stat-group">
      <h5>{{ t('experiments.arrivalTime') }} t (s)</h5>
      <div class="stat-row"><span>{{ t('experiments.avgLabel') }}</span><b>{{ trialCount ? trialStats.t_mean.toFixed(3) : '--' }}</b></div>
      <div class="stat-row"><span>{{ t('experiments.stdDev') }}</span><b>{{ trialCount ? trialStats.t_std.toFixed(3) : '--' }}</b></div>
    </div>
    <div class="stat-group">
      <h5>{{ t('experiments.finalVelocity') }} v (m/s)</h5>
      <div class="stat-row"><span>{{ t('experiments.avgLabel') }}</span><b>{{ trialCount ? trialStats.v_mean.toFixed(2) : '--' }}</b></div>
      <div class="stat-row"><span>{{ t('experiments.stdDev') }}</span><b>{{ trialCount ? trialStats.v_std.toFixed(2) : '--' }}</b></div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel { padding: .5rem; }
h4 { color: #5B8DB8; font-size: .78rem; margin: 0 0 .5rem; }
.stat-group { margin-bottom: .5rem; }
.stat-group h5 { color: #8B95A5; font-size: .68rem; margin: 0 0 .2rem; border-bottom: 1px solid #2D3645; padding-bottom: .15rem; }
.stat-row { display: flex; justify-content: space-between; padding: .15rem 0; font-size: .68rem; }
.stat-row span { color: #B8C0CC; }
.stat-row b { color: #D1D7E0; }
</style>