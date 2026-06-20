<script setup lang="ts">
import type { LeverBall, LeverForce } from '../../../composables/lever/leverUtils'

const props = defineProps<{
  balls: LeverBall[]
  forces: LeverForce[]
}>()

const emit = defineEmits<{
  (e: 'updateMass', id: number, mass: number): void
  (e: 'updateX', id: number, x: number): void
  (e: 'remove', id: number): void
  (e: 'addBall'): void
  (e: 'addForce'): void
  (e: 'toggleForceDirection', id: number): void
}>()

function onMassChange(id: number, val: string) {
  const num = parseFloat(val)
  if (!isNaN(num) && num > 0) emit('updateMass', id, num)
}

function onXChange(id: number, val: string) {
  const num = parseFloat(val)
  if (!isNaN(num)) emit('updateX', id, num)
}
</script>

<template>
  <div class="ball-table">
    <div class="bt-header">
      <button class="btn-add ball" @click="emit('addBall')">+ كرة</button>
      <button class="btn-add force" @click="emit('addForce')">+ قوة</button>
    </div>

    <!-- Balls section -->
    <div v-if="balls.length > 0" class="section-title">🔴 كتل</div>
    <table v-if="balls.length > 0">
      <thead><tr><th>#</th><th>الكتلة</th><th>x (m)</th><th>τ</th><th></th></tr></thead>
      <tbody>
        <tr v-for="b in balls" :key="b.id">
          <td class="col-id">{{ b.id }}</td>
          <td><input type="number" step="0.1" min="0.1" :value="b.mass" @change="onMassChange(b.id, ($event.target as HTMLInputElement).value)" class="cell-input" /></td>
          <td><input type="number" step="0.1" :value="b.x" @change="onXChange(b.id, ($event.target as HTMLInputElement).value)" class="cell-input" /></td>
          <td class="col-torque">{{ (b.mass * 9.81 * b.x).toFixed(1) }}</td>
          <td><button class="btn-del" @click="emit('remove', b.id)">&#x2715;</button></td>
        </tr>
      </tbody>
    </table>

    <!-- Forces section -->
    <div v-if="forces.length > 0" class="section-title force-title">➡️ قوى</div>
    <table v-if="forces.length > 0">
      <thead><tr><th>#</th><th>F (N)</th><th>x (m)</th><th>dir</th><th>τ</th><th></th></tr></thead>
      <tbody>
        <tr v-for="f in forces" :key="f.id">
          <td class="col-id">{{ f.id }}</td>
          <td><input type="number" step="1" min="0" max="100" :value="f.force" @change="onMassChange(f.id, ($event.target as HTMLInputElement).value)" class="cell-input" /></td>
          <td><input type="number" step="0.1" :value="f.x" @change="onXChange(f.id, ($event.target as HTMLInputElement).value)" class="cell-input" /></td>
          <td><button class="btn-dir" @click="emit('toggleForceDirection', f.id)">{{ f.direction === 1 ? '&#x2B06;' : '&#x2B07;' }}</button></td>
          <td class="col-torque">{{ (f.force * f.x * f.direction).toFixed(1) }}</td>
          <td><button class="btn-del" @click="emit('remove', f.id)">&#x2715;</button></td>
        </tr>
      </tbody>
    </table>

    <div v-if="balls.length === 0 && forces.length === 0" class="empty">لا توجد كرات أو قوى</div>
  </div>
</template>

<style scoped>
.ball-table { padding:.5rem; }
.ball-table table { width:100%; border-collapse:collapse; font-size:.8rem; }
.ball-table th { text-align:center; padding:.35rem .25rem; color:#5B8DB8; font-size:.75rem; border-bottom:1px solid #2D3645; }
.ball-table td { text-align:center; padding:.3rem .25rem; border-bottom:1px solid #252D3A; }
.cell-input { width:60px; background:#0f172a; border:1px solid #334155; color:#e2e8f0; border-radius:4px; padding:.2rem; font-size:.75rem; text-align:center; }
.col-id { color:#64748b; font-size:.75rem; width:24px; }
.col-torque { color:#fbbf24; font-weight:700; font-size:.75rem; }
.btn-del { background:none; border:none; color:#f87171; cursor:pointer; font-size:.9rem; padding:.1rem .3rem; }
.bt-header { display:flex; justify-content:center; gap:.4rem; padding:.3rem .5rem; border-bottom:1px solid #2D3645; }
.btn-add.ball { background:rgba(34,197,94,.15); color:#22c55e; border:1px solid rgba(34,197,94,.3); border-radius:5px; padding:.3rem .8rem; font-weight:700; font-size:.8rem; cursor:pointer; }
.btn-add.ball:hover { background:rgba(34,197,94,.25); }
.btn-add.force { background:rgba(91,141,184,.15); color:#5B8DB8; border:1px solid rgba(91,141,184,.3); border-radius:5px; padding:.3rem .8rem; font-weight:700; font-size:.8rem; cursor:pointer; }
.btn-add.force:hover { background:rgba(91,141,184,.25); }
.section-title { font-size:.75rem; font-weight:700; color:#5B8DB8; padding:.3rem .5rem; margin-top:.3rem; }
.force-title { color:#fbbf24; }
.btn-dir { background:#0f172a; border:1px solid #334155; color:#e2e8f0; border-radius:4px; padding:.15rem .3rem; font-size:.8rem; cursor:pointer; }
.empty { text-align:center; color:#64748b; padding:1rem; font-size:.8rem; }
</style>
