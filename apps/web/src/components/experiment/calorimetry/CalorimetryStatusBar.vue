<script setup lang="ts">
defineProps<{
  mWater: number
  tWater: number
  mMetal: number
  tMetal: number
  tf: number
  cMetal: number
}>()
</script>
<template>
  <div class="status-bar">
    <span>💧 {{ mWater.toFixed(3) }} kg @ {{ tWater }}°C</span>
    <span>🔩 {{ mMetal.toFixed(3) }} kg @ {{ tMetal }}°C</span>
    <span>🌡️ Tf = {{ tf.toFixed(1) }}°C</span>
    <span>c = {{ cMetal.toFixed(0) }} J/kg·K</span>
  </div>
</template>
<style scoped>
.status-bar { display: flex; align-items: center; gap: 1.2rem; padding: .3rem .6rem; font-size: .75rem; color: #8B95A5; background: #0d1117; border-bottom: 1px solid #1e2530; flex-shrink: 0; }
.status-bar span { white-space: nowrap; }
</style>
