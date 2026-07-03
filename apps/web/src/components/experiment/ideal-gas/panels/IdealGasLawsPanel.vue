<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
defineProps<{
  n: number
  temp: number
  vol: number
  press: number
}>()
</script>

<template>
  <div class="laws-panel">
    <div class="law">
      <h4>{{ t('experiments.idealGasLaw') }}</h4>
      <p class="formula">P · V = n · R · T</p>
      <p class="values">P = {{ (press/1000).toFixed(1) }} kPa &nbsp; V = {{ (vol*1000).toFixed(2) }} L</p>
      <p class="values">n = {{ n.toFixed(2) }} mol &nbsp; T = {{ temp }} K</p>
    </div>
    <div class="law">
      <h4>{{ t('experiments.idealGasPressure') }}</h4>
      <p class="formula">P = nRT / V</p>
      <p class="values">P = ({{ n.toFixed(2) }} × 8.314 × {{ temp }}) / {{ vol.toFixed(5) }}</p>
      <p class="values">P = {{ press.toFixed(1) }} Pa</p>
    </div>
  </div>
</template>

<style scoped>
.laws-panel { display:flex; flex-direction:column; gap:.6rem; }
.law { background:rgba(255,255,255,.03); border-radius:6px; padding:.5rem; }
.law h4 { margin:0 0 .3rem; color:#5B8DB8; font-size:.8rem; }
.formula { font-family:monospace; color:#fbbf24; font-size:.85rem; margin:.2rem 0; }
.values { color:#8B95A5; font-size:.72rem; margin:.1rem 0; }
</style>
