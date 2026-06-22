<script setup lang="ts">
import type { LeverTrial } from '../../../composables/lever/useLeverTrials'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  trials: LeverTrial[]
}>()
</script>

<template>
  <div class="report-panel">
    <div class="report-title">&#x1F4C4; {{ t('experiments.leverLabReport') }}</div>
    <div v-if="trials.length === 0" class="empty">{{ t('experiments.noDataForReport') }}</div>
    <template v-else>
      <div class="report-row" v-for="tr in trials" :key="tr.id">
        <span class="report-no">#{{ tr.trialNo }}</span>
        <span :class="['report-status', tr.isBalanced ? 'ok' : 'no']">{{ tr.isBalanced ? t('experiments.balanced') : t('experiments.unbalanced') }}</span>
        <span class="report-torque">τ = {{ tr.netTorque.toFixed(1) }} N·m</span>
        <span class="report-tilt">θ = {{ tr.tiltDeg.toFixed(1) }}°</span>
        <span class="report-count">{{ tr.balls.length }} {{ t('experiments.balls') }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.report-panel { padding:.6rem; }
.report-title { font-size:.9rem; font-weight:700; color:#5B8DB8; margin-bottom:.5rem; }
.report-row { display:flex; gap:.5rem; align-items:center; padding:.35rem .5rem; border-bottom:1px solid #2D3645; font-size:.75rem; }
.report-no { color:#64748b; min-width:32px; }
.report-status { font-size:.7rem; padding:.15rem .35rem; border-radius:4px; font-weight:600; }
.report-status.ok { background:rgba(34,197,94,.12); color:#22c55e; }
.report-status.no { background:rgba(239,68,68,.12); color:#f87171; }
.report-torque { color:#e2e8f0; }
.report-tilt { color:#94a3b8; }
.report-count { color:#64748b; font-size:.7rem; }
.empty { text-align:center; color:#64748b; padding:1rem; font-size:.8rem; }
</style>
