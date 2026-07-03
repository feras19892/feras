<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  slitDistance: number
  screenDistance: number
  wavelength: number
  fringeSpacing: number
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.interferenceFringeSpacing') }}</div>
      <div class="eq">Δy = λD / d</div>
      <div class="eq-values">
        Δy = {{ fringeSpacing.toFixed(3) }} mm<br>
        λ = {{ wavelength }} nm<br>
        D = {{ screenDistance }} m<br>
        d = {{ slitDistance }} mm
      </div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.interferenceConstructive') }}</div>
      <div class="eq">d·sinθ = mλ</div>
      <div class="eq-values">
        Central bright fringe: m = 0 (max intensity)<br>
        First bright fringe: m = ±1
      </div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.interferenceDestructive') }}</div>
      <div class="eq">d·sinθ = (m + ½)λ</div>
      <div class="eq-values">
        First dark fringe between m=0 and m=1
      </div>
    </div>
    <div class="eq-block">
      <div class="eq-title">{{ t('experiments.interferenceIntensity') }}</div>
      <div class="eq">I = I₀ cos²(πd·sinθ/λ)</div>
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
