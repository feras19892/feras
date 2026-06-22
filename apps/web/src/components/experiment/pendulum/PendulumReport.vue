<script setup lang="ts">
import { computed } from 'vue'
import ExperimentReport from '../ExperimentReport.vue'
import DeletableSection from '../DeletableSection.vue'
import type { PendulumTrial } from '../../../composables/pendulum/usePendulumTrials'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{ trials: PendulumTrial[]; gTheoretical: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'open-full-report'): void }>()

const gAvg = computed(() => { if (!props.trials.length) return null; const gs = props.trials.map(t => t.gCalc); return gs.reduce((a, b) => a + b, 0) / gs.length })
const errorPercent = computed(() => { if (gAvg.value === null) return null; return Math.abs((gAvg.value - props.gTheoretical) / props.gTheoretical) * 100 })

const sourcesOfError = [
  t('experiments.airFrictionWithWeight'),
  t('experiments.humanStopwatchAccuracy'),
  t('experiments.parallaxError'),
  t('experiments.handMovementAtLaunch'),
  t('experiments.stringMassNotNegligible'),
  t('experiments.largeAngleApproximation'),
]
</script>

<template>
  <ExperimentReport student-storage-key="pendulum_report_student" :has-data="trials.length > 0" @close="emit('close')" @open-full-report="emit('open-full-report')">
    <template #content>
      <DeletableSection v-if="trials.length">
        <h5>{{ t('experiments.dynamicPart') }} ({{ t('experiments.pendulumLabel') }})</h5>
        <table class="report-table">
          <thead><tr><th>#</th><th>L (m)</th><th>T (s)</th><th>f (Hz)</th><th>g (m/s²)</th></tr></thead>
          <tbody>
            <tr v-for="(t, i) in trials" :key="i">
              <td>{{ i + 1 }}</td><td>{{ t.length.toFixed(3) }}</td><td>{{ t.T.toFixed(3) }}</td><td>{{ t.f.toFixed(3) }}</td><td>{{ t.gCalc.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </DeletableSection>
      <DeletableSection v-if="gAvg !== null">
        <h5>{{ t('experiments.comparisonAndConclusion') }}</h5>
        <div class="result-line"><b>{{ t('experiments.averageG') }}:</b> {{ gAvg.toFixed(2) }} m/s²</div>
        <div class="result-line"><b>{{ t('experiments.theoreticalG') }}:</b> {{ gTheoretical.toFixed(2) }} m/s²</div>
        <div class="result-line" v-if="errorPercent !== null"><b>{{ t('experiments.errorPercentage') }}:</b> {{ errorPercent.toFixed(2) }}%</div>
        <div class="error-sources"><h6>{{ t('experiments.errorSources') }}:</h6><ul><li v-for="err in sourcesOfError" :key="err">{{ err }}</li></ul></div>
      </DeletableSection>
    </template>
  </ExperimentReport>
</template>

<style src="../spring/SpringReport.css" scoped></style>
