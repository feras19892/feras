<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'

import type { PolarizationTrial } from '../../../../composables/polarization/usePolarizationTrials'





interface Props {
  trials: PolarizationTrial[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
  i0FromRegression: number | null
  theoreticalI0: number
}
const props = defineProps<Props>()

const errorPercent = computed(() => {
  if (props.i0FromRegression === null || props.theoreticalI0 <= 0) return null
  return Math.abs((props.i0FromRegression - props.theoreticalI0) / props.theoreticalI0) * 100
})
</script>

<template>
  <div class="panel-body">
    <div v-if="trials.length >= 2" class="results">
      <div class="res-row"><span class="res-label">{{ t('experiments.poTrials') }}</span><span class="res-val">{{ trials.length }}</span></div>

      <!-- Regression results per report: I = I₀ cos²θ -->
      <div class="res-row"><span class="res-label">{{ t('experiments.poSlope') }}</span><span class="res-val highlight">{{ regressionSlope.toFixed(2) }}</span></div>
      <div class="res-row"><span class="res-label">{{ t('experiments.poI0Theory') }}</span><span class="res-val">{{ theoreticalI0.toFixed(2) }}</span></div>
      <div class="res-row" v-if="i0FromRegression !== null"><span class="res-label">{{ t('experiments.poI0Reg') }}</span><span class="res-val green">{{ i0FromRegression.toFixed(2) }}</span></div>
      <div class="res-row"><span class="res-label">R²</span><span class="res-val">{{ rSquared.toFixed(4) }}</span></div>
      <div class="res-row" v-if="errorPercent !== null"><span class="res-label">{{ t('experiments.poErrorPercent') }}</span><span class="res-val">{{ errorPercent.toFixed(2) }}%</span></div>

      <div class="divider"></div>

      <div class="res-row"><span class="res-label">{{ t('experiments.poAvgI') }}</span><span class="res-val">{{ (trials.reduce((s, tr) => s + tr.outputIntensity, 0) / trials.length).toFixed(2) }}</span></div>
      <div class="res-row"><span class="res-label">{{ t('experiments.poAvgDelta') }}</span><span class="res-val">{{ (trials.reduce((s, tr) => s + tr.relativeAngle, 0) / trials.length).toFixed(1) }}°</span></div>
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
