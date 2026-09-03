<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'

import type { SpeedOfSoundTrial } from '../../../../composables/speed-of-sound/useSpeedOfSoundTrials'





interface Props {
  trials: SpeedOfSoundTrial[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
  vFromRegression: number | null
  endCorrection: number | null
}
const props = defineProps<Props>()

const avgV = computed(() => props.trials.length > 0 ? props.trials.reduce((s, tr) => s + tr.vMeasured, 0) / props.trials.length : 0)
const avgVTheory = computed(() => props.trials.length > 0 ? props.trials.reduce((s, tr) => s + tr.vTheory, 0) / props.trials.length : 0)
const percentError = computed(() => {
  if (props.vFromRegression === null || avgVTheory.value <= 0) return null
  return Math.abs((props.vFromRegression - avgVTheory.value) / avgVTheory.value) * 100
})
</script>

<template>
  <div class="panel-body">
    <div v-if="trials.length >= 2" class="results">
      <div class="res-row"><span class="res-label">Trials</span><span class="res-val">{{ trials.length }}</span></div>

      <!-- Regression results per report: L = (v/4)(1/f) − e -->
      <div class="res-row"><span class="res-label">Slope (v/4)</span><span class="res-val highlight">{{ regressionSlope.toFixed(4) }}</span></div>
      <div class="res-row"><span class="res-label">v = 4×Slope</span><span class="res-val green">{{ vFromRegression !== null ? vFromRegression.toFixed(1) : '—' }} m/s</span></div>
      <div class="res-row"><span class="res-label">R²</span><span class="res-val">{{ rSquared.toFixed(4) }}</span></div>
      <div class="res-row"><span class="res-label">End correction e</span><span class="res-val">{{ endCorrection !== null ? endCorrection.toFixed(4) : '—' }} m</span></div>

      <div class="divider"></div>

      <div class="res-row"><span class="res-label">Avg v (meas)</span><span class="res-val">{{ avgV.toFixed(1) }} m/s</span></div>
      <div class="res-row"><span class="res-label">Avg v (theory)</span><span class="res-val">{{ avgVTheory.toFixed(1) }} m/s</span></div>
      <div class="res-row" v-if="percentError !== null"><span class="res-label">Error %</span><span class="res-val">{{ percentError.toFixed(2) }}%</span></div>
    </div>
    <p v-else class="empty">{{ t('experiments.recordAtLeastTwo') }}</p>
  </div>
</template>

<style scoped>
.panel-body { font-size: .8rem; }
.results { display: flex; flex-direction: column; gap: .3rem; }
.res-row { display: flex; justify-content: space-between; padding: .3rem .4rem; background: rgba(255,255,255,0.025); border-radius: 4px; }
.res-label { color: #64748b; }
.res-val { font-family: monospace; font-weight: 600; }
.green { color: #4ade80; }
.highlight { color: #fbbf24; }
.divider { height: 1px; background: #2D3645; margin: .2rem 0; }
.empty { color: #64748b; text-align: center; padding: 1rem; }
</style>
