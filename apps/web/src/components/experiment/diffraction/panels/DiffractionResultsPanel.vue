<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'

import type { DiffractionTrial } from '../../../../composables/diffraction/useDiffractionTrials'





interface Props {
  trials: DiffractionTrial[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
  lambdaFromRegression: number | null
  theoreticalLambda: number
  screenDistance: number
}
const props = defineProps<Props>()

const singleTrials = computed(() => props.trials.filter(tr => tr.mode === 'single'))

const errorPercent = computed(() => {
  if (props.lambdaFromRegression === null || props.theoreticalLambda <= 0) return null
  return Math.abs((props.lambdaFromRegression - props.theoreticalLambda) / props.theoreticalLambda) * 100
})
</script>

<template>
  <div class="panel-body">
    <div v-if="trials.length >= 2" class="results">
      <div class="res-row"><span class="res-label">{{ t('experiments.dfTrials') }}</span><span class="res-val">{{ trials.length }}</span></div>

      <!-- Single slit regression results per report: y = λD · (1/a) -->
      <template v-if="singleTrials.length >= 2">
        <div class="res-row"><span class="res-label">{{ t('experiments.dfSlope') }}</span><span class="res-val highlight">{{ regressionSlope.toFixed(3) }}</span></div>
        <div class="res-row"><span class="res-label">{{ t('experiments.dfScreenDistance') }}</span><span class="res-val">{{ screenDistance.toFixed(2) }} m</span></div>
        <div class="res-row" v-if="lambdaFromRegression !== null"><span class="res-label">{{ t('experiments.dfLambdaFromSlope') }}</span><span class="res-val green">{{ lambdaFromRegression.toFixed(1) }} nm</span></div>
        <div class="res-row"><span class="res-label">{{ t('experiments.dfLambdaTheory') }}</span><span class="res-val">{{ theoreticalLambda }} nm</span></div>
        <div class="res-row"><span class="res-label">R²</span><span class="res-val">{{ rSquared.toFixed(4) }}</span></div>
        <div class="res-row" v-if="errorPercent !== null"><span class="res-label">{{ t('experiments.dfErrorPercent') }}</span><span class="res-val">{{ errorPercent.toFixed(2) }}%</span></div>
        <div class="divider"></div>
      </template>

      <div class="res-row" v-if="trials[0]?.mode === 'single'">
        <span class="res-label">{{ t('experiments.dfAvgW') }}</span>
        <span class="res-val">{{ (trials.reduce((s, tr) => s + tr.centralWidth, 0) / trials.length).toFixed(3) }} mm</span>
      </div>
      <div class="res-row" v-else>
        <span class="res-label">{{ t('experiments.dfAvgTheta1') }}</span>
        <span class="res-val">{{ (trials.reduce((s, tr) => s + tr.firstOrderAngle, 0) / trials.length).toFixed(3) }}°</span>
      </div>
      <div class="res-row" v-if="trials[0]?.mode === 'single'">
        <span class="res-label">{{ t('experiments.dfAvgY1') }}</span>
        <span class="res-val">{{ (trials.reduce((s, tr) => s + tr.darkFringe1, 0) / trials.length).toFixed(3) }} mm</span>
      </div>
      <div class="res-row" v-else>
        <span class="res-label">{{ t('experiments.dfAvgY1') }}</span>
        <span class="res-val">{{ (trials.reduce((s, tr) => s + tr.firstOrderY, 0) / trials.length).toFixed(3) }} mm</span>
      </div>
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
