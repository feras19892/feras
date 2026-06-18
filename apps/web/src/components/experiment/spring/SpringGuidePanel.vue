<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  mass: number; k: number; amplitude: number; damping: number; running?: boolean;
  measuredT?: number | null; measuredF?: number | null; measuredOmega?: number | null; measuredKCalc?: number | null;
}>()

const analysisVals = computed(() => {
  const omega0 = props.mass > 1e-9 && props.k > 1e-9 ? Math.sqrt(props.k / props.mass) : 0
  return {
    omega0: omega0.toFixed(3),
    vmax: props.running ? (props.amplitude * omega0).toFixed(3) : '--'
  }
})
</script>

<template>
  <div class="guide-panel">
    <div class="guide-row"><span class="guide-label">m</span><span class="guide-value">{{ mass.toFixed(2) }} kg</span></div>
    <div class="guide-row"><span class="guide-label">k</span><span class="guide-value">{{ k.toFixed(0) }} N/m</span></div>
    <div class="guide-row"><span class="guide-label">A</span><span class="guide-value">{{ amplitude.toFixed(3) }} m</span></div>
    <div class="guide-row"><span class="guide-label">ω₀</span><span class="guide-value">{{ analysisVals.omega0 }} rad/s</span></div>
    <div class="guide-row"><span class="guide-label">vmax</span><span class="guide-value">{{ analysisVals.vmax }} m/s</span></div>
    <div class="guide-row"><span class="guide-label">T</span><span class="guide-value">{{ measuredT?.toFixed(4) ?? '--' }} s</span></div>
    <div class="guide-row"><span class="guide-label">f</span><span class="guide-value">{{ measuredF?.toFixed(3) ?? '--' }} Hz</span></div>
    <div class="guide-row"><span class="guide-label">ω</span><span class="guide-value">{{ measuredOmega?.toFixed(3) ?? '--' }} rad/s</span></div>
    <div class="guide-row"><span class="guide-label">k<sub>calc</sub></span><span class="guide-value highlight">{{ measuredKCalc?.toFixed(2) ?? '--' }} N/m</span></div>
  </div>
</template>

<style scoped>
.guide-panel { display:flex; flex-direction:column; gap:.15rem; }
.guide-row { display:flex; justify-content:space-between; padding:.15rem .3rem; border-radius:4px; background:#252D3A; }
.guide-label { font-size:.68rem; color:#8B95A5; font-weight:600; }
.guide-value { font-size:.75rem; font-weight:700; color:#D1D7E0; font-family:monospace; }
.guide-value.highlight { color:#5B8DB8; }
</style>
