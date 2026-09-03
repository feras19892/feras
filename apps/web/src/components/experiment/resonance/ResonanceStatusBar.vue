<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed } from 'vue'

interface Props { running: boolean; paused: boolean; stringLength: number; harmonic: number; tension: number; frequency: number; wavelength: number }
const props = defineProps<Props>()
const stateClass = computed(() => props.running && !props.paused ? 'running' : 'idle')
const stateLabel = computed(() => {
  if (!props.running) return t('experiments.statusReady')
  if (props.paused) return t('experiments.statusPaused')
  return t('experiments.statusRunning')
})
</script>

<template>
  <div class="status-bar" :class="stateClass">
    <span class="pulse-dot" :class="stateClass" />
    <span class="st-chip" :class="stateClass">{{ stateLabel }}</span>
    <span class="sep" />
    <span class="st-item">L = <b class="cyan">{{ stringLength.toFixed(2) }}</b> m</span>
    <span class="st-item">T = <b class="amber">{{ tension }}</b> N</span>
    <span class="st-item">n = <b class="amber">{{ harmonic }}</b></span>
    <span class="st-item">f = <b class="green">{{ frequency.toFixed(1) }}</b> Hz</span>
    <span class="st-item">lambda = <b>{{ wavelength.toFixed(3) }}</b> m</span>
  </div>
</template>

<style scoped>
.status-bar { display: flex; align-items: center; gap: .6rem; padding: .28rem .75rem; background: #161B22; border-top: 1px solid #2D3645; font-size: .72rem; color: #8B95A5; flex-shrink: 0; transition: border-color .3s; }
.status-bar.running { border-top-color: rgba(74,222,128,0.25); }
.sep { width: 1px; height: 14px; background: #2D3645; flex-shrink: 0; }
.st-chip { padding: .12rem .45rem; border-radius: 999px; font-size: .68rem; font-weight: 700; }
.st-chip.running { background: rgba(74,222,128,.12); color: #4ade80; }
.st-chip.idle    { background: rgba(148,163,184,.1); color: #64748b; }
.st-item { font-family: monospace; white-space: nowrap; }
.cyan  { color: #67e8f9; }
.green { color: #4ade80; }
.amber { color: #fbbf24; }
.pulse-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.pulse-dot.running { background: #4ade80; animation: pulse 1.4s ease-in-out infinite; }
.pulse-dot.idle    { background: #475569; }
@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(0.7); } }
</style>
