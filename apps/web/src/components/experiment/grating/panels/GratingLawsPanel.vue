<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  linesPerMm: number
  screenDistance: number
  wavelength: number
  firstOrderAngle: number
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.dfGratingEq') }}</div>
      <div class="eq">d·sinθ = m·λ</div>
      <div class="eq-values">
        d = {{ (1/linesPerMm).toFixed(4) }} mm<br>
        λ = {{ wavelength }} nm<br>
        D = {{ screenDistance }} m
      </div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.dfFirstOrderAngle') }}</div>
      <div class="eq">θ₁ = arcsin(λ/d)</div>
      <div class="eq-values">
        θ₁ = {{ firstOrderAngle.toFixed(3) }}°
      </div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.dfPositionOnScreen') }}</div>
      <div class="eq">y = D·tanθ</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.dfMaxOrder') }}</div>
      <div class="eq">m_max = floor(d/λ)</div>
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
