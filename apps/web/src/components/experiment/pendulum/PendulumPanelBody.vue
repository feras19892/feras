<script setup lang="ts">
import PendulumDataPanel from './PendulumDataPanel.vue'
import PendulumParamPanel from './PendulumParamPanel.vue'
import PendulumSignalChart from './PendulumSignalChart.vue'
import PendulumLiveAnalysis from './PendulumLiveAnalysis.vue'
import PendulumTutorCard from './PendulumTutorCard.vue'
import PendulumScatterChart from './PendulumScatterChart.vue'
import PendulumFFTPanel from './PendulumFFTPanel.vue'
import PendulumPhaseSpace from './PendulumPhaseSpace.vue'
import type { PanelId } from '../../../composables/pendulum/usePendulumLayout'
import type { PendulumTrial } from '../../../composables/pendulum/usePendulumTrials'
import type { PendulumParams } from '../../../modules/physics/experiments/pendulum/usePendulumPhysics'

interface Measured { T: number | null; f: number | null; omega: number | null; gCalc: number | null }
interface SimState { theta: number; omega: number; t: number; running: boolean; paused: boolean; signalSeries: { t: number; theta: number }[]; measurementPeriod: number | null }

const props = defineProps<{
  id: PanelId; trials: PendulumTrial[]; calcResult: string; params: PendulumParams; sim: SimState
  measured: Measured; fftResult: { freqs: number[]; amplitudes: number[]; dominantFreq: number } | null
  trialStats: { T_mean: number; T_std: number; g_mean: number; g_std: number }
  tutorType: 'info' | 'warn' | 'success'; tutorMessage: string; canvasSnapshot?: string
}>()

const emit = defineEmits<{
  (e: 'update:trials', val: PendulumTrial[]): void; (e: 'update:fftResult', val: any): void; (e: 'update:params', val: PendulumParams): void
  (e: 'remove', id: number): void; (e: 'clear'): void; (e: 'calcG'): void; (e: 'calcT'): void; (e: 'calcL'): void; (e: 'calcFitG'): void; (e: 'showCalc', html: string): void
}>()
</script>

<template>
  <PendulumDataPanel v-if="id === 'table'" :model-value="trials" @update:model-value="emit('update:trials', $event)" :calc-result="calcResult" @remove="emit('remove', $event)" @clear="emit('clear')" @calc-g="emit('calcG')" @calc-t="emit('calcT')" @calc-l="emit('calcL')" @calc-fit-g="emit('calcFitG')" />
  <template v-else-if="id === 'equations'">
    <div class="calc-row">
      <button class="btn-calc" @click="emit('calcG')">g من L,T</button>
      <button class="btn-calc" @click="emit('calcT')">T من L,g</button>
      <button class="btn-calc" @click="emit('calcL')">L من T,g</button>
      <button class="btn-calc" @click="emit('calcFitG')">g من regression</button>
    </div>
    <div class="calc-result" v-html="calcResult" />
    <div class="equation-list">
      <div class="equation-item"><span class="eq-type">SHM</span><span class="eq-formula">T = 2π√(L/g)</span></div>
      <div class="equation-item"><span class="eq-type">ω₀</span><span class="eq-formula">ω₀ = √(g/L)</span></div>
      <div class="equation-item"><span class="eq-type">g</span><span class="eq-formula">g = 4π²L/T²</span></div>
    </div>
  </template>
  <PendulumParamPanel v-else-if="id === 'params'" :model-value="params" @update:model-value="emit('update:params', $event)" />
  <template v-else-if="id === 'stats'">
    <div class="stat-section-title">القياسة الحالية</div>
    <div class="stat-row"><span class="stat-label">T</span><span class="stat-value">{{ measured.T?.toFixed(4) ?? '--' }} s</span></div>
    <div class="stat-row"><span class="stat-label">f</span><span class="stat-value">{{ measured.f?.toFixed(3) ?? '--' }} Hz</span></div>
    <div class="stat-row"><span class="stat-label">ω</span><span class="stat-value">{{ measured.omega?.toFixed(3) ?? '--' }} rad/s</span></div>
    <div class="stat-row"><span class="stat-label">g<sub>calc</sub></span><span class="stat-value highlight">{{ measured.gCalc?.toFixed(2) ?? '--' }} m/s²</span></div>
    <template v-if="trials.length > 0">
      <div class="stat-section-title">إحصائيات القياسات ({{ trials.length }})</div>
      <div class="stat-row"><span class="stat-label">T̄</span><span class="stat-value">{{ trialStats.T_mean.toFixed(4) }} s</span></div>
      <div class="stat-row"><span class="stat-label">σ<sub>T</sub></span><span class="stat-value">{{ trialStats.T_std.toFixed(4) }} s</span></div>
      <div class="stat-row"><span class="stat-label">ḡ<sub>calc</sub></span><span class="stat-value">{{ trialStats.g_mean.toFixed(2) }} m/s²</span></div>
      <div class="stat-row"><span class="stat-label">σ<sub>g</sub></span><span class="stat-value">{{ trialStats.g_std.toFixed(2) }} m/s²</span></div>
    </template>
  </template>
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
        <li>اضغط "g من regression" لحساب g</li>
      </ol>
      <p><b>ملاحظة:</b> زمن البندول لا يعتمد على الكتلة.</p>
    </div>
  </template>
  <PendulumSignalChart v-else-if="id === 'signal'" :series="sim.signalSeries" :params="{ length: params.length, g: params.g, theta0: params.theta0 }" :sim-t="sim.t" />
  <PendulumFFTPanel v-else-if="id === 'fft'" :model-value="fftResult" @update:model-value="emit('update:fftResult', $event)" :signal-series="sim.signalSeries" :params="{ length: params.length, g: params.g }" />
  <PendulumPhaseSpace v-else-if="id === 'phase'" :theta="sim.theta" :omega="sim.omega" :running="sim.running" />
  <PendulumScatterChart v-else-if="id === 'scatter'" :trials="trials" @calc-slope="(slope, intercept, r2) => emit('showCalc', `T² = ${slope.toFixed(5)}·L ${intercept >= 0 ? '+' : ''} ${intercept.toFixed(5)}<br>R² = ${r2.toFixed(4)}<br>g = 4π² / ${slope.toFixed(5)} = <b>${(4 * Math.PI * Math.PI / slope).toFixed(2)} m/s²</b>`)" />
  <template v-else-if="id === 'tutor'">
    <PendulumLiveAnalysis :params="{ length: params.length, g: params.g, theta0: params.theta0, mass: params.mass }" :sim-state="{ theta: sim.theta, omega: sim.omega, t: sim.t }" :measured-t="measured.T" :measured-g-calc="measured.gCalc" :theoretical-period="2 * Math.PI * Math.sqrt(params.length / params.g)" />
    <PendulumTutorCard :tutor-type="tutorType" :tutor-message="tutorMessage" :measured-t="measured.T" :measured-f="measured.f" :measured-omega="measured.omega" />
  </template>
  <template v-else-if="id === 'error'">
    <div class="error-list">
      <div class="error-item">احتكاك الهواء</div>
      <div class="error-item">دقة ساعة الإيقاف</div>
      <div class="error-item">خطأ زاوية النظر</div>
      <div class="error-item">حركة اليد عند الإطلاق</div>
      <div class="error-item">كتلة الخيط غير مهملة</div>
      <div class="error-item">زاوية كبيرة (>10°)</div>
    </div>
  </template>
