<script setup lang="ts">
import type { FaradayTrial } from '../../../composables/faraday/useFaradayTrials'

interface Props { id: string; trials: FaradayTrial[]; params: { N: number; B: number; A: number; omega: number }; theta: number; flux: number; emf: number }
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { N: number; B: number; A: number; omega: number }): void
}>()
</script>
<template>
  <div>
    <div v-if="id === 'readings'" class="panel-body">
      <div class="read-row"><span class="label">عدد اللفات N</span><span class="value">{{ params.N }}</span></div>
      <div class="read-row"><span class="label">B</span><span class="value">{{ params.B.toFixed(1) }} T</span></div>
      <div class="read-row"><span class="label">A</span><span class="value">{{ params.A.toFixed(3) }} m²</span></div>
      <div class="read-row"><span class="label">ω</span><span class="value">{{ params.omega.toFixed(1) }} rad/s</span></div>
      <div class="read-row"><span class="label">θ</span><span class="value">{{ Math.round(theta) }}°</span></div>
      <div class="read-row"><span class="label">Φ</span><span class="value">{{ flux.toFixed(4) }} Wb</span></div>
      <div class="read-row"><span class="label">EMF</span><span class="value">{{ emf.toFixed(2) }} V</span></div>
    </div>
    <div v-else-if="id === 'chart'" class="panel-body center">{{ trials.length < 2 ? 'سجل تجربتين على الأقل' : 'رسم EMF vs ω' }}</div>
    <div v-else-if="id === 'trials'" class="panel-body">
      <div class="trials-header"><span>#</span><span>N</span><span>B</span><span>ω</span><span>EMF</span><span></span></div>
      <div v-for="t in trials" :key="t.id" class="trial-row">
        <span>{{ t.id }}</span><span>{{ t.N }}</span><span>{{ t.B.toFixed(1) }}</span><span>{{ t.omega.toFixed(1) }}</span><span>{{ t.emf.toFixed(2) }}</span>
        <button class="del-btn" @click="emit('remove', t.id)">x</button>
      </div>
      <div v-if="!trials.length" class="no-trials">لا توجد تجارب</div>
      <div class="trials-actions"><button class="clear-btn" @click="emit('clear')">مسح الكل</button></div>
    </div>
    <div v-else-if="id === 'params'" class="panel-body">
      <div class="param-row"><label>عدد اللفات N</label><input type="range" :value="params.N" min="10" max="500" step="10" @input="emit('update:params', { ...params, N: +($event.target as HTMLInputElement).value })" /><span>{{ params.N }}</span></div>
      <div class="param-row"><label>B (T)</label><input type="range" :value="params.B" min="0.1" max="2" step="0.1" @input="emit('update:params', { ...params, B: +($event.target as HTMLInputElement).value })" /><span>{{ params.B.toFixed(1) }}</span></div>
      <div class="param-row"><label>A (m²)</label><input type="range" :value="params.A" min="0.001" max="0.1" step="0.001" @input="emit('update:params', { ...params, A: +($event.target as HTMLInputElement).value })" /><span>{{ params.A.toFixed(3) }}</span></div>
      <div class="param-row"><label>ω (rad/s)</label><input type="range" :value="params.omega" min="0.5" max="10" step="0.5" @input="emit('update:params', { ...params, omega: +($event.target as HTMLInputElement).value })" /><span>{{ params.omega.toFixed(1) }}</span></div>
    </div>
    <div v-else-if="id === 'laws'" class="panel-body">
      <div class="law-box"><div class="law-title">قانون فارادي</div><div class="formula">ε = -N · dΦ/dt</div></div>
      <div class="law-box"><div class="law-title">الفلوس المغناطيسي</div><div class="formula">Φ = B · A · cos(θ)</div></div>
    </div>
    <div v-else-if="id === 'results'" class="panel-body">
      <div class="stat-box"><div class="stat-label">عدد التجارب</div><div class="stat-value">{{ trials.length }}</div></div>
      <div class="stat-box"><div class="stat-label">متوسط EMF</div><div class="stat-value">{{ trials.length ? (trials.reduce((s,t)=>s+t.emf,0)/trials.length).toFixed(2) : '0' }} V</div></div>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.read-row { display:flex; justify-content:space-between; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,0.02); }
.label { color:#8B95A5; font-size:.72rem; }
.value { color:#D1D7E0; font-weight:600; font-size:.72rem; }
.center { text-align:center; color:#475569; font-size:.75rem; padding:.5rem; }
.trials-header { display:grid; grid-template-columns:30px 1fr 1fr 1fr 1fr 24px; gap:.3rem; font-size:.68rem; color:#5B8DB8; font-weight:700; padding:0 .2rem; border-bottom:1px solid #1e2530; padding-bottom:.25rem; }
.trial-row { display:grid; grid-template-columns:30px 1fr 1fr 1fr 1fr 24px; gap:.3rem; align-items:center; padding:.25rem .2rem; font-size:.7rem; color:#D1D7E0; border-bottom:1px solid rgba(30,37,48,.5); }
.del-btn { width:20px; height:20px; border-radius:50%; border:none; background:transparent; color:#8B95A5; cursor:pointer; font-size:.7rem; display:flex; align-items:center; justify-content:center; }
.del-btn:hover { background:rgba(248,113,113,.15); color:#f87171; }
.no-trials { text-align:center; color:#475569; font-size:.75rem; padding:.5rem; }
.trials-actions { display:flex; justify-content:center; padding-top:.3rem; }
.clear-btn { padding:.25rem .6rem; border-radius:5px; border:1px solid rgba(248,113,113,.3); background:rgba(248,113,113,.08); color:#f87171; font-size:.7rem; cursor:pointer; }
.param-row { display:flex; flex-direction:column; gap:.25rem; margin-bottom:.4rem; }
.param-row label { color:#8B95A5; font-size:.72rem; }
.param-row input[type=range] { width:100%; accent-color:#5B8DB8; }
.param-row span { color:#5B8DB8; font-weight:600; font-size:.72rem; text-align:right; }
.law-box { background:rgba(91,141,184,.05); border:1px solid rgba(91,141,184,.15); border-radius:6px; padding:.5rem .6rem; margin-bottom:.4rem; }
.law-title { color:#5B8DB8; font-weight:700; font-size:.78rem; margin-bottom:.35rem; }
.formula { font-family:'Courier New', monospace; font-size:.9rem; color:#D1D7E0; text-align:center; margin:.3rem 0; }
.stat-box { background:rgba(255,255,255,0.02); border:1px solid #1e2530; border-radius:6px; padding:.45rem .55rem; display:flex; justify-content:space-between; align-items:center; }
.stat-label { color:#8B95A5; font-size:.72rem; }
.stat-value { color:#D1D7E0; font-weight:700; font-size:.85rem; }
</style>
