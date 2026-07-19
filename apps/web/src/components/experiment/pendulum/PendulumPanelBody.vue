<script setup lang="ts">
import PendulumDataPanel from './PendulumDataPanel.vue'
import PendulumParamPanel from './PendulumParamPanel.vue'
import PendulumSignalChart from './PendulumSignalChart.vue'
import type { PendulumTrial } from '../../../composables/pendulum/usePendulumTrials'
import type { PendulumParams } from '../../../modules/physics/experiments/pendulum/usePendulumPhysics'
import { useI18n } from '../../../composables/useI18n'

interface Measured { T: number | null; f: number | null; omega: number | null; gCalc: number | null }
interface SimState { theta: number; omega: number; t: number; running: boolean; paused: boolean; signalSeries: { t: number; theta: number }[]; measurementPeriod: number | null }

const { t } = useI18n()
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
        <p><b>ðŸ”¬ Ù…Ù„Ø§Ø­Ø¸Ø© Ø¹Ù„Ù…ÙŠØ© Ù…Ù‡Ù…Ø©:</b></p>
        <p>ÙÙŠ Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø© <code>T = 2Ï€âˆš(L/g)</code> Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…ØªØºÙŠØ± Ø§Ù„ÙƒØªÙ„Ø© (<code>m</code>)ØŒ Ù…Ù…Ø§ ÙŠØ¹Ù†ÙŠ Ø£Ù† <strong>Ø§Ù„Ø²Ù…Ù† Ø§Ù„Ø¯ÙˆØ±ÙŠ (T) Ù„Ø§ ÙŠØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ ÙƒØªÙ„Ø© Ø§Ù„Ø¬Ø³Ù… Ø§Ù„Ù…Ø¹Ù„Ù‚</strong>.</p>
        <p>Ø¬Ø±Ø¨ ØªØºÙŠÙŠØ± ÙƒØªÙ„Ø© Ø§Ù„Ø¨Ù†Ø¯ÙˆÙ„ Ù…Ù† Ù„ÙˆØ­Ø© Ø§Ù„Ù…ØªØºÙŠØ±Ø§Øª â€” Ø³ØªØ¬Ø¯ Ø£Ù† T Ø«Ø§Ø¨Øª ØªÙ‚Ø±ÙŠØ¨Ø§Ù‹ Ø±ØºÙ… ØªØºÙŠÙ‘Ø± Ø§Ù„ÙƒØªÙ„Ø©!</p>
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
