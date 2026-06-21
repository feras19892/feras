<script setup lang="ts">
import FreeFallTablePanel from './FreeFallTablePanel.vue'
import FreeFallScatterPanel from './FreeFallScatterPanel.vue'
import FreeFallSignalPanel from './FreeFallSignalPanel.vue'
import FreeFallParamsPanel from './FreeFallParamsPanel.vue'
import FreeFallGuidePanel from './FreeFallGuidePanel.vue'
import FreeFallReportPanel from './FreeFallReportPanel.vue'
import type { FreeFallTrial } from '../../../composables/freefall/useFreeFallTrials'
import type { FreeFallParams } from '../../../modules/physics/experiments/freefall/useFreeFallPhysics'

interface SimState {
  t: number
  y: number
  vy: number
  running: boolean
  paused: boolean
  landed: boolean
}

interface TrialStats {
  time_mean: number
  time_std: number
  g_mean: number
  g_std: number
}

const props = defineProps<{
  id: string
  trials: FreeFallTrial[]
  calcResult: string
  params: FreeFallParams
  simState: SimState
  trialStats: TrialStats | null
  gTheoretical: number
  enableNoise?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:params', val: Partial<FreeFallParams>): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'calcG'): void
  (e: 'calcT'): void
  (e: 'calcV'): void
  (e: 'calcFitG'): void
  (e: 'printReport'): void
  (e: 'openFullReport'): void
}>()

const errorSources = [
  'دقة المؤقت الرقمي',
  'دقة قياس الارتفاع',
  'احتكاك الهواء',
  'اهتزاز الجهاز عند الاصطدام',
  'تأثير الجاذبية المحلية',
]
</script>

<template>
  <FreeFallTablePanel v-if="id === 'table'" :trials="trials" :enable-noise="enableNoise" @remove="emit('remove', $event)" @clear="emit('clear')" />

  <template v-else-if="id === 'equations'">
    <div class="calc-row">
      <button class="btn-calc" @click="emit('calcG')">📐 حساب g</button>
      <button class="btn-calc" @click="emit('calcT')">⏱️ حساب t</button>
      <button class="btn-calc" @click="emit('calcV')">⚡ حساب v</button>
      <button class="btn-calc" @click="emit('calcFitG')">📈 ملائمة g</button>
    </div>
    <div class="calc-result" v-html="calcResult" />
    <div class="equation-list">
      <div class="equation-item"><span class="eq-type">v(t)</span><span class="eq-formula">v = -g·t</span></div>
      <div class="equation-item"><span class="eq-type">y(t)</span><span class="eq-formula">y = y₀ - ½gt²</span></div>
      <div class="equation-item"><span class="eq-type">t_fall</span><span class="eq-formula">t = √(2h/g)</span></div>
      <div class="equation-item"><span class="eq-type">v_impact</span><span class="eq-formula">v = √(2gh)</span></div>
      <div class="equation-item"><span class="eq-type">g_calc</span><span class="eq-formula">g = 2h/t²</span></div>
    </div>
  </template>

  <FreeFallScatterPanel v-else-if="id === 'scatter'" :trials="trials" />

  <template v-else-if="id === 'stats'">
    <div class="stat-section-title">القياسة الحالية</div>
    <div class="stat-row"><span class="stat-label">t</span><span class="stat-value">{{ simState.landed ? (simState.t?.toFixed(4) ?? '--') : '--' }} s</span></div>
    <div class="stat-row"><span class="stat-label">v<sub>impact</sub></span><span class="stat-value">{{ simState.landed ? (Math.abs(simState.vy)?.toFixed(2) ?? '--') : '--' }} m/s</span></div>
    <template v-if="trials.length > 0 && trialStats">
      <div class="stat-section-title">إحصائيات القياسات ({{ trials.length }})</div>
      <div class="stat-row"><span class="stat-label">t̄</span><span class="stat-value">{{ trialStats.time_mean.toFixed(4) }} s</span></div>
      <div class="stat-row"><span class="stat-label">σ<sub>t</sub></span><span class="stat-value">{{ trialStats.time_std.toFixed(4) }} s</span></div>
      <div class="stat-row"><span class="stat-label">ḡ<sub>calc</sub></span><span class="stat-value highlight">{{ trialStats.g_mean.toFixed(2) }} m/s²</span></div>
      <div class="stat-row"><span class="stat-label">σ<sub>g</sub></span><span class="stat-value">{{ trialStats.g_std.toFixed(2) }} m/s²</span></div>
    </template>
  </template>

  <FreeFallSignalPanel v-else-if="id === 'signal'" :sim-state="simState" />
  <FreeFallParamsPanel v-else-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
  <FreeFallGuidePanel v-else-if="id === 'guide'" />

  <template v-else-if="id === 'error'">
    <div class="stat-section-title">مصادر الأخطاء المحتملة</div>
    <ul class="error-list">
      <li v-for="err in errorSources" :key="err">{{ err }}</li>
    </ul>
  </template>

  <FreeFallReportPanel v-else-if="id === 'report'" :trials="trials" :trial-stats="trialStats" :g-theoretical="gTheoretical" @print-report="emit('printReport')" @open-full-report="emit('openFullReport')" />
  <div v-else class="empty">لوحة غير معروفة</div>
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
.error-list { margin: 0; padding-right: 1.2rem; font-size: .78rem; color: #D1D7E0; line-height: 1.8; }
.empty { text-align: center; color: #64748b; font-size: .75rem; padding: 1rem; }
</style>
