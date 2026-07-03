<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
const props = defineProps<{
  material: string
  L0: number
  t0: number
  t1: number
  dL: number
  L1: number
  alpha: number
}>()
const matNames: Record<string, string> = {
  copper: 'نحاس', aluminum: 'ألمنيوم', iron: 'حديد', steel: 'فولاذ', brass: 'سبائك نحاس', glass: 'زجاج',
}
const matName = computed(() => matNames[props.material] || props.material)
</script>
<template>
  <div class="readings-panel">
    <div class="row"><span class="label">{{ t('experiments.thermalMaterial') }}</span><span class="val">{{ matName }}</span></div>
    <div class="row"><span class="label">{{ t('experiments.thermalAlpha') }}</span><span class="val">{{ alpha.toFixed(1) }} × 10⁻⁶/K</span></div>
    <div class="row"><span class="label">L₀</span><span class="val">{{ L0.toFixed(2) }} m</span></div>
    <div class="row"><span class="label">t₀</span><span class="val">{{ t0 }} °C</span></div>
    <div class="row"><span class="label">t₁</span><span class="val">{{ t1 }} °C</span></div>
    <div class="row"><span class="label">ΔL</span><span class="val">{{ (dL * 1000).toFixed(2) }} mm</span></div>
    <div class="row"><span class="label">L₁</span><span class="val">{{ L1.toFixed(4) }} m</span></div>
  </div>
</template>
<style scoped>
.readings-panel { display:flex; flex-direction:column; gap:.35rem; }
.row { display:flex; justify-content:space-between; font-size:.78rem; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.03); }
.label { color:#8B95A5; }
.val { color:#D1D7E0; font-weight:600; }
</style>
