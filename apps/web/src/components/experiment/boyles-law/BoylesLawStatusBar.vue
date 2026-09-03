<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps<{

  running: boolean
  paused: boolean
  p: number
  v: number
  pv: number
  phase?: string
}>()
const phaseAr = (p?: string) => {
  const map: Record<string, string> = {
    ready: t('experiments.blPhaseReadyShort'),
    compressing: t('experiments.blPhaseCompressingShort'),
    done: t('experiments.blPhaseDoneShort'),
  }
  return map[p ?? ''] ?? p ?? ''
}
</script>
<template>
  <div class="status-bar">
    <span class="dot" :class="running ? (paused ? 'paused' : 'run') : 'off'" />
    <span>{{ running ? (paused ? t('experiments.statusPaused') : t('experiments.statusRunning')) : t('experiments.statusIdle') }}</span>
    <span class="sep">|</span>
    <span class="badge phase">{{ phaseAr(phase) }}</span>
    <span class="sep">|</span>
    <span>P={{ p.toFixed(2) }} atm</span>
    <span class="sep">|</span>
    <span>V={{ v.toFixed(2) }} L</span>
    <span class="sep">|</span>
    <span class="badge pv">P·V={{ pv.toFixed(2) }}</span>
  </div>
</template>
<style scoped>
.status-bar { display:flex; align-items:center; gap:.5rem; padding:.25rem .7rem; background:#0d1117; border-top:1px solid #1e2530; font-size:.72rem; color:#8B95A5; flex-shrink:0; }
.dot { width:7px; height:7px; border-radius:50%; background:#475569; }
.dot.run { background:#22c55e; }
.dot.paused { background:#f59e0b; }
.sep { color:#2D3645; }
.badge { border-radius:4px; padding:.06rem .3rem; font-weight:600; font-size:.68rem; }
.badge.phase { background:rgba(91,141,184,.1); color:#5B8DB8; border:1px solid rgba(91,141,184,.2); }
.badge.pv { background:rgba(245,158,11,.1); color:#fbbf24; border:1px solid rgba(245,158,11,.2); }
</style>