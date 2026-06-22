<script setup lang="ts">
import { uniqueColorPerId } from '../../../composables/lever/leverUtils'
import type { LeverBall, LeverForce } from '../../../composables/lever/leverUtils'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  balls: LeverBall[]
  forces: LeverForce[]
}>()

const emit = defineEmits<{
  (e: 'updateMass', id: number, mass: number): void
  (e: 'updateX', id: number, x: number): void
  (e: 'updateForce', id: number, force: number): void
  (e: 'updateForceX', id: number, x: number): void
  (e: 'remove', id: number): void
  (e: 'addBall'): void
  (e: 'addForce'): void
  (e: 'toggleForceDirection', id: number): void
}>()

function onMassInput(id: number, val: string) {
  if (val === '' || val === '.' || val === '-') return
  const num = parseFloat(val)
  if (!isNaN(num) && num > 0) emit('updateMass', id, num)
}

function onXInput(id: number, val: string) {
  if (val === '' || val === '.' || val === '-') return
  const num = parseFloat(val)
  if (!isNaN(num)) emit('updateX', id, num)
}

function onForceInput(id: number, val: string) {
  if (val === '' || val === '.' || val === '-') return
  const num = parseFloat(val)
  if (!isNaN(num) && num >= 0 && num <= 100) emit('updateForce', id, num)
}

function onForceXInput(id: number, val: string) {
  if (val === '' || val === '.' || val === '-') return
  const num = parseFloat(val)
  if (!isNaN(num)) emit('updateForceX', id, num)
}
</script>

<template>
  <div class="ball-table">
    <div class="bt-header">
      <button class="btn-add ball" @click="emit('addBall')">+ {{ t('experiments.ball') }}</button>
      <button class="btn-add force" @click="emit('addForce')">+ {{ t('experiments.force') }}</button>
    </div>

    <!-- Balls section -->
    <div v-if="balls.length > 0" class="section-title">🔴 {{ t('experiments.masses') }}</div>
    <table v-if="balls.length > 0">
      <thead><tr><th>#</th><th>{{ t('experiments.mass') }}</th><th>x</th><th>τ</th><th></th></tr></thead>
      <tbody>
        <tr v-for="b in balls" :key="b.id">
          <td class="col-id"><span class="id-dot" :style="{ background: uniqueColorPerId(b.id) }">{{ b.id }}</span></td>
          <td>
            <div class="ctrl-row">
              <input type="range" min="0.1" max="10" step="0.1" :value="b.mass" @input="onMassInput(b.id, ($event.target as HTMLInputElement).value)" class="slider" />
              <input type="number" step="0.1" min="0.1" :value="b.mass" @input="onMassInput(b.id, ($event.target as HTMLInputElement).value)" class="cell-input" />
            </div>
          </td>
          <td>
            <div class="ctrl-row">
              <input type="range" min="-5" max="5" step="0.1" :value="b.x" @input="onXInput(b.id, ($event.target as HTMLInputElement).value)" class="slider" />
              <input type="number" step="0.1" :value="b.x" @input="onXInput(b.id, ($event.target as HTMLInputElement).value)" class="cell-input" />
            </div>
          </td>
          <td class="col-torque">{{ (b.mass * 9.81 * b.x).toFixed(1) }}</td>
          <td><button class="btn-del" @click="emit('remove', b.id)">&#x2715;</button></td>
        </tr>
      </tbody>
    </table>

    <!-- Forces section -->
    <div v-if="forces.length > 0" class="section-title force-title">➡️ {{ t('experiments.forces') }}</div>
    <table v-if="forces.length > 0">
      <thead><tr><th>#</th><th>F (N)</th><th>x (m)</th><th>dir</th><th>τ</th><th></th></tr></thead>
      <tbody>
        <tr v-for="f in forces" :key="f.id">
          <td class="col-id"><span class="id-dot" :style="{ background: uniqueColorPerId(f.id) }">{{ f.id }}</span></td>
          <td>
            <div class="ctrl-row">
              <input type="range" min="0" max="100" step="1" :value="f.force" @input="onForceInput(f.id, ($event.target as HTMLInputElement).value)" class="slider" />
              <input type="number" step="1" min="0" max="100" :value="f.force" @input="onForceInput(f.id, ($event.target as HTMLInputElement).value)" class="cell-input" />
            </div>
          </td>
          <td>
            <div class="ctrl-row">
              <input type="range" min="-5" max="5" step="0.1" :value="f.x" @input="onForceXInput(f.id, ($event.target as HTMLInputElement).value)" class="slider" />
              <input type="number" step="0.1" :value="f.x" @input="onForceXInput(f.id, ($event.target as HTMLInputElement).value)" class="cell-input" />
            </div>
          </td>
          <td><button class="btn-dir" @click="emit('toggleForceDirection', f.id)">{{ f.direction === 1 ? '&#x2B07;' : '&#x2B06;' }}</button></td>
          <td class="col-torque">{{ (f.force * f.x * f.direction).toFixed(1) }}</td>
          <td><button class="btn-del" @click="emit('remove', f.id)">&#x2715;</button></td>
        </tr>
      </tbody>
    </table>

    <div v-if="balls.length === 0 && forces.length === 0" class="empty">{{ t('experiments.noBallsOrForces') }}</div>
  </div>
