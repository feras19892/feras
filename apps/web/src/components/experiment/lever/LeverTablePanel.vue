<script setup lang="ts">
import type { LeverTrial } from '../../../composables/lever/useLeverTrials'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  trials: LeverTrial[]
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="table-panel">
    <table v-if="trials.length">
      <thead><tr><th>#</th><th>{{ t('experiments.torque') }}</th><th>{{ t('experiments.tilt') }}</th><th>{{ t('experiments.balls') }}</th><th>{{ t('experiments.forces') }}</th><th>{{ t('experiments.status') }}</th><th></th></tr></thead>
      <tbody>
        <tr v-for="tr in trials" :key="tr.id">
          <td>{{ tr.trialNo }}</td>
          <td>{{ tr.netTorque.toFixed(1) }}</td>
          <td>{{ tr.tiltDeg.toFixed(1) }}°</td>
          <td>{{ tr.balls.length }}</td>
          <td>{{ tr.forces.length }}</td>
          <td><span :class="['badge', tr.isBalanced ? 'ok' : 'no']">{{ tr.isBalanced ? t('experiments.balanced') : t('experiments.unbalanced') }}</span></td>
          <td><button class="btn-del" @click="emit('remove', tr.id)">&#x2715;</button></td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty">{{ t('experiments.noTrialsRecorded') }}</div>
  </div>
</template>

<style scoped>
.table-panel { padding:.6rem; overflow:auto; }
table { width:100%; border-collapse:collapse; font-size:.78rem; }
th, td { padding:.35rem .5rem; text-align:center; border-bottom:1px solid #2D3645; color:#e2e8f0; }
th { color:#5B8DB8; font-weight:700; background:rgba(255,255,255,.02); }
.badge { font-size:.7rem; padding:.15rem .35rem; border-radius:4px; font-weight:600; }
.badge.ok { background:rgba(34,197,94,.12); color:#22c55e; }
.badge.no { background:rgba(239,68,68,.12); color:#f87171; }
.btn-del { background:none; border:none; color:#ef4444; cursor:pointer; font-size:.8rem; }
.empty { text-align:center; color:#64748b; padding:2rem; font-size:.8rem; }
</style>
