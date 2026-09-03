<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import type { FreeFallTrial } from '../../../composables/freefall/useFreeFallTrials'

const props = defineProps<{ trials: FreeFallTrial[]; trialStats: { time_mean: number; time_std: number; g_mean: number; g_std: number } | null; gTheoretical: number }>()
const emit = defineEmits<{ (e: 'printReport'): void; (e: 'openFullReport'): void }>()
</script>

<template>
  <div>
    <h5>📋 {{ t('experiments.quickReport') }}</h5>
    <div v-if="trials.length" class="mini-report">
      <div>{{ t('experiments.readings') }}: {{ trials.length }}</div>
      <div>{{ t('experiments.averageG') }}: {{ trialStats?.g_mean?.toFixed(2) ?? '--' }} m/s²</div>
      <div>{{ t('experiments.theoreticalG') }}: {{ gTheoretical }} m/s²</div>
    </div>
    <p v-else class="no-data">{{ t('experiments.noData') }}</p>
    <div class="report-actions">
      <button @click="emit('printReport')">🖨️ {{ t('experiments.print') }}</button>
      <button class="primary" @click="emit('openFullReport')">📋 {{ t('experiments.fullReport') }}</button>
    </div>
  </div>
</template>

<style scoped>
h5 { margin: 0 0 .3rem; font-size: .82rem; color: #5B8DB8; }
.mini-report { font-size: .78rem; color: #D1D7E0; line-height: 1.6; }
.no-data { text-align: center; color: #64748b; font-size: .75rem; }
.report-actions { display: flex; gap: .3rem; margin-top: .3rem; }
.report-actions button { background: #252D3A; border: 1px solid #2D3645; color: #94a3b8; border-radius: 4px; padding: .2rem .5rem; font-size: .72rem; cursor: pointer; }
.report-actions button.primary { background: rgba(91,141,184,.15); border-color: #5B8DB8; color: #5B8DB8; }
</style>
