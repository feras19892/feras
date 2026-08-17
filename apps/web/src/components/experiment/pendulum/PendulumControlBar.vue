<script setup lang="ts">
import PendulumStepTracker from './PendulumStepTracker.vue'
import PendulumStatusBar from './PendulumStatusBar.vue'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  launchLabel: string
  speed: number
  canUndo?: boolean
  canRedo?: boolean
  stepIndex?: number
  running?: boolean
  paused?: boolean
}>()

const emit = defineEmits<{
  (e: 'togglePause'): void
  (e: 'reset'): void
  (e: 'recordTrial'): void
  (e: 'clearTrials'): void
  (e: 'exportCsv'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'update:speed', val: number): void
}>()

function onClear() { emit('clearTrials') }

function incSpeed() { const next = Math.round((props.speed + 0.25) * 100) / 100; emit('update:speed', Math.min(3, next)) }
function decSpeed() { const next = Math.round((props.speed - 0.25) * 100) / 100; emit('update:speed', Math.max(0.25, next)) }
</script>

<template>
  <div class="control-bar">
    <div class="left-group" v-if="stepIndex !== undefined">
      <PendulumStepTracker :step-index="stepIndex ?? 0" />
      <PendulumStatusBar :running="running ?? false" :paused="paused ?? false" />
    </div>
    <button class="btn-primary" @click="$emit('togglePause')">{{ launchLabel }}</button>
    <button class="btn-secondary" @click="$emit('reset')">&#x1F504; {{ t('experiments.resetBtn') }}</button>
    <button class="btn-secondary" @click="$emit('recordTrial')">&#x1F4CC; {{ t('experiments.recordBtn') }}</button>
    <button class="btn-undo" :disabled="!canUndo" @click="$emit('undo')" :title="t('experiments.undoBtn') + ' (Ctrl+Z)'">&#x21A9; {{ t('experiments.undoBtn') }}</button>
    <button class="btn-undo" :disabled="!canRedo" @click="$emit('redo')" :title="t('experiments.redoBtn') + ' (Ctrl+Y)'">&#x21AA; {{ t('experiments.redoBtn') }}</button>
    <button class="btn-undo" @click="onClear">&#x1F5D1; {{ t('experiments.clearAll') }}</button>
    <button class="btn-undo" @click="$emit('exportCsv')">&#x1F4BE; CSV</button>
    <div class="speed-group">
      <button class="btn-speed" @click="decSpeed">−</button>
      <span class="speed-val">×{{ speed.toFixed(2) }}</span>
      <button class="btn-speed" @click="incSpeed">+</button>
    </div>
  </div>
</template>

<style scoped>
.control-bar { display:flex; justify-content:center; align-items:center; gap:.35rem; padding:.5rem .8rem; background:linear-gradient(180deg,#1E2530,#161B22); border-radius:10px; border:1px solid #2D3645; margin-top:.2rem; flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,.3); }
.left-group { display:flex; gap:.4rem; align-items:center; }
.control-bar button { font-size:.78rem; padding:.45rem .75rem; border-radius:7px; cursor:pointer; font-weight:700; transition:all .18s; border:none; box-shadow:0 2px 4px rgba(0,0,0,.2); }
.control-bar button:hover { transform:translateY(-1px); box-shadow:0 4px 8px rgba(0,0,0,.3); }
.control-bar button:active { transform:translateY(0); box-shadow:0 1px 2px rgba(0,0,0,.2); }
.control-bar button:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }
.btn-primary { background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; }
.btn-primary:hover { background:linear-gradient(135deg,#60a5fa,#3b82f6); }
.btn-secondary { background:linear-gradient(135deg,#334155,#1e293b); color:#cbd5e1; border:1px solid #475569; }
.btn-secondary:hover { background:linear-gradient(135deg,#475569,#334155); color:#fff; }
.btn-undo { background:linear-gradient(135deg,#334155,#1e293b); color:#94a3b8; border:1px solid #475569; font-size:.72rem; padding:.4rem .55rem; }
.btn-undo:hover { background:linear-gradient(135deg,#475569,#334155); color:#e2e8f0; }
.speed-group { display:flex; align-items:center; gap:.15rem; background:#0f172a; border:1px solid #334155; border-radius:8px; padding:.2rem .35rem; }
.btn-speed { background:#1e293b; color:#60a5fa; border:1px solid #334155; width:26px; height:26px; display:flex; align-items:center; justify-content:center; padding:0; font-size:1rem; border-radius:6px; cursor:pointer; font-weight:700; transition:all .15s; }
.btn-speed:hover { background:#334155; color:#93c5fd; }
.speed-val { font-family:monospace; font-size:.72rem; color:#60a5fa; min-width:40px; text-align:center; font-weight:700; }
</style>
