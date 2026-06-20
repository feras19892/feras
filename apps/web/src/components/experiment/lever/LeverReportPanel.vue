<script setup lang="ts">
import type { LeverTrial } from '../../../composables/lever/useLeverTrials'

const props = defineProps<{
  trials: LeverTrial[]
}>()
</script>

<template>
  <div class="report-panel">
    <div class="report-title">&#x1F4C4; تقرير مختبر الروافع</div>
    <div v-if="trials.length === 0" class="empty">لا توجد بيانات للتقرير</div>
    <template v-else>
      <div class="report-row" v-for="t in trials" :key="t.id">
        <span class="report-no">#{{ t.trialNo }}</span>
        <span :class="['report-status', t.isBalanced ? 'ok' : 'no']">{{ t.isBalanced ? 'متوازن' : 'غير متوازن' }}</span>
        <span class="report-torque">τ = {{ t.netTorque.toFixed(1) }} N·m</span>
        <span class="report-tilt">θ = {{ t.tiltDeg.toFixed(1) }}°</span>
        <span class="report-count">{{ t.balls.length }} كرات</span>
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
