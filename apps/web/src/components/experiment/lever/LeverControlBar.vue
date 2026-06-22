<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  launchLabel: string
  canUndo?: boolean
  canRedo?: boolean
}>()

const emit = defineEmits<{
  (e: 'togglePause'): void
  (e: 'reset'): void
  (e: 'recordTrial'): void
  (e: 'clearTrials'): void
  (e: 'exportCsv'): void
  (e: 'undo'): void
  (e: 'redo'): void
}>()

function onClear() {
  if (confirm(t('experiments.confirmClearAll'))) emit('clearTrials')
}
</script>

<template>
  <div class="control-bar">
    <button class="btn-primary" @click="$emit('togglePause')">{{ launchLabel }}</button>
    <button class="btn-secondary" @click="$emit('reset')">&#x1F504; {{ t('experiments.resetBtn') }}</button>
    <button class="btn-secondary" @click="$emit('recordTrial')">&#x1F4CC; {{ t('experiments.recordBtn') }}</button>
    <button class="btn-undo" :disabled="!canUndo" @click="$emit('undo')" :title="t('experiments.undoBtn')">&#x21A9; {{ t('experiments.undoBtn') }}</button>
    <button class="btn-undo" :disabled="!canRedo" @click="$emit('redo')" :title="t('experiments.redoBtn')">&#x21AA; {{ t('experiments.redoBtn') }}</button>
    <button class="btn-undo" @click="onClear">&#x1F5D1; {{ t('experiments.clearAll') }}</button>
    <button class="btn-undo" @click="$emit('exportCsv')">&#x1F4BE; CSV</button>
  </div>
</template>

<style scoped>
.control-bar { display:flex; justify-content:center; gap:.3rem; padding:.3rem; background:#1E2530; border-radius:6px; border:1px solid #2D3645; margin-top:.15rem; flex-shrink:0; }
.control-bar button { font-size:.72rem; padding:.3rem .6rem; border-radius:4px; cursor:pointer; font-weight:600; transition:.2s; }
.btn-primary { background:rgba(91,141,184,.15); color:#5B8DB8; border:1px solid rgba(91,141,184,.3); }
.btn-primary:hover { background:rgba(91,141,184,.25); }
.btn-secondary { background:#252D3A; color:#8B95A5; border:1px solid #2D3645; }
.btn-secondary:hover { background:#2D3645; color:#D1D7E0; }
.btn-undo { background:#252D3A; color:#8B95A5; border:1px solid #2D3645; }
.btn-undo:disabled { opacity:.4; cursor:not-allowed; }
</style>
