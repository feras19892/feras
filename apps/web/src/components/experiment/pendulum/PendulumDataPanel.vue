<script setup lang="ts">
import { computed } from 'vue'
interface PendulumTrial { id: number; length: number; g: number; T: number; f: number; omega: number; gCalc: number; err: number }
const trials = defineModel<PendulumTrial[]>({ required: true })
defineProps<{ calcResult: string }>()
const emit = defineEmits<{ (e: 'remove', id: number): void; (e: 'clear'): void; (e: 'calcG'): void; (e: 'calcT'): void; (e: 'calcL'): void; (e: 'calcFitG'): void }>()
const tableHeaders = ['#', 'L', 'T', 'f', 'ω', 'gcalc', 'خطأ']
const trialStats = computed(() => {
  const n = trials.value.length
  if (n === 0) return { T_mean: 0, T_std: 0, g_mean: 0, g_std: 0 }
  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length) }
  return { T_mean: mean(trials.value.map(t => t.T)), T_std: std(trials.value.map(t => t.T)), g_mean: mean(trials.value.map(t => t.gCalc)), g_std: std(trials.value.map(t => t.gCalc)) }
})
</script>

<template>
  <div class="data-panel">
    <div class="lab-card">
      <div class="card-header"><h4>&#x1F4CB; قراءات</h4></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th v-for="h in tableHeaders" :key="h">{{ h }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(tr,i) in trials" :key="tr.id" :class="{latest:i===trials.length-1}">
              <td>{{ i+1 }}</td><td>{{ tr.length.toFixed(2) }}</td><td>{{ tr.T.toFixed(3) }}</td>
              <td>{{ tr.f.toFixed(2) }}</td><td>{{ tr.omega.toFixed(2) }}</td><td>{{ tr.gCalc.toFixed(2) }}</td><td>{{ tr.err.toFixed(2) }}%</td>
              <td><button class="btn-danger small" @click="emit('remove', tr.id)">&#xD7;</button></td>
            </tr>
            <tr v-if="!trials.length"><td colspan="10" class="empty-msg">لا توجد قياسات</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="lab-card stats" v-if="trials.length > 0">
      <div class="stat-section-title">إحصائيات القياسات ({{ trials.length }})</div>
      <div class="stat"><span class="stat-label">T̄</span><span class="stat-value">{{ trialStats.T_mean.toFixed(4) }} s</span></div>
      <div class="stat"><span class="stat-label">σ<sub>T</sub></span><span class="stat-value">{{ trialStats.T_std.toFixed(4) }} s</span></div>
      <div class="stat"><span class="stat-label">ḡ<sub>calc</sub></span><span class="stat-value">{{ trialStats.g_mean.toFixed(2) }} m/s²</span></div>
      <div class="stat"><span class="stat-label">σ<sub>g</sub></span><span class="stat-value">{{ trialStats.g_std.toFixed(2) }} m/s²</span></div>
    </div>
    <div class="lab-card equation-card">
      <div class="equation-header"><span>&#x2697;&#xFE0F;</span><h4>حسابات</h4></div>
      <div class="calc-row">
        <button class="btn-calc" @click="emit('calcG')">g من L,T</button>
        <button class="btn-calc" @click="emit('calcT')">T من L,g</button>
        <button class="btn-calc" @click="emit('calcL')">L من T,g</button>
        <button class="btn-calc" @click="emit('calcFitG')">g من regression</button>
      </div>
      <div class="calc-result" v-html="calcResult" />
      <div class="equation-list">
        <div class="equation-item"><span class="eq-type">SHM</span><span class="eq-formula">T = 2π√(L/g)</span></div>
        <div class="equation-item"><span class="eq-type">ω₀</span><span class="eq-formula">ω₀ = √(g/L)</span></div>
        <div class="equation-item"><span class="eq-type">g</span><span class="eq-formula">g = 4π²L/T²</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-panel { display:flex; flex-direction:column; gap:.4rem; }
.lab-card { background:linear-gradient(145deg,rgba(30,41,59,0.9),rgba(15,23,42,0.85)); border-radius:10px; padding:.7rem; border:1px solid rgba(71,85,105,0.3); box-shadow:0 4px 12px rgba(0,0,0,.15); }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .35rem; }
.card-header h4 { margin:0; font-size:.85rem; color:#e2e8f0; font-weight:800; }
.table-wrap { overflow:auto; max-height:160px; border-radius:6px; }
table { width:100%; border-collapse:separate; border-spacing:0; font-size:.65rem; }
th { padding:.25rem .35rem; text-align:center; background:linear-gradient(180deg,#334155,#1e293b); color:#cbd5e1; font-weight:700; border-bottom:2px solid #475569; }
td { padding:.25rem .35rem; text-align:center; border-bottom:1px solid rgba(71,85,105,0.25); color:#e2e8f0; }
tr:last-child td { border-bottom:none; }
tr.latest td { background:rgba(96,165,250,0.1); color:#60a5fa; font-weight:700; }
.empty-msg { color:#64748b; font-style:italic; padding:.6rem; text-align:center; }
.btn-danger { background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.3); border-radius:5px; cursor:pointer; transition:all .15s; }
.btn-danger:hover { background:rgba(239,68,68,0.2); }
.btn-danger.small { padding:.15rem .4rem; font-size:.65rem; }
.stats { display:grid; grid-template-columns:1fr 1fr; gap:.3rem; }
.stat-section-title { grid-column:1 / -1; font-size:.65rem; font-weight:800; color:#60a5fa; text-align:center; padding:.25rem 0; border-bottom:1px solid rgba(96,165,250,0.2); margin:.15rem 0; }
.stat { background:rgba(30,41,59,0.6); border-radius:6px; padding:.4rem .5rem; display:flex; justify-content:space-between; align-items:center; font-size:.72rem; border:1px solid rgba(71,85,105,0.2); }
.stat-label { color:#94a3b8; font-weight:600; }
.stat-value { color:#e2e8f0; font-weight:800; font-family:monospace; }
.equation-header { display:flex; align-items:center; gap:.3rem; margin-bottom:.35rem; }
.equation-list { display:flex; flex-direction:column; gap:.25rem; }
.equation-item { display:flex; flex-direction:column; gap:.1rem; background:rgba(30,41,59,0.5); border-radius:6px; padding:.3rem .4rem; border:1px solid rgba(71,85,105,0.2); }
.eq-type { font-size:.6rem; color:#60a5fa; font-weight:800; }
.eq-formula { font-size:.72rem; color:#e2e8f0; font-weight:700; font-family:monospace; }
.calc-row { display:flex; flex-wrap:wrap; gap:.3rem; margin:.3rem 0; }
.btn-calc { flex:1; min-width:80px; padding:.4rem .5rem; background:linear-gradient(135deg,#334155,#1e293b); border:1px solid rgba(71,85,105,0.4); border-radius:8px; color:#94a3b8; cursor:pointer; font-size:.68rem; font-weight:700; transition:all .18s; box-shadow:0 2px 4px rgba(0,0,0,.1); }
.btn-calc:hover { background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border-color:rgba(96,165,250,0.5); transform:translateY(-1px); box-shadow:0 4px 8px rgba(59,130,246,.2); }
.calc-result { background:rgba(15,23,42,0.6); border:1px solid rgba(71,85,105,0.3); border-radius:8px; padding:.5rem .6rem; margin:.3rem 0; font-size:.75rem; color:#e2e8f0; line-height:1.6; min-height:2.5rem; box-shadow:inset 0 2px 4px rgba(0,0,0,.1); }
</style>
