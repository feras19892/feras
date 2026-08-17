<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  mode: 'single' | 'grating'
  slitWidth: number
  linesPerMm: number
  screenDistance: number
  wavelength: number
  centralWidth: number
  firstOrderAngle: number
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <template v-if="mode === 'single'">
      <div class="eq-block">
        <div class="eq-title">{{ t('experiments.dfCentralWidth') }}</div>
        <div class="eq">w = 2λD / a</div>
        <div class="eq-values">
          w = {{ centralWidth.toFixed(3) }} mm<br>
          λ = {{ wavelength }} nm<br>
          D = {{ screenDistance }} m<br>
          a = {{ slitWidth }} mm
        </div>
      </div>
      <div class="eq-block">
        <div class="eq-title">{{ t('experiments.dfDarkFringes') }}</div>
        <div class="eq">a·sinθ = mλ</div>
      </div>
      <div class="eq-block">
        <div class="eq-title">{{ t('experiments.dfIntensity') }}</div>
        <div class="eq">I = I₀ sinc²(πa·sinθ/λ)</div>
      </div>
    </template>
    <template v-else>
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
        <div class="eq-values">θ₁ = {{ firstOrderAngle.toFixed(3) }}°</div>
      </div>
      <div class="eq-block">
        <div class="eq-title">{{ t('experiments.dfPositionOnScreen') }}</div>
        <div class="eq">y = D·tanθ</div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .5rem; font-size: .82rem; }
.eq-block { margin-bottom: .3rem; }
.eq-title { color: #5B8DB8; font-size: .75rem; margin-bottom: .2rem; }
.eq { font-family: 'Courier New', monospace; background: #0d1117; padding: .3rem .5rem; border-radius: 4px; font-size: .9rem; color: #7ee787; }
.eq-values { font-size: .8rem; color: #8B95A5; margin-top: .2rem; }
</style>
