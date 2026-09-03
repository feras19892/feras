<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import type { InclinedTrial } from '../../../composables/inclined/useInclinedTrials'
import type { InclinedParams } from '../../../modules/physics/experiments/inclined/useInclinedPhysics'
import InclinedParamsPanel from './InclinedParamsPanel.vue'
import InclinedTablePanel from './InclinedTablePanel.vue'
import InclinedScatterPanel from './InclinedScatterPanel.vue'
import InclinedSignalPanel from './InclinedSignalPanel.vue'
import InclinedEquationsPanel from './InclinedEquationsPanel.vue'
import InclinedStatsPanel from './InclinedStatsPanel.vue'

const props = defineProps<{
  id: string
  trials: InclinedTrial[]
  params: InclinedParams
  sim: { t: number; s: number; v: number; arrived: boolean; running: boolean }
  measured: { acceleration: number | null; timeOfArrival: number | null; finalVelocity: number | null; normalForce: number | null; parallelForce: number | null; frictionForce: number | null; dragForce: number | null }
  trialStats: { a_mean: number; a_std: number; t_mean: number; t_std: number; v_mean: number; v_std: number }
  calcResult: string
}>()

const emit = defineEmits<{
  (e: 'update:params', v: Partial<InclinedParams>): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'calcAcceleration'): void
  (e: 'calcTime'): void
  (e: 'calcVelocity'): void
  (e: 'calcNormal'): void
  (e: 'calcGFromSlope'): void
}>()
</script>

<template>
  <div class="panel-body">
    <InclinedParamsPanel v-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
    <InclinedTablePanel v-else-if="id === 'table'" :trials="trials" @remove="emit('remove', $event)" />
    <InclinedScatterPanel v-else-if="id === 'scatter'" :trials="trials" />
    <InclinedSignalPanel v-else-if="id === 'signal'" :sim-state="sim" :params="params" />
    <InclinedEquationsPanel v-else-if="id === 'equations'" :calc-result="calcResult"
      @calc-acceleration="emit('calcAcceleration')" @calc-time="emit('calcTime')" @calc-velocity="emit('calcVelocity')" @calc-normal="emit('calcNormal')" @calc-g-from-slope="emit('calcGFromSlope')" />
    <InclinedStatsPanel v-else-if="id === 'stats'" :trial-stats="trialStats" :trial-count="trials.length" />
    <div v-else-if="id === 'guide'" class="guide-text">
      <h5>{{ t('experiments.usageGuide') }}</h5>
      <ol>
        <li>{{ t('experiments.inclinedGuideStep1') }}</li>
        <li>{{ t('experiments.inclinedGuideStep2') }}</li>
        <li>{{ t('experiments.inclinedGuideStep3') }}</li>
        <li>{{ t('experiments.inclinedGuideStep4') }}</li>
        <li>{{ t('experiments.inclinedGuideStep5') }}</li>
      </ol>
    </div>
    <div v-else-if="id === 'error'" class="error-text">
      <h5>{{ t('experiments.errorAnalysis') }}</h5>
      <p>{{ t('experiments.errorAnalysisDesc') }}</p>
      <p>{{ t('experiments.noiseAddsError') }}</p>
    </div>
  </div>
</template>

<style scoped>
.panel-body { height: 100%; overflow: auto; }
.guide-text, .error-text { padding: .6rem; font-size: .72rem; color: #B8C0CC; line-height: 1.6; }
.guide-text h5, .error-text h5 { color: #5B8DB8; margin: 0 0 .3rem; }
.guide-text ol { padding-inline-start: 1.2rem; margin: 0; }
.guide-text li { margin-bottom: .2rem; }
</style>