</template>

<style scoped>
.ball-table { padding:.4rem; }
.ball-table table { width:100%; border-collapse:separate; border-spacing:0; font-size:.78rem; }
.ball-table th { text-align:center; padding:.25rem .2rem; color:#5B8DB8; font-size:.7rem; font-weight:600; border-bottom:1px solid rgba(91,141,184,0.15); }
.ball-table td { text-align:center; padding:.2rem .2rem; border-bottom:1px solid rgba(45,54,69,0.4); }
.cell-input { width:52px; background:rgba(15,23,42,0.6); border:1px solid rgba(91,141,184,0.15); color:#e2e8f0; border-radius:5px; padding:.18rem; font-size:.72rem; text-align:center; transition:border-color .15s, box-shadow .15s; }
.cell-input:focus { outline:none; border-color:rgba(91,141,184,0.4); box-shadow:0 0 0 2px rgba(91,141,184,0.1); }
.col-id { color:#64748b; font-size:.7rem; width:22px; }
.col-torque { color:#fbbf24; font-weight:700; font-size:.7rem; }
.btn-del { background:rgba(248,113,113,0.08); border:none; color:#f87171; cursor:pointer; font-size:.8rem; padding:.1rem .25rem; border-radius:4px; transition:background .15s; }
.btn-del:hover { background:rgba(248,113,113,0.2); }
.bt-header { display:flex; justify-content:center; gap:.35rem; padding:.25rem .4rem .35rem; border-bottom:1px solid rgba(91,141,184,0.1); }
.btn-add.ball { background:linear-gradient(135deg, rgba(34,197,94,.15), rgba(34,197,94,.05)); color:#22c55e; border:1px solid rgba(34,197,94,.25); border-radius:6px; padding:.25rem .7rem; font-weight:700; font-size:.75rem; cursor:pointer; transition:all .15s; }
.btn-add.ball:hover { background:linear-gradient(135deg, rgba(34,197,94,.25), rgba(34,197,94,.1)); transform:translateY(-1px); box-shadow:0 2px 8px rgba(34,197,94,.15); }
.btn-add.force { background:linear-gradient(135deg, rgba(91,141,184,.15), rgba(91,141,184,.05)); color:#5B8DB8; border:1px solid rgba(91,141,184,.25); border-radius:6px; padding:.25rem .7rem; font-weight:700; font-size:.75rem; cursor:pointer; transition:all .15s; }
.btn-add.force:hover { background:linear-gradient(135deg, rgba(91,141,184,.25), rgba(91,141,184,.1)); transform:translateY(-1px); box-shadow:0 2px 8px rgba(91,141,184,.15); }
.section-title { font-size:.72rem; font-weight:700; color:#5B8DB8; padding:.2rem .4rem; margin-top:.25rem; }
.force-title { color:#fbbf24; }
.ctrl-row { display:flex; align-items:center; gap:.25rem; }
.slider { width:55px; accent-color:#5B8DB8; cursor:pointer; }
.id-dot { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; color:#fff; font-size:.65rem; font-weight:700; box-shadow:0 1px 4px rgba(0,0,0,0.3); }
.btn-dir { background:rgba(15,23,42,0.5); border:1px solid rgba(91,141,184,0.2); color:#e2e8f0; border-radius:5px; padding:.12rem .3rem; font-size:.75rem; cursor:pointer; transition:all .15s; }
.btn-dir:hover { background:rgba(91,141,184,.15); border-color:rgba(91,141,184,0.35); }
.empty { text-align:center; color:#64748b; padding:.8rem; font-size:.75rem; }
</style>
