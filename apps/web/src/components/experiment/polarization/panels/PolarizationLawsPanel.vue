<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  polarizerAngle: number
  analyzerAngle: number
  I0: number
  outputIntensity: number
  relativeAngle: number
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.poMalusLaw') }}</div>
      <div class="eq">I = I₀ cos²(θ₂ − θ₁)</div>
      <div class="eq-values">
        I₀ = {{ I0 }}<br>
        θ₁ = {{ polarizerAngle }}°<br>
        θ₂ = {{ analyzerAngle }}°<br>
        Δθ = {{ relativeAngle }}°<br>
        I = {{ outputIntensity.toFixed(2) }}
      </div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.poMaxTransmission') }}</div>
      <div class="eq">I_max = I₀  (when Δθ = 0°)</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.poCompleteExtinction') }}</div>
      <div class="eq">I = 0  (when Δθ = 90°)</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.poTransmissionRatio') }}</div>
      <div class="eq">T = cos²(Δθ) × 100%</div>
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
