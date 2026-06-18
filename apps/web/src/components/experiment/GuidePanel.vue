<script setup lang="ts">
interface Props {
  mass: number;
  k: number;
  amplitude: number;
  theoreticalPeriod?: number | null;
  measuredT?: number | null;
  measuredF?: number | null;
  measuredOmega?: number | null;
  measuredKCalc?: number | null;
}
defineProps<Props>();
</script>

<template>
  <div class="lab-card guide-card">
    <div class="card-header"><h4>📖 دليل</h4></div>
    <div class="guide-row"><span class="guide-label">m</span><span class="guide-value">{{ mass.toFixed(2) }} kg</span></div>
    <div class="guide-row"><span class="guide-label">k</span><span class="guide-value">{{ k.toFixed(0) }} N/m</span></div>
    <div class="guide-row"><span class="guide-label">A</span><span class="guide-value">{{ amplitude.toFixed(3) }} m</span></div>
    <div class="guide-row"><span class="guide-label">T<sub>نظري</sub></span><span class="guide-value">{{ theoreticalPeriod?.toFixed(4) ?? '--' }} s</span></div>
    <div class="guide-row"><span class="guide-label">T</span><span class="guide-value">{{ measuredT?.toFixed(4) ?? '--' }} s</span></div>
    <div class="guide-row"><span class="guide-label">f</span><span class="guide-value">{{ measuredF?.toFixed(3) ?? '--' }} Hz</span></div>
    <div class="guide-row"><span class="guide-label">ω</span><span class="guide-value">{{ measuredOmega?.toFixed(3) ?? '--' }} rad/s</span></div>
    <div class="guide-row"><span class="guide-label">k<sub>calc</sub></span><span class="guide-value highlight">{{ measuredKCalc?.toFixed(2) ?? '--' }} N/m</span></div>
  </div>
</template>

<style scoped>
.guide-row { display: flex; justify-content: space-between; font-size: 0.75rem; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.guide-label { color: #94a3b8; }
.guide-value { color: #cbd5e1; }
.highlight { color: #67e8f9; font-weight: 700; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.card-header h4 { margin: 0; font-size: 0.85rem; color: #67e8f9; }
</style>
