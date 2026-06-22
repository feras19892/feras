<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  launchLabel: string
  speed: number
  canUndo?: boolean
  canRedo?: boolean
  enableNoise?: boolean
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
  (e: 'toggleNoise'): void
}>()

function onClear() {
  if (confirm(t('experiments.confirmClearAll'))) emit('clearTrials')
}

function incSpeed() {
  const next = Math.round((props.speed + 0.25) * 100) / 100
  emit('update:speed', Math.min(3, next))
}
function decSpeed() {
  const next = Math.round((props.speed - 0.25) * 100) / 100
  emit('update:speed', Math.max(0.25, next))
}
</script>

<template>
  <div class="control-bar">
    <button class="btn-primary" @click="$emit('togglePause')">{{ launchLabel }}</button>
    <button class="btn-secondary" @click="$emit('reset')">&#x1F504; {{ t('experiments.resetBtn') }}</button>
    <button class="btn-secondary" @click="$emit('recordTrial')">&#x1F4CC; {{ t('experiments.recordBtn') }}</button>
    <button class="btn-undo" :disabled="!canUndo" @click="$emit('undo')" :title="t('experiments.undoBtn') + ' (Ctrl+Z)'">&#x21A9; {{ t('experiments.undoBtn') }}</button>
    <button class="btn-undo" :disabled="!canRedo" @click="$emit('redo')" :title="t('experiments.redoBtn') + ' (Ctrl+Y)'">&#x21AA; {{ t('experiments.redoBtn') }}</button>
    <button class="btn-undo" @click="onClear">&#x1F5D1; {{ t('experiments.clearAll') }}</button>
    <button class="btn-undo" @click="$emit('exportCsv')">&#x1F4BE; CSV</button>
    <button class="btn-noise" :class="{ active: enableNoise }" @click="$emit('toggleNoise')" :title="enableNoise ? t('experiments.disableNoiseTitle') : t('experiments.enableNoiseTitle')">
      <span class="led" :class="{ on: enableNoise }"></span>
      <span class="noise-label">{{ enableNoise ? t('experiments.relativeError') : t('experiments.accurate') }}</span>
    </button>
    <div class="speed-group">
      <button class="btn-speed" @click="decSpeed">−</button>
      <span class="speed-val">×{{ speed.toFixed(2) }}</span>
      <button class="btn-speed" @click="incSpeed">+</button>
    </div>
  </div>
</template>

<style scoped>
.control-bar { display:flex; justify-content:center; gap:.4rem; padding:.5rem; background:#1E2530; border-radius:8px; border:1px solid #2D3645; margin-top:.2rem; flex-shrink:0; }
.control-bar button { font-size:.8rem; padding:.45rem .8rem; border-radius:5px; cursor:pointer; font-weight:600; transition:.2s; }
.btn-primary { background:rgba(91,141,184,.15); color:#5B8DB8; border:1px solid rgba(91,141,184,.3); }
.btn-primary:hover { background:rgba(91,141,184,.25); }
.btn-secondary { background:#252D3A; color:#8B95A5; border:1px solid #2D3645; }
.btn-secondary:hover { background:#2D3645; color:#D1D7E0; }
.btn-undo { background:#252D3A; color:#8B95A5; border:1px solid #2D3645; }
.btn-noise { display:flex; align-items:center; gap:.3rem; background:#252D3A; color:#8B95A5; border:1px solid #2D3645; border-radius:5px; padding:.35rem .5rem; font-size:.7rem; font-weight:600; cursor:pointer; transition:.2s; }
.btn-noise.active { background:rgba(34,197,94,.1); color:#22c55e; border-color:rgba(34,197,94,.3); }
.btn-noise:hover { background:#2D3645; }
.btn-noise.active:hover { background:rgba(34,197,94,.15); }
.btn-noise .led { width:6px; height:6px; border-radius:50%; background:#475569; transition:.2s; }
.btn-noise .led.on { background:#22c55e; box-shadow:0 0 4px #22c55e; }
.btn-noise .noise-label { white-space:nowrap; }
.speed-group { display:flex; align-items:center; gap:.2rem; background:#161B22; border:1px solid #2D3645; border-radius:5px; padding:.2rem .3rem; }
.btn-speed { background:#252D3A; color:#5B8DB8; border:1px solid #2D3645; width:24px; height:24px; display:flex; align-items:center; justify-content:center; padding:0; font-size:.9rem; border-radius:4px; cursor:pointer; }
.btn-speed:hover { background:#2D3645; }
.speed-val { font-family:monospace; font-size:.75rem; color:#5B8DB8; min-width:36px; text-align:center; }
</style>