</template>

<style scoped>
.calc-row { display: flex; flex-wrap: wrap; gap: .3rem; margin-bottom: .4rem; }
.btn-calc { background: #252D3A; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 4px; padding: .25rem .5rem; font-size: .72rem; cursor: pointer; }
.btn-calc:hover { background: rgba(91,141,184,.1); color: #5B8DB8; }
.calc-result { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .4rem; font-size: .78rem; margin-bottom: .4rem; min-height: 30px; }
.equation-list { display: flex; flex-direction: column; gap: .2rem; }
.equation-item { display: flex; justify-content: space-between; padding: .15rem .3rem; background: #252D3A; border-radius: 4px; font-size: .75rem; }
.eq-type { color: #5B8DB8; font-weight: 700; }
.eq-formula { color: #D1D7E0; font-family: monospace; }
.stat-section-title { font-size: .72rem; color: #5B8DB8; font-weight: 700; margin: .4rem 0 .2rem; border-bottom: 1px solid #2D3645; padding-bottom: .15rem; }
.stat-row { display: flex; justify-content: space-between; padding: .15rem .3rem; border-radius: 4px; background: #252D3A; margin-bottom: .15rem; }
.stat-label { font-size: .7rem; color: #8B95A5; font-weight: 600; }
.stat-value { font-size: .75rem; font-weight: 700; color: #D1D7E0; font-family: monospace; }
.stat-value.highlight { color: #5B8DB8; }
.guide-text { font-size: .75rem; color: #D1D7E0; line-height: 1.6; }
.guide-text ol { padding-right: 1.2rem; margin: .3rem 0; }
.guide-text li { margin-bottom: .2rem; }
.tutor-card { border-radius: 6px; padding: .4rem; margin-bottom: .3rem; font-size: .75rem; }
.tutor-card.info { background: rgba(91,141,184,.1); border: 1px solid rgba(91,141,184,.3); }
.tutor-card.warn { background: rgba(234,179,8,.1); border: 1px solid rgba(234,179,8,.3); }
.tutor-card.success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); }
.tutor-title { font-weight: 700; margin-bottom: .2rem; }
.tutor-msg { color: #D1D7E0; }
.tutor-measure { font-size: .7rem; color: #5B8DB8; font-family: monospace; text-align: center; padding: .2rem; }
.error-list { display: flex; flex-direction: column; gap: .2rem; }
.error-item { background: #252D3A; border-radius: 4px; padding: .3rem .4rem; font-size: .72rem; color: #D1D7E0; }
</style>
