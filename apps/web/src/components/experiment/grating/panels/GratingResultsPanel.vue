<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
import type { GratingTrial } from '../../../../composables/grating/useGratingTrials'

const { t } = useI18n()

interface Props {
  trials: GratingTrial[]
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div v-if="trials.length >= 2" class="results">
      <div class="res-row">
        <span class="res-label">{{ t('experiments.dfTrials') }}</span>
        <span class="res-val">{{ trials.length }}</span>
      </div>
      <div class="res-row">
        <span class="res-label">{{ t('experiments.dfAvgTheta1') }}</span>
        <span class="res-val green">{{ (trials.reduce((s, tr) => s + tr.firstOrderAngle, 0) / trials.length).toFixed(3) }}°</span>
      </div>
      <div class="res-row">
        <span class="res-label">{{ t('experiments.dfAvgY1') }}</span>
        <span class="res-val green">{{ (trials.reduce((s, tr) => s + tr.firstOrderY, 0) / trials.length).toFixed(3) }} mm</span>
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
.empty { color: #64748b; text-align: center; padding: 1rem; }
</style>
