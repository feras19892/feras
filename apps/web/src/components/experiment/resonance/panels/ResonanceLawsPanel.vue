<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
interface Props { stringLength: number; tension: number; harmonic: number; frequency: number; wavelength: number; waveSpeed: number }

defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.reStandingWaveFreq') }}</div>
      <div class="eq">f_n = n v / (2L)</div>
      <div class="eq-values">n = {{ harmonic }}, L = {{ stringLength.toFixed(2) }} m, f = {{ frequency.toFixed(1) }} Hz</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.reWavelengthEq') }}</div>
      <div class="eq">λ_n = 2L / n</div>
      <div class="eq-values">λ = {{ wavelength.toFixed(3) }} m</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.reWaveSpeedEq') }}</div>
      <div class="eq">v = f × λ</div>
      <div class="eq-values">v = {{ waveSpeed.toFixed(1) }} m/s</div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .5rem; font-size: .82rem; }
.eq-block { margin-bottom: .3rem; }
.eq-title { color: #5B8DB8; font-size: .75rem; margin-bottom: .2rem; }
.eq { font-family: 'Courier New', monospace; background: #0d1117; padding: .3rem .5rem; border-radius: 4px; font-size: .9rem; color: #7ee787; }
.eq-values { font-size: .8rem; color: #8B95A5; margin-top: .2rem; }
</style>