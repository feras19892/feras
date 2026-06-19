<script setup lang="ts">
import type { InclinedTrial } from '../../../composables/inclined/useInclinedTrials'

const props = defineProps<{
  trials: InclinedTrial[]
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
}>()
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>θ (°)</th>
          <th>L (m)</th>
          <th>m (kg)</th>
          <th>μ</th>
          <th>a (m/s²)</th>
          <th>t (s)</th>
          <th>v (m/s)</th>
          <th>N (N)</th>
          <th>F∥ (N)</th>
          <th>f (N)</th>
          <th>err (%)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(t, i) in trials" :key="t.id">
          <td>{{ i + 1 }}</td>
          <td>{{ t.thetaDeg }}</td>
          <td>{{ t.length.toFixed(2) }}</td>
          <td>{{ t.mass.toFixed(2) }}</td>
          <td>{{ t.mu.toFixed(2) }}</td>
          <td>{{ t.acceleration.toFixed(3) }}</td>
          <td>{{ t.timeOfArrival.toFixed(3) }}</td>
          <td>{{ t.finalVelocity.toFixed(2) }}</td>
          <td>{{ t.normalForce.toFixed(2) }}</td>
          <td>{{ t.parallelForce.toFixed(2) }}</td>
          <td>{{ t.frictionForce.toFixed(2) }}</td>
          <td :class="{ good: t.err < 5, bad: t.err > 10 }">{{ t.err.toFixed(2) }}</td>
          <td><button class="del" @click="emit('remove', t.id)">×</button></td>
        </tr>
      </tbody>
    </table>
    <div v-if="!trials.length" class="empty">لا توجد قراءات مسجلة</div>
  </div>
</template>

<style scoped>
.table-wrap { overflow: auto; max-height: 100%; }
table { width: 100%; border-collapse: collapse; font-size: .68rem; }
th, td { padding: .3rem .35rem; text-align: center; border-bottom: 1px solid #2D3645; white-space: nowrap; }
th { background: rgba(255,255,255,.03); color: #8B95A5; font-weight: 600; position: sticky; top: 0; }
td { color: #D1D7E0; }
td.good { color: #22c55e; } td.bad { color: #ef4444; }
.del { background: none; border: none; color: #ef4444; cursor: pointer; font-size: .9rem; }
.empty { text-align: center; padding: 1rem; color: #8B95A5; font-size: .75rem; }
</style>
