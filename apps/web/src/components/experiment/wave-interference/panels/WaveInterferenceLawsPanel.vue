<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
interface Props { sourceDistance: number; wavelength: number; frequency: number; screenDistance: number; vWave: number }
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.wiWaveSpeedEq') }}</div>
      <div class="eq">v = f × λ</div>
      <div class="eq-values">v = {{ vWave.toFixed(1) }} m/s, f = {{ frequency }} Hz, λ = {{ (wavelength * 1000).toFixed(1) }} mm</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.wiConstructiveEq') }}</div>
      <div class="eq">Δr = m × λ</div>
      <div class="eq-values">{{ t('experiments.wiPathDiffInteger') }}</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.wiDestructiveEq') }}</div>
      <div class="eq">Δr = (m + 1/2) × λ</div>
      <div class="eq-values">{{ t('experiments.wiPathDiffHalf') }}</div>
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
