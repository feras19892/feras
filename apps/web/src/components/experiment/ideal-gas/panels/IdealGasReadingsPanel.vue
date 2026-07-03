<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
defineProps<{
  n: number
  temp: number
  vol: number
  press: number
  vRms: number
}>()
</script>

<template>
  <div class="readings-panel">
    <div class="row"><span class="label">n</span><span class="val">{{ n.toFixed(2) }} mol</span></div>
    <div class="row"><span class="label">T</span><span class="val">{{ temp }} K</span></div>
    <div class="row"><span class="label">V</span><span class="val">{{ (vol*1000).toFixed(2) }} L</span></div>
    <div class="row"><span class="label">P</span><span class="val">{{ (press/1000).toFixed(1) }} kPa</span></div>
    <div class="row"><span class="label">v<sub>rms</sub></span><span class="val">{{ vRms.toFixed(2) }} ×10² m/s</span></div>
  </div>
</template>

<style scoped>
.readings-panel { display:flex; flex-direction:column; gap:.35rem; }
.row { display:flex; justify-content:space-between; font-size:.78rem; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.03); }
.label { color:#8B95A5; }
.val { color:#D1D7E0; font-weight:600; }
</style>
