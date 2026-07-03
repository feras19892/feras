<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
const props = defineProps<{ L0: number; t0: number; t1: number; alpha: number; dL: number }>()
const alphaVal = computed(() => props.alpha * 1e-6)
</script>
<template>
  <div class="laws-panel">
    <div class="law">
      <h4>{{ t('experiments.thermalLaw') }}</h4>
      <p class="formula">ΔL = α × L₀ × ΔT</p>
      <p class="values">ΔL = {{ alphaVal }} × {{ L0.toFixed(2) }} × {{ (t1 - t0) }}</p>
      <p class="values">ΔL = {{ (dL * 1000).toFixed(3) }} mm</p>
    </div>
    <div class="law">
      <h4>{{ t('experiments.thermalFindAlpha') }}</h4>
      <p class="formula">α = ΔL / (L₀ × ΔT)</p>
      <p class="values">α = {{ dL.toFixed(6) }} / ({{ L0.toFixed(2) }} × {{ (t1 - t0) }})</p>
      <p class="values">α = {{ (dL / (L0 * (t1 - t0)) * 1e6).toFixed(1) }} × 10⁻⁶ /K</p>
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
