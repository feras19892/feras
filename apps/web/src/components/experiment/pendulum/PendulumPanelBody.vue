<script setup lang="ts">
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
      <p><b>خطوات التجربة:</b></p>
      <ol>
        <li>اضبط طول الخيط L (مثلاً 0.50 m)</li>
        <li>اضبط الزاوية الأولية θ₀ ≤ 10°</li>
        <li>اضغط "بدء" لبدء الاهتزاز</li>
        <li>انتظر استقرار القراءة</li>
        <li>اضغط "تسجيل" لحفظ القراءة</li>
        <li>غيّر L وكرر للحصول على قياسات متعددة</li>
        <li>اضغط "قسم الرسم والحسابات" للحصول على g</li>
      </ol>
      <p><b>ملاحظة:</b> زمن البندول لا يعتمد على الكتلة.</p>
    </div>
  </template>
  <PendulumSignalChart v-else-if="id === 'signal'" :series="sim.signalSeries" :params="{ length: params.length, g: params.g, theta0: params.theta0 }" :sim-t="sim.t" />
</template>

<style scoped>
.guide-text { font-size: .75rem; color: #D1D7E0; line-height: 1.6; }
.guide-text ol { padding-right: 1.2rem; margin: .3rem 0; }
.guide-text li { margin-bottom: .2rem; }
</style>
