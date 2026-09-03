<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps<{

  running: boolean
  paused: boolean
  I: number
  r: number
  B: number
  shape: string
}>()
</script>
<template>
  <div class="status-bar">
    <span class="dot" :class="running ? (paused ? 'paused' : 'run') : 'off'" />
    <span>{{ running ? (paused ? t('experiments.statusPaused') : t('experiments.statusRunning')) : t('experiments.statusIdle') }}</span>
    <span class="sep">|</span>
    <span>I={{ I.toFixed(1) }}A</span>
    <span class="sep">|</span>
    <span>r={{ r.toFixed(3) }}m</span>
    <span class="sep">|</span>
    <span>B={{ B.toExponential(2) }}T</span>
    <span class="sep">|</span>
    <span>{{ shape }}</span>
  </div>
</template>
<style scoped>
.status-bar { display:flex; align-items:center; gap:.6rem; padding:.25rem .7rem; background:#0d1117; border-top:1px solid #1e2530; font-size:.72rem; color:#8B95A5; flex-shrink:0; }
.dot { width:7px; height:7px; border-radius:50%; background:#475569; }
.dot.run { background:#22c55e; }
.dot.paused { background:#f59e0b; }
.sep { color:#2D3645; }
</style>