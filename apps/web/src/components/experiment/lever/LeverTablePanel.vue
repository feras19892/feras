<script setup lang="ts">
import type { LeverTrial } from '../../../composables/lever/useLeverTrials'

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
      <thead><tr><th>#</th><th>العزم</th><th>الميلان</th><th>كرات</th><th>قوى</th><th>حالة</th><th></th></tr></thead>
      <tbody>
        <tr v-for="t in trials" :key="t.id">
          <td>{{ t.trialNo }}</td>
          <td>{{ t.netTorque.toFixed(1) }}</td>
          <td>{{ t.tiltDeg.toFixed(1) }}°</td>
          <td>{{ t.balls.length }}</td>
          <td>{{ t.forces.length }}</td>
          <td><span :class="['badge', t.isBalanced ? 'ok' : 'no']">{{ t.isBalanced ? 'متوازن' : 'غير متوازن' }}</span></td>
          <td><button class="btn-del" @click="emit('remove', t.id)">&#x2715;</button></td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty">لا توجد قراءات مسجلة</div>
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
