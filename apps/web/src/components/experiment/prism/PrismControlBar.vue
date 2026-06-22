<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

interface Props {
  launchLabel: string
  canUndo: boolean
  canRedo: boolean
}

defineProps<Props>()

const { t } = useI18n()
const emit = defineEmits<{
  (e: 'togglePause'): void
  (e: 'reset'): void
  (e: 'recordTrial'): void
  (e: 'clearTrials'): void
  (e: 'exportCsv'): void
  (e: 'undo'): void
  (e: 'redo'): void
}>()
</script>

<template>
  <div class="ctrl-bar">
    <button class="ctrl-btn primary" @click="emit('togglePause')">{{ launchLabel }}</button>
    <button class="ctrl-btn" @click="emit('recordTrial')">&#x1F4CC; {{ t('experiments.recordBtn') }}</button>
    <button class="ctrl-btn" @click="emit('reset')">&#x1F504; {{ t('experiments.resetBtn') }}</button>
    <button class="ctrl-btn" @click="emit('clearTrials')">&#x1F5D1; {{ t('experiments.clearAll') }}</button>
    <button class="ctrl-btn" @click="emit('exportCsv')">&#x1F4BE; CSV</button>
    <button class="ctrl-btn" :disabled="!canUndo" @click="emit('undo')">&#x21A9; {{ t('experiments.undoBtn') }}</button>
    <button class="ctrl-btn" :disabled="!canRedo" @click="emit('redo')">&#x21AA; {{ t('experiments.redoBtn') }}</button>
  </div>
</template>

<style scoped>
.ctrl-bar { display: flex; justify-content: center; gap: .35rem; padding: .4rem .6rem; background: #161B22; border-top: 1px solid #2D3645; flex-shrink: 0; overflow-x: auto; }
.ctrl-btn { padding: .3rem .6rem; border-radius: 6px; border: 1px solid #2D3645; background: #1E2530; color: #8B95A5; font-size: .72rem; cursor: pointer; font-family: inherit; white-space: nowrap; transition: all .15s; }
.ctrl-btn:hover:not(:disabled) { background: #252D3A; color: #D1D7E0; }
.ctrl-btn:disabled { opacity: .4; cursor: not-allowed; }
.ctrl-btn.primary { background: rgba(34,197,94,.1); border-color: rgba(34,197,94,.3); color: #22c55e; font-weight: 700; }
.ctrl-btn.primary:hover { background: rgba(34,197,94,.15); }
</style>
