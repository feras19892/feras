<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
interface Props {
  tubeLength: number
  frequency: number
  temperature: number
  harmonic: 1 | 3
  wavelength: number
  vMeasured: number
  vTheory: number
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="eq-block">
      <div class="eq-title">Resonance Wavelength</div>
      <div class="eq">{{ harmonic === 1 ? 'λ = 4L' : 'λ = 4L / 3' }}</div>
      <div class="eq-values">λ = {{ wavelength.toFixed(3) }} m, L = {{ tubeLength.toFixed(3) }} m</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">Speed of Sound</div>
      <div class="eq">v = f · λ</div>
      <div class="eq-values">
        v = {{ vMeasured.toFixed(1) }} m/s<br>
        f = {{ frequency }} Hz<br>
        λ = {{ wavelength.toFixed(3) }} m
      </div>
    </div>
    <div class="eq-block">
      <div class="eq-title">Theoretical Speed (Air)</div>
      <div class="eq">v = 331.3 + 0.6·T</div>
      <div class="eq-values">
        v = {{ vTheory.toFixed(1) }} m/s<br>
        T = {{ temperature }}°C
      </div>
    </div>
    <div class="eq-block">
      <div class="eq-title">Percent Error</div>
      <div class="eq">|v − vₜ| / vₜ × 100%</div>
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