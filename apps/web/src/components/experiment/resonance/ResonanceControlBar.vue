<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
interface Props { launchLabel: string; canUndo: boolean; canRedo: boolean }

defineProps<Props>()
const emit = defineEmits<{
  (e: 'togglePause'): void
  (e: 'reset'): void
  (e: 'recordTrial'): void
  (e: 'clearTrials'): void
  (e: 'exportCsv'): void
  (e: 'undo'): void
  (e: 'redo'): void
}>()

function onClear() { emit('clearTrials') }
</script>

<template>
  <div class="ctrl-bar">
    <button class="ctrl-btn primary" @click="emit('togglePause')">{{ launchLabel }}<kbd>Space</kbd></button>
    <button class="ctrl-btn record" @click="emit('recordTrial')">&#x1F4CC; {{ t('experiments.recordBtn') }}<kbd>S</kbd></button>
    <div class="ctrl-sep" />
    <button class="ctrl-btn" :disabled="!canUndo" @click="emit('undo')">&#x21A9;<kbd>Ctrl+Z</kbd></button>
    <button class="ctrl-btn" :disabled="!canRedo" @click="emit('redo')">&#x21AA;<kbd>Ctrl+Y</kbd></button>
    <div class="ctrl-sep" />
    <button class="ctrl-btn danger" @click="onClear">&#x1F5D1; {{ t('experiments.clearAll') }}</button>
    <button class="ctrl-btn" @click="emit('exportCsv')">&#x1F4BE; CSV</button>
    <button class="ctrl-btn" @click="emit('reset')">&#x1F504; {{ t('experiments.resetBtn') }}<kbd>R</kbd></button>
  </div>
</template>

<style scoped>
.ctrl-bar { display: flex; align-items: center; justify-content: center; gap: .3rem; padding: .35rem .65rem; background: #0d1117; border-top: 1px solid #1e2530; flex-shrink: 0; overflow-x: auto; }
.ctrl-sep { width: 1px; height: 20px; background: #1e2530; margin: 0 .15rem; flex-shrink: 0; }
.ctrl-btn { display: flex; align-items: center; gap: .3rem; padding: .28rem .55rem; border-radius: 6px; border: 1px solid #1e2530; background: #161B22; color: #64748b; font-size: .71rem; cursor: pointer; font-family: inherit; white-space: nowrap; transition: all .15s; }
.ctrl-btn:hover:not(:disabled) { background: #1e2530; color: #D1D7E0; border-color: #2D3645; }
.ctrl-btn:disabled { opacity: .3; cursor: not-allowed; }
.ctrl-btn.primary { background: rgba(34,197,94,.1); border-color: rgba(34,197,94,.35); color: #22c55e; font-weight: 700; }
.ctrl-btn.primary:hover { background: rgba(34,197,94,.18); }
.ctrl-btn.record { background: rgba(91,141,184,.1); border-color: rgba(91,141,184,.3); color: #5B8DB8; font-weight: 600; }
.ctrl-btn.record:hover { background: rgba(91,141,184,.18); }
.ctrl-btn.danger:hover:not(:disabled) { color: #f87171; border-color: rgba(248,113,113,.3); background: rgba(248,113,113,.08); }
kbd { display: inline-block; padding: .05rem .25rem; border-radius: 3px; border: 1px solid #2D3645; background: #0d1117; color: #475569; font-size: .62rem; font-family: monospace; line-height: 1.4; }
</style>