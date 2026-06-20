<script setup lang="ts">
const props = defineProps<{
  netTorque: number
  isBalanced: boolean
  tiltDeg: number
  ballCount: number
  forceCount: number
}>()
</script>

<template>
  <div class="status-bar">
    <span :class="['status-pill', isBalanced ? 'balanced' : 'unbalanced']">
      {{ isBalanced ? '⚖️ متوازن' : (netTorque > 0 ? '↻ يمين' : '↺ يسار') }}
    </span>
    <span class="status-pill">τ = {{ netTorque.toFixed(2) }} N·m</span>
    <span class="status-pill">θ = {{ tiltDeg.toFixed(1) }}°</span>
    <span class="status-pill">كرات: {{ ballCount }}</span>
    <span class="status-pill">قوى: {{ forceCount }}</span>
  </div>
</template>

<style scoped>
.status-bar { display:flex; justify-content:center; gap:.5rem; padding:.35rem .7rem; background:#1E2530; border-radius:6px; border:1px solid #2D3645; flex-shrink:0; }
.status-pill { font-size:.75rem; padding:.25rem .6rem; border-radius:4px; background:#252D3A; color:#8B95A5; font-weight:600; }
.status-pill.balanced { background:rgba(34,197,94,.12); color:#22c55e; }
.status-pill.unbalanced { background:rgba(239,68,68,.12); color:#f87171; }
</style>
