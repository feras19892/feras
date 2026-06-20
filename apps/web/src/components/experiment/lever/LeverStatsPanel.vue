<script setup lang="ts">
const props = defineProps<{
  count: number
  avgTorque: number
  maxTilt: number
  balanceCount: number
}>()
</script>

<template>
  <div class="stats-panel">
    <div class="stat-card"><span class="stat-label">المحاولات</span><span class="stat-val">{{ count }}</span></div>
    <div class="stat-card"><span class="stat-label">متوسط العزم</span><span class="stat-val">{{ avgTorque.toFixed(2) }}</span></div>
    <div class="stat-card"><span class="stat-label">أقصى ميلان</span><span class="stat-val">{{ maxTilt.toFixed(1) }}°</span></div>
    <div class="stat-card"><span class="stat-label">مرات التوازن</span><span class="stat-val">{{ balanceCount }}</span></div>
  </div>
</template>

<style scoped>
.stats-panel { padding:.6rem; display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
.stat-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:6px; padding:.5rem; display:flex; flex-direction:column; align-items:center; }
.stat-label { font-size:.7rem; color:#64748b; margin-bottom:.25rem; }
.stat-val { font-size:1.1rem; font-weight:800; color:#5B8DB8; }
</style>
