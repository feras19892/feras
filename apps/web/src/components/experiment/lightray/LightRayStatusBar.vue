<script setup lang="ts">
const props = defineProps<{
  running: boolean
  paused: boolean
  n1: number
  n2: number
  totalInternalReflection: boolean
}>()
</script>

<template>
  <div class="status-bar" :class="{ready:!running&&!paused, paused:running&&paused, running:running&&!paused}">
    <span class="status-dot" />
    <span v-if="!running&&!paused">جاهز</span>
    <span v-else-if="running&&paused">متوقف مؤقتاً</span>
    <span v-else>يعمل</span>
    <span class="status-sep">|</span>
    <span class="status-medium">n₁ = {{ n1.toFixed(2) }} | n₂ = {{ n2.toFixed(2) }}</span>
    <span v-if="totalInternalReflection" class="tir-badge">🔴 TIR</span>
  </div>
</template>

<style scoped>
.status-bar { display:flex; align-items:center; justify-content:center; gap:.4rem; padding:.35rem; border-radius:6px; font-size:.72rem; font-weight:700; margin:.2rem 0; flex-shrink:0; }
.status-bar.ready { background:rgba(91,141,184,.12); color:#5B8DB8; border:1px solid rgba(91,141,184,.2); }
.status-bar.paused { background:rgba(196,162,101,.12); color:#c4a265; border:1px solid rgba(196,162,101,.2); }
.status-bar.running { background:rgba(122,158,126,.12); color:#7a9e7e; border:1px solid rgba(122,158,126,.2); }
.status-dot { width:8px; height:8px; border-radius:50%; background:currentColor; animation:dotPulse 2s ease-in-out infinite; }
.status-sep { opacity:.3; margin:0 .2rem; }
.status-medium { font-weight:400; opacity:.8; }
.tir-badge { background:rgba(239,68,68,.15); color:#f87171; padding:.05rem .3rem; border-radius:999px; font-size:.65rem; font-weight:700; }
@keyframes dotPulse { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
</style>
