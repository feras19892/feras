<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import PendulumDataPanel from './PendulumDataPanel.vue'
import PendulumParamPanel from './PendulumParamPanel.vue'
import PendulumSignalChart from './PendulumSignalChart.vue'
import type { PendulumTrial } from '../../../composables/pendulum/usePendulumTrials'
import type { PendulumParams } from '../../../modules/physics/experiments/pendulum/usePendulumPhysics'

interface Measured { T: number | null; f: number | null; omega: number | null; gCalc: number | null }
interface SimState { theta: number; omega: number; t: number; running: boolean; paused: boolean; signalSeries: { t: number; theta: number }[]; measurementPeriod: number | null }

const props = defineProps<{
  id: string; trials: PendulumTrial[]; params: PendulumParams; sim: SimState; measured: Measured
}>()

const emit = defineEmits<{
  (e: 'update:trials', val: PendulumTrial[]): void; (e: 'update:params', val: PendulumParams): void
  (e: 'remove', id: number): void; (e: 'clear'): void
}>()
</script>

<template>
  <PendulumDataPanel v-if="id === 'table'" :model-value="trials" @update:model-value="emit('update:trials', $event)" @remove="emit('remove', $event)" @clear="emit('clear')" />
  <PendulumParamPanel v-else-if="id === 'params'" :model-value="params" @update:model-value="emit('update:params', $event)" />
  <template v-else-if="id === 'guide'">
    <div class="guide-text">
      <p><b>{{ t('experiments.experimentSteps') }}:</b></p>
      <ol>
        <li>{{ t('experiments.pendulumGuideStep1') }}</li>
        <li>{{ t('experiments.pendulumGuideStep2') }}</li>
        <li>{{ t('experiments.pendulumGuideStep3') }}</li>
        <li>{{ t('experiments.pendulumGuideStep4') }}</li>
        <li>{{ t('experiments.pendulumGuideStep5') }}</li>
        <li>{{ t('experiments.pendulumGuideStep6') }}</li>
        <li>{{ t('experiments.pendulumGuideStep7') }}</li>
      </ol>
      <p><b>{{ t('experiments.note') }}:</b> {{ t('experiments.pendulumNote') }}</p>
      <div class="mass-independence-note">
        <p><b>🔬 ملاحظة علمية مهمة:</b></p>
        <p>في المعادلة <code>T = 2π√(L/g)</code> لا يوجد متغير الكتلة (<code>m</code>)، مما يعني أن <strong>الزمن الدوري (T) لا يعتمد على كتلة الجسم المعلق</strong>.</p>
        <p>جرّب تغيير كتلة البندول من لوحة المتغيرات — ستجد أن T ثابت تقريبًا رغم تغيّر الكتلة!</p>
      </div>
    </div>
  </template>
  <PendulumSignalChart v-else-if="id === 'signal'" :series="sim.signalSeries" :params="{ length: params.length, g: params.g, theta0: params.theta0 }" :sim-t="sim.t" />
</template>

<style scoped>
.guide-text { font-size: .75rem; color: #D1D7E0; line-height: 1.6; }
.guide-text ol { padding-inline-start: 1.2rem; margin: .3rem 0; }
.guide-text li { margin-bottom: .2rem; }
.mass-independence-note { background: #1a2332; border: 1px solid #2D3645; border-radius: 6px; padding: .5rem .6rem; margin-top: .5rem; text-align: start; }
.mass-independence-note p { margin: .2rem 0; }
.mass-independence-note code { background: #252D3A; padding: .05rem .25rem; border-radius: 3px; font-family: monospace; font-size: .75rem; }
</style>
