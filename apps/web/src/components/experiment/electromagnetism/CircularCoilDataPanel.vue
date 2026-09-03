<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import type { CircularCoilTrial } from '../../../composables/electromagnetism/useCircularCoilExperiment'

defineProps<{
  trials: CircularCoilTrial[]
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="data-panel">
    <div class="data-header">
      <span class="data-title">{{ t('experiments.emRecordedTrials') }}</span>
      <button v-if="trials.length" class="clear-btn" @click="emit('clear')">{{ t('experiments.emClearAll') }}</button>
    </div>

    <div v-if="!trials.length" class="empty">
      {{ t('experiments.emNoTrials') }}
    </div>

    <table v-else class="trial-table">
      <thead>
        <tr>
          <th>#</th>
          <th>I (A)</th>
          <th>N</th>
          <th>R (cm)</th>
          <th>B (μT)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="trial in trials" :key="trial.id">
          <td>{{ trial.id }}</td>
          <td>{{ trial.I.toFixed(1) }}</td>
          <td>{{ trial.N }}</td>
          <td>{{ (trial.R * 100).toFixed(1) }}</td>
          <td>{{ (trial.B * 1e6).toFixed(2) }}</td>
          <td><button class="del-btn" @click="emit('remove', trial.id)">✕</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.data-panel { padding: .75rem; display: flex; flex-direction: column; gap: .5rem; }
.data-header { display: flex; justify-content: space-between; align-items: center; }
.data-title { font-size: .85rem; font-weight: 700; color: #f59e0b; }
.clear-btn { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.2); color: #ef4444; border-radius: 4px; padding: .2rem .5rem; cursor: pointer; font-size: .7rem; }
.clear-btn:hover { background: rgba(239,68,68,.2); }
.empty { font-size: .75rem; color: #64748b; text-align: center; padding: 1rem; }
.trial-table { width: 100%; border-collapse: collapse; font-size: .75rem; }
.trial-table th { color: #94a3b8; font-weight: 600; padding: .3rem; text-align: center; border-bottom: 1px solid #2D3645; }
.trial-table td { padding: .3rem; text-align: center; color: #D1D7E0; border-bottom: 1px solid rgba(45,54,69,.4); }
.del-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: .7rem; }
.del-btn:hover { color: #f87171; }
</style>
