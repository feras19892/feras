<script setup lang="ts">
import type { FreeFallTrial } from '../../../composables/freefall/useFreeFallTrials'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{ trials: FreeFallTrial[]; enableNoise?: boolean }>()
const emit = defineEmits<{ (e: 'remove', id: number): void; (e: 'clear'): void }>()
</script>

<template>
  <div>
    <div class="table-header">
      <h5>📋 {{ t('experiments.experimentReadings') }} ({{ trials.length }})</h5>
      <span class="mode-badge" :class="enableNoise ? 'noisy' : 'exact'">{{ enableNoise ? '⚠️ ' + t('experiments.withRelativeError') : '✅ ' + t('experiments.exactMeasurements') }}</span>
    </div>
    <table class="report-table" v-if="trials.length">
      <thead><tr><th>#</th><th>h (m)</th><th>t (s)</th><th>t² (s²)</th><th>v (m/s)</th><th>g_calc</th><th></th></tr></thead>
      <tbody>
        <tr v-for="(tr, i) in trials" :key="tr.id">
          <td>{{ i + 1 }}</td>
          <td>{{ tr.heightMeters.toFixed(2) }}</td>
          <td>{{ tr.timeSec.toFixed(3) }}</td>
          <td>{{ tr.timeSquaredSec2.toFixed(4) }}</td>
          <td>{{ tr.impactVelocityMs.toFixed(2) }}</td>
          <td>{{ tr.gCalc.toFixed(2) }}</td>
          <td><button class="del-btn" @click="emit('remove', tr.id)">🗑️</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else class="no-data">{{ t('experiments.noTrialsRecorded') }}</p>
    <button class="ctrl-btn" @click="emit('clear')" v-if="trials.length">{{ t('experiments.clearAll') }}</button>
  </div>
</template>

<style scoped>
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .3rem; }
h5 { margin: 0; font-size: .82rem; color: #5B8DB8; }
.mode-badge { font-size: .65rem; font-weight: 600; padding: .15rem .35rem; border-radius: 4px; }
.mode-badge.noisy { background: rgba(251,191,36,.1); color: #fbbf24; border: 1px solid rgba(251,191,36,.3); }
.mode-badge.exact { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.3); }
.report-table { width: 100%; border-collapse: collapse; font-size: .72rem; }
.report-table th, .report-table td { border: 1px solid #2D3645; padding: .2rem .3rem; text-align: center; color: #D1D7E0; }
.report-table th { background: #252D3A; }
.del-btn { background: transparent; border: none; color: #ff6b6b; cursor: pointer; font-size: .7rem; }
.no-data { text-align: center; color: #64748b; font-size: .75rem; padding: .5rem; }
.ctrl-btn { margin-top: .3rem; background: #252D3A; border: 1px solid #2D3645; color: #94a3b8; border-radius: 4px; padding: .2rem .5rem; font-size: .7rem; cursor: pointer; }
</style>
