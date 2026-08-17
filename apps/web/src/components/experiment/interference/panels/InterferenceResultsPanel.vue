<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import type { InterferenceTrial } from '../../../../composables/interference/useInterferenceTrials'
const { t } = useI18n()

interface Props {
  trials: InterferenceTrial[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
  lambdaFromRegression: number | null
  theoreticalLambda: number
  screenDistance: number
}
const props = defineProps<Props>()

const errorPercent = computed(() => {
  if (props.lambdaFromRegression === null || props.theoreticalLambda <= 0) return null
  return Math.abs((props.lambdaFromRegression - props.theoreticalLambda) / props.theoreticalLambda) * 100
})
</script>

<template>
  <div class="panel-body">
    <div v-if="trials.length >= 2" class="results">
      <div class="res-row"><span class="res-label">Trials</span><span class="res-val">{{ trials.length }}</span></div>

      <!-- Regression results per report: Δy = λD · (1/d) -->
      <div class="res-row"><span class="res-label">Slope (= λ·D/1000)</span><span class="res-val highlight">{{ regressionSlope.toFixed(3) }}</span></div>
      <div class="res-row"><span class="res-label">D (screen dist)</span><span class="res-val">{{ screenDistance.toFixed(2) }} m</span></div>
      <div class="res-row" v-if="lambdaFromRegression !== null"><span class="res-label">λ (from slope)</span><span class="res-val green">{{ lambdaFromRegression.toFixed(1) }} nm</span></div>
      <div class="res-row"><span class="res-label">λ (theory)</span><span class="res-val">{{ theoreticalLambda }} nm</span></div>
      <div class="res-row"><span class="res-label">R²</span><span class="res-val">{{ rSquared.toFixed(4) }}</span></div>
      <div class="res-row" v-if="errorPercent !== null"><span class="res-label">Error %</span><span class="res-val">{{ errorPercent.toFixed(2) }}%</span></div>
      <div class="divider"></div>

      <div class="res-row">
        <span class="res-label">Avg Δy</span>
        <span class="res-val">{{ (trials.reduce((s, tr) => s + tr.fringeSpacing, 0) / trials.length).toFixed(3) }} mm</span>
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
