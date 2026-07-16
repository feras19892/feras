<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()
defineProps<{
  running: boolean
  paused: boolean
  N: number
  B: number
  theta: number
  flux: number
  emf: number
}>()
</script>
<template>
  <div class="status-bar">
    <span class="dot" :class="running ? (paused ? 'paused' : 'run') : 'off'" />
    <span>{{ running ? (paused ? t('experiments.statusPaused') : t('experiments.statusRunning')) : t('experiments.statusIdle') }}</span>
    <span class="sep">|</span>
    <span>N={{ N }}</span>
    <span class="sep">|</span>
    <span>B={{ B.toFixed(1) }}T</span>
    <span class="sep">|</span>
    <span>θ={{ Math.round(theta) }}°</span>
    <span class="sep">|</span>
    <span>Φ={{ flux.toFixed(4) }}Wb</span>
    <span class="sep">|</span>
    <span>EMF={{ emf.toFixed(2) }}V</span>
  </div>
</template>
<style scoped>
.status-bar { display:flex; align-items:center; gap:.6rem; padding:.25rem .7rem; background:#0d1117; border-top:1px solid #1e2530; font-size:.72rem; color:#8B95A5; flex-shrink:0; }
.dot { width:7px; height:7px; border-radius:50%; background:#475569; }
.dot.run { background:#22c55e; }
.dot.paused { background:#f59e0b; }
.sep { color:#2D3645; }
</style>
