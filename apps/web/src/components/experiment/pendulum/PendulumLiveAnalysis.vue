<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed } from 'vue'

const props = defineProps<{
  params: { length: number; g: number; theta0: number; mass: number }
  simState: { theta: number; omega: number; t: number }
  measuredT?: number | null
  measuredGCalc?: number | null
  theoreticalPeriod?: number | null
}>()

const liveAnalysisLines = computed(() => {
  const th = props.simState.theta, om = props.simState.omega
  const L = props.params.length, m = props.params.mass
  const v = L * om
  const ke = 0.5 * m * v * v
  const h = L * (1 - Math.cos(th))
  const pe = m * props.params.g * h
  const total = ke + pe
  const lines = [
    `${t('experiments.equationsLabel')}: L=${L.toFixed(3)}m, g=${props.params.g.toFixed(2)}m/s², m=${m.toFixed(3)}kg`,
    String.fromCharCode(0x03B8) + `=${th.toFixed(3)}rad, ω=${om.toFixed(3)}rad/s, v=${v.toFixed(3)}m/s`,
    `KE=${ke.toFixed(3)}J, PE=${pe.toFixed(3)}J, E_total=${total.toFixed(3)}J`,
  ]
  if (props.theoreticalPeriod) {
    lines.push(`T_theo = ${props.theoreticalPeriod.toFixed(4)}s${props.measuredGCalc ? ` | g_calc=${props.measuredGCalc.toFixed(2)}m/s²` : ''}`)
  }
  return lines
})
</script>

<template>
  <div class="live-analysis-card">
    <div class="card-header"><h4>&#x2696;&#xFE0F; {{ t('experiments.liveAnalysis') }}</h4></div>
    <div class="live-analysis-body">
      <div v-for="(line, i) in liveAnalysisLines" :key="i">{{ line }}</div>
    </div>
  </div>
</template>

<style scoped>
.live-analysis-card { background:rgba(37,45,58,.5); border-radius:8px; padding:.6rem; border:1px solid #2D3645; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .3rem; }
.card-header h4 { margin:0; font-size:.82rem; color:#D1D7E0; font-weight:700; }
.live-analysis-body { font-size:.68rem; color:#D1D7E0; line-height:1.7; padding:.2rem .3rem; }
</style>
