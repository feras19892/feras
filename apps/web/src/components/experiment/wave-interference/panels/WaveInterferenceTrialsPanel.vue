<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
import type { WaveInterferenceTrial } from '../../../../composables/wave-interference/useWaveInterferenceTrials'
const { t } = useI18n()
interface Props { trials: WaveInterferenceTrial[] }
defineProps<Props>()
const emit = defineEmits<{ (e: 'remove', id: number): void; (e: 'clear'): void }>()
</script>

<template>
  <div class="panel-body">
    <table class="trial-table" v-if="trials.length">
      <thead><tr><th>#</th><th>d</th><th>lambda</th><th>f</th><th>D</th><th></th></tr></thead>
      <tbody>
        <tr v-for="tr in trials" :key="tr.id">
          <td>{{ tr.id }}</td><td>{{ tr.sourceDistance.toFixed(3) }}</td><td>{{ (tr.wavelength * 1000).toFixed(1) }}mm</td>
          <td>{{ tr.frequency }}</td><td>{{ tr.screenDistance.toFixed(2) }}</td>
          <td><button class="rm" @click="emit('remove', tr.id)">&#x00D7;</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">{{ t('experiments.noTrialsYet') }}</p>
    <button v-if="trials.length" class="clear-btn" @click="emit('clear')">{{ t('experiments.clearData') }}</button>
  </div>
</template>

<style scoped>
.panel-body { font-size: .8rem; }
.trial-table { width: 100%; border-collapse: collapse; }
.trial-table th, .trial-table td { padding: 4px 6px; text-align: center; border-bottom: 1px solid #2D3645; font-size: .75rem; }
.trial-table th { color: #8B95A5; font-weight: 600; }
.rm { background: none; border: none; color: #f87171; cursor: pointer; font-size: .8rem; }
.empty { color: #64748b; text-align: center; padding: 1rem; }
.clear-btn { margin-top: .5rem; width: 100%; padding: .3rem; background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.3); color: #f87171; border-radius: 4px; cursor: pointer; font-size: .75rem; }
</style>
