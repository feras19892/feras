<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  running: boolean
  paused: boolean
  prismAngle: number
  angleIncidence: number
  n: number
  deviation: number | null
  criticalAngle: number | null
  totalInternalReflection: boolean
}

const props = defineProps<Props>()

const stateClass = computed(() => props.totalInternalReflection ? 'tir' : props.running && !props.paused ? 'running' : 'idle')
const stateLabel = computed(() => {
  if (!props.running) return t('experiments.statusReady')
  if (props.paused) return t('experiments.statusPaused')
  if (props.totalInternalReflection) return '⚠ TIR'
  return t('experiments.statusRunning')
})
</script>

<template>
  <div class="status-bar" :class="stateClass">
    <span class="pulse-dot" :class="stateClass" />
    <span class="st-chip" :class="stateClass">{{ stateLabel }}</span>
    <span class="sep" />
    <span class="st-item">A = <b>{{ prismAngle }}°</b></span>
    <span class="st-item">θ₁ = <b class="cyan">{{ angleIncidence }}°</b></span>
    <span class="st-item">n = <b class="amber">{{ n.toFixed(3) }}</b></span>
    <span v-if="deviation !== null" class="st-item">δ = <b class="green">{{ deviation.toFixed(1) }}°</b></span>
    <span v-if="criticalAngle !== null" class="st-item">θc = <b class="amber">{{ criticalAngle.toFixed(1) }}°</b></span>
    <span v-if="totalInternalReflection" class="tir-badge">⚠ TIR</span>
  </div>
</template>

<style scoped>
.status-bar { display: flex; align-items: center; gap: .6rem; padding: .28rem .75rem; background: #161B22; border-top: 1px solid #2D3645; font-size: .72rem; color: #8B95A5; flex-shrink: 0; transition: border-color .3s; }
.status-bar.tir { border-top-color: rgba(248,113,113,0.5); }
.status-bar.running { border-top-color: rgba(74,222,128,0.25); }
.sep { width: 1px; height: 14px; background: #2D3645; flex-shrink: 0; }
.st-chip { padding: .12rem .45rem; border-radius: 999px; font-size: .68rem; font-weight: 700; }
.st-chip.running { background: rgba(74,222,128,.12); color: #4ade80; }
.st-chip.idle    { background: rgba(148,163,184,.1); color: #64748b; }
.st-chip.tir     { background: rgba(248,113,113,.12); color: #f87171; }
.st-item { font-family: monospace; white-space: nowrap; }
.cyan  { color: #67e8f9; }
.green { color: #4ade80; }
.amber { color: #fbbf24; }
.tir-badge { margin-inline-end: auto; padding: .1rem .4rem; border-radius: 4px; background: rgba(248,113,113,.15); color: #f87171; font-weight: 700; border: 1px solid rgba(248,113,113,.3); animation: blink 1s ease-in-out infinite; }
.pulse-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.pulse-dot.running { background: #4ade80; animation: pulse 1.4s ease-in-out infinite; }
.pulse-dot.tir     { background: #f87171; animation: pulse .7s ease-in-out infinite; }
.pulse-dot.idle    { background: #475569; }
@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(0.7); } }
@keyframes blink  { 0%,100% { opacity:1; } 50% { opacity:.4; } }
</style>
