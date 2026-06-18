<script setup lang="ts">
import { computed } from 'vue'

interface Trial {
  id: number; mass: number; k: number; amplitude: number; T: number; f: number; omega: number; kCalc: number; err: number;
}

const trials = defineModel<Trial[]>({ required: true })

defineProps<{
  calcResult: string
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'calcK'): void
  (e: 'calcT'): void
  (e: 'calcM'): void
  (e: 'calcFitK'): void
}>()

const tableHeaders = ['#', 'm', 'k', 'A', 'T', 'f', 'ω', 'kcalc', 'خطأ']

const trialStats = computed(() => {
  const n = trials.value.length
  if (n === 0) return { T_mean: 0, T_std: 0, k_mean: 0, k_std: 0 }
  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length) }
  return { T_mean: mean(trials.value.map(t => t.T)), T_std: std(trials.value.map(t => t.T)), k_mean: mean(trials.value.map(t => t.kCalc)), k_std: std(trials.value.map(t => t.kCalc)) }
})
</script>

<template>
  <div class="data-panel">
    <!-- Table -->
    <div class="lab-card">
      <div class="card-header"><h4>&#x1F4CB; قراءات</h4></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th v-for="h in tableHeaders" :key="h">{{ h }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(tr,i) in trials" :key="tr.id" :class="{latest:i===trials.length-1}">
              <td>{{ i+1 }}</td><td>{{ tr.mass.toFixed(2) }}</td><td>{{ tr.k.toFixed(0) }}</td>
              <td>{{ tr.amplitude.toFixed(3) }}</td><td>{{ tr.T.toFixed(3) }}</td><td>{{ tr.f.toFixed(2) }}</td>
              <td>{{ tr.omega.toFixed(2) }}</td><td>{{ tr.kCalc.toFixed(2) }}</td><td>{{ tr.err.toFixed(2) }}%</td>
              <td><button class="btn-danger small" @click="emit('remove', tr.id)">&#xD7;</button></td>
            </tr>
            <tr v-if="!trials.length"><td colspan="10" class="empty-msg">لا توجد قياسات</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Stats -->
    <div class="lab-card stats" v-if="trials.length > 0">
      <div class="stat-section-title">إحصائيات القياسات ({{ trials.length }})</div>
      <div class="stat"><span class="stat-label">T̄</span><span class="stat-value">{{ trialStats.T_mean.toFixed(4) }} s</span></div>
      <div class="stat"><span class="stat-label">σ<sub>T</sub></span><span class="stat-value">{{ trialStats.T_std.toFixed(4) }} s</span></div>
      <div class="stat"><span class="stat-label">k̄<sub>calc</sub></span><span class="stat-value">{{ trialStats.k_mean.toFixed(2) }} N/m</span></div>
      <div class="stat"><span class="stat-label">σ<sub>k</sub></span><span class="stat-value">{{ trialStats.k_std.toFixed(2) }} N/m</span></div>
    </div>

    <!-- Equations -->
    <div class="lab-card equation-card">
      <div class="equation-header"><span>&#x2697;&#xFE0F;</span><h4>حسابات</h4></div>
      <div class="calc-row">
        <button class="btn-calc" @click="emit('calcK')">k من m,T</button>
        <button class="btn-calc" @click="emit('calcT')">T من m,k</button>
        <button class="btn-calc" @click="emit('calcM')">m من T,k</button>
        <button class="btn-calc" @click="emit('calcFitK')">k من regression</button>
      </div>
      <div class="calc-result" v-html="calcResult" />
      <div class="equation-list">
        <div class="equation-item"><span class="eq-type">SHM</span><span class="eq-formula">T = 2π√(m/k)</span></div>
        <div class="equation-item"><span class="eq-type">ω₀</span><span class="eq-formula">ω₀ = √(k/m)</span></div>
        <div class="equation-item"><span class="eq-type">E</span><span class="eq-formula">E = ½kA²</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-panel { display:flex; flex-direction:column; gap:.5rem; }
.lab-card { background:#1E2530; border-radius:8px; padding:.6rem; border:1px solid #2D3645; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .3rem; }
.card-header h4 { margin:0; font-size:.82rem; color:#D1D7E0; font-weight:700; }
.table-wrap { overflow:auto; max-height:160px; }
table { width:100%; border-collapse:collapse; font-size:.62rem; }
th,td { padding:.2rem .3rem; text-align:center; border:1px solid #2D3645; }
th { background:#252D3A; color:#8B95A5; font-weight:700; }
tr.latest td { background:rgba(91,141,184,.1); }
.empty-msg { color:#8B95A5; font-style:italic; padding:.5rem; text-align:center; }
.btn-danger { background:rgba(212,117,107,.15); color:#D4756B; border:1px solid rgba(212,117,107,.3); border-radius:4px; cursor:pointer; }
.btn-danger.small { padding:.1rem .35rem; font-size:.7rem; }
.stats { display:grid; grid-template-columns:1fr 1fr; gap:.3rem; }
.stat-section-title { grid-column:1 / -1; font-size:.6rem; font-weight:700; color:#5B8DB8; text-align:center; padding:.2rem 0; border-bottom:1px solid rgba(91,141,184,.2); margin:.2rem 0; }
.stat { background:#252D3A; border-radius:6px; padding:.35rem .4rem; display:flex; justify-content:space-between; align-items:center; font-size:.72rem; }
.stat-label { color:#8B95A5; font-weight:600; }
.stat-value { color:#D1D7E0; font-weight:700; font-family:monospace; }
.equation-header { display:flex; align-items:center; gap:.3rem; margin-bottom:.3rem; }
.equation-list { display:flex; flex-direction:column; gap:.25rem; }
.equation-item { display:flex; flex-direction:column; gap:.1rem; background:rgba(37,45,58,.4); border-radius:5px; padding:.25rem .35rem; }
.eq-type { font-size:.55rem; color:#8B95A5; font-weight:700; }
.eq-formula { font-size:.7rem; color:#D1D7E0; font-weight:600; font-family:monospace; }
.calc-row { display:flex; flex-wrap:wrap; gap:.3rem; margin:.3rem 0; }
.btn-calc { flex:1; min-width:80px; padding:.35rem .4rem; background:#252D3A; border:1px solid #2D3645; border-radius:6px; color:#8B95A5; cursor:pointer; font-size:.65rem; font-weight:600; transition:all .15s; }
.btn-calc:hover { background:rgba(91,141,184,.12); color:#D1D7E0; border-color:rgba(91,141,184,.3); }
.calc-result { background:rgba(37,45,58,.5); border:1px solid #2D3645; border-radius:6px; padding:.4rem .5rem; margin:.3rem 0; font-size:.72rem; color:#D1D7E0; line-height:1.6; min-height:2.5rem; }
</style>
