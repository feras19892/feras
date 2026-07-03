<script setup lang="ts">
import { computed } from 'vue'
import { ALPHA } from '../../../composables/thermal-expansion/useThermalExpansionCalculations'
const props = defineProps<{
  material: string
  L0: number
  t0: number
  t1: number
  currentT: number
  dL: number
  L1: number
}>()
const matNames: Record<string, string> = {
  copper: 'نحاس', aluminum: 'ألمنيوم', iron: 'حديد', steel: 'فولاذ', brass: 'سبائك نحاس', glass: 'زجاج',
}
const matName = computed(() => matNames[props.material] || props.material)
const alpha = computed(() => ALPHA[props.material] ?? 16.5)
</script>
<template>
  <div class="status-bar">
    <span class="group">🔧 {{ matName }} — α = {{ alpha.toFixed(1) }}×10⁻⁶/K</span>
    <span class="group">📏 L₀ = {{ L0.toFixed(2) }} m</span>
    <span class="group">🌡️ {{ currentT.toFixed(1) }}°C</span>
    <span class="group">ΔL = {{ (dL * 1000).toFixed(2) }} mm</span>
    <span class="group">L₁ = {{ L1.toFixed(4) }} m</span>
  </div>
</template>
<style scoped>
.status-bar { display: flex; align-items: center; justify-content: space-between; gap: .6rem; padding: .25rem .5rem; font-size: .72rem; color: #8B95A5; background: #0d1117; border-bottom: 1px solid #1e2530; flex-shrink: 0; overflow: hidden; }
.status-bar .group { white-space: nowrap; }
</style>
