<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

defineProps<{
  running: boolean
  paused: boolean
  speed: number
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-pause'): void
  (e: 'reset'): void
  (e: 'record-trial'): void
  (e: 'clear-trials'): void
  (e: 'export-csv'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'update:speed', value: number): void
}>()
</script>

<template>
  <div class="control-bar">
    <button class="btn primary" @click="emit('toggle-pause')">
      {{ running && !paused ? '⏸️ ' + t('experiments.pauseBtn') : '▶️ ' + t('experiments.startBtn') }}
    </button>
    <button class="btn" @click="emit('reset')">🔄 {{ t('experiments.resetBtn') }}</button>
    <button class="btn" @click="emit('record-trial')">📝 {{ t('experiments.recordBtn') }}</button>
    <button class="btn" @click="emit('clear-trials')">🗑️ {{ t('experiments.clearAll') }}</button>
    <button class="btn" @click="emit('export-csv')">📊 CSV</button>
    <button class="btn" :disabled="!canUndo" @click="emit('undo')">↩️</button>
    <button class="btn" :disabled="!canRedo" @click="emit('redo')">↪️</button>
    <label class="speed-label">
      {{ t('experiments.speedLabel') }}
      <input type="range" min="0.25" max="4" step="0.25" :value="speed"
        @input="emit('update:speed', Number(($event.target as HTMLInputElement).value))" />
      <span>{{ speed }}x</span>
    </label>
  </div>
</template>

<style scoped>
.control-bar { display: flex; align-items: center; justify-content: center; gap: .4rem; padding: .4rem .6rem; background: #161B22; border-radius: 8px; flex-wrap: wrap; }
.btn { padding: .35rem .7rem; border: 1px solid #2D3645; border-radius: 6px; background: #1c2331; color: #D1D7E0; cursor: pointer; font-size: .8rem; transition: all .15s; }
.btn:hover:not(:disabled) { background: #2D3645; border-color: #5B8DB8; }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn.primary { background: #1a5276; border-color: #2E86C1; }
.btn.primary:hover { background: #2E86C1; }
.speed-label { display: flex; align-items: center; gap: .3rem; font-size: .75rem; color: #8b9bb5; }
.speed-label input { width: 80px; }
</style>
