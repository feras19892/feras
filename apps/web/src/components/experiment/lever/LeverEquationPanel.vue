<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="equation-panel">
    <div class="eq-title">&#x1F9EA; {{ t('experiments.leverLaw') }}</div>
    <div class="eq-formula">τ = m · g · x</div>
    <div class="eq-desc">
      <p><strong>m</strong> = {{ t('experiments.mass') }} (kg)</p>
      <p><strong>g</strong> = {{ t('experiments.gravity') }} (9.81 m/s²)</p>
      <p><strong>x</strong> = {{ t('experiments.distanceFromFulcrum') }} (m)</p>
    </div>
    <div class="eq-example">
      <div class="eq-label">{{ t('experiments.exampleTitle') }}:</div>
      <div>2kg × 9.81 × 3m = <strong>58.86 N·m</strong></div>
    </div>
    <div class="eq-hint">
      {{ t('experiments.torque') }} <strong>{{ t('experiments.positive') }}</strong> = {{ t('experiments.counterClockwise') }} ({{ t('experiments.rightSide') }})<br>
      {{ t('experiments.torque') }} <strong>{{ t('experiments.negative') }}</strong> = {{ t('experiments.clockwise') }} ({{ t('experiments.leftSide') }})
    </div>
  </div>
</template>

<style scoped>
.equation-panel { padding:.6rem; }
.eq-title { font-size:.9rem; font-weight:700; color:#5B8DB8; margin-bottom:.5rem; }
.eq-formula { font-size:1.3rem; font-family:'Courier New', monospace; color:#fbbf24; text-align:center; padding:.5rem; background:rgba(245,158,11,.08); border-radius:6px; margin-bottom:.5rem; }
.eq-desc p { font-size:.8rem; color:#94a3b8; margin:.2rem 0; }
.eq-example { background:rgba(91,141,184,.08); border-radius:6px; padding:.5rem; margin:.5rem 0; font-size:.8rem; color:#e2e8f0; }
.eq-label { color:#5B8DB8; font-weight:700; margin-bottom:.25rem; }
.eq-hint { font-size:.75rem; color:#64748b; margin-top:.5rem; line-height:1.5; }
</style>
