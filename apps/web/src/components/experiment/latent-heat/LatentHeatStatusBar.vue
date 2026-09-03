<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps<{

  running: boolean
  paused: boolean
  mass: number
  phaseType: 'fusion' | 'vaporization'
  phase: 'ready' | 'heating' | 'done'
  currentQ: number
  totalQ: number
  meltedMass: number
  remainingMass: number
  currentTemp: number
}>()
const typeBadge = { fusion: { text: '❄️ انصهار', color: '#5B8DB8' }, vaporization: { text: '💨 تبخر', color: '#a78bfa' } }
const phaseBadge = { ready: { text: '⏸️ جاهز', color: '#64748b' }, heating: { text: '🔥 تسخين', color: '#fbbf24' }, done: { text: '✅ اكتمل', color: '#22c55e' } }
</script>
<template>
  <div class="status-bar">
    <span class="dot" :class="running ? (paused ? 'paused' : 'run') : 'off'" />
    <span>{{ running ? (paused ? t('experiments.statusPaused') : t('experiments.statusRunning')) : t('experiments.statusIdle') }}</span>
    <span class="sep">|</span>
    <span class="badge" :style="{background: typeBadge[phaseType].color + '18', color: typeBadge[phaseType].color, borderColor: typeBadge[phaseType].color + '40'}">
      {{ typeBadge[phaseType].text }}
    </span>
    <span class="sep">|</span>
    <span class="badge" :style="{background: phaseBadge[phase].color + '18', color: phaseBadge[phase].color, borderColor: phaseBadge[phase].color + '40'}">
      {{ phaseBadge[phase].text }}
    </span>
    <span class="sep">|</span>
    <span>m={{ mass.toFixed(2) }} kg</span>
    <span class="sep">|</span>
    <span>Q={{ (currentQ/1000).toFixed(1) }}/{{ (totalQ/1000).toFixed(1) }} kJ</span>
    <span class="sep">|</span>
    <span>متحولة={{ meltedMass.toFixed(3) }} kg</span>
    <span class="sep">|</span>
    <span>متبقية={{ remainingMass.toFixed(3) }} kg</span>
    <span class="sep">|</span>
    <span>{{ currentTemp }}°C</span>
  </div>
</template>
<style scoped>
.status-bar { display:flex; align-items:center; gap:.5rem; padding:.3rem .7rem; background:#0d1117; border-top:1px solid #1e2530; font-size:.7rem; color:#8B95A5; flex-shrink:0; overflow-x:auto; }
.dot { width:7px; height:7px; border-radius:50%; background:#475569; flex-shrink:0; }
.dot.run { background:#22c55e; }
.dot.paused { background:#f59e0b; }
.sep { color:#2D3645; flex-shrink:0; }
.badge { padding:.1rem .35rem; border-radius:4px; border:1px solid; font-size:.65rem; font-weight:600; white-space:nowrap; }
</style>