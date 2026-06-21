<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  params: { mass: number; k: number; amplitude: number }
  simState: { x: number; v: number; t: number }
  measuredT?: number | null
  measuredKCalc?: number | null
  theoreticalPeriod?: number | null
}>()

const liveAnalysisLines = computed(() => {
  const x = props.simState.x, v = props.simState.v
  const ke = 0.5 * props.params.mass * v * v
  const pe = 0.5 * props.params.k * x * x
  const total = ke + pe
  const fr = -props.params.k * x
  const lines = [
    `المعادلات: m=${props.params.mass.toFixed(3)}kg, k=${props.params.k.toFixed(1)}N/m, A=${props.params.amplitude.toFixed(3)}m`,
    `x=${x.toFixed(3)}m, v=${v.toFixed(3)}m/s, F_r=${fr.toFixed(3)}N`,
    `KE=${ke.toFixed(3)}J, PE=${pe.toFixed(3)}J, E_total=${total.toFixed(3)}J`,
  ]
  if (props.theoreticalPeriod) {
    lines.push(`T_theo = ${props.theoreticalPeriod.toFixed(4)}s${props.measuredKCalc ? ` | k_calc=${props.measuredKCalc.toFixed(2)}N/m` : ''}`)
  }
  return lines
})
</script>

<template>
  <div class="live-analysis-card">
    <div class="card-header"><h4>&#x2696;&#xFE0F; التحليل المباشر</h4></div>
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
