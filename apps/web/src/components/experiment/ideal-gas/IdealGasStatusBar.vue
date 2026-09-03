<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps<{

  running: boolean
  paused: boolean
  n: number
  T: number
  V: number
  P: number
}>()
</script>

<template>
  <div class="status-bar">
    <span class="dot" :class="running ? (paused ? 'paused' : 'run') : 'off'" />
    <span>{{ running ? (paused ? t('experiments.statusPaused') : t('experiments.statusRunning')) : t('experiments.statusIdle') }}</span>
    <span class="sep">|</span>
    <span>n={{ n.toFixed(2) }} mol</span>
    <span class="sep">|</span>
    <span>T={{ T }} K</span>
    <span class="sep">|</span>
    <span>V={{ (V*1000).toFixed(2) }} L</span>
    <span class="sep">|</span>
    <span>P={{ (P/1000).toFixed(1) }} kPa</span>
  </div>
</template>

<style scoped>
.status-bar { display:flex; align-items:center; gap:.6rem; padding:.25rem .7rem; background:#0d1117; border-top:1px solid #1e2530; font-size:.72rem; color:#8B95A5; flex-shrink:0; }
.dot { width:7px; height:7px; border-radius:50%; background:#475569; }
.dot.run { background:#22c55e; }
.dot.paused { background:#f59e0b; }
.sep { color:#2D3645; }
</style>