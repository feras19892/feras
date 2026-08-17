<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

interface PendulumTrial { id: number; length: number; g: number; T: number; f: number; omega: number; gCalc: number; err: number }
const trials = defineModel<PendulumTrial[]>({ required: true })
const { t } = useI18n()
const emit = defineEmits<{ (e: 'remove', id: number): void; (e: 'clear'): void }>()
const tableHeaders = ['#', 'L', 'T', 'f', 'ω', 'gcalc', t('experiments.error')]
</script>

<template>
  <div class="data-panel">
    <div class="lab-card">
      <div class="card-header"><h4>&#x1F4CB; {{ t('experiments.readings') }}</h4></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th v-for="h in tableHeaders" :key="h">{{ h }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(tr,i) in trials" :key="tr.id" :class="{latest:i===trials.length-1}">
              <td>{{ i+1 }}</td><td>{{ tr.length.toFixed(2) }}</td><td>{{ tr.T.toFixed(3) }}</td>
              <td>{{ tr.f.toFixed(2) }}</td><td>{{ tr.omega.toFixed(2) }}</td><td>{{ tr.gCalc.toFixed(2) }}</td><td>{{ tr.err.toFixed(2) }}%</td>
              <td><button class="btn-danger small" @click="emit('remove', tr.id)">&#xD7;</button></td>
            </tr>
            <tr v-if="!trials.length"><td colspan="8" class="empty-msg">{{ t('experiments.noMeasurements') }}</td></tr>
          </tbody>
        </table>
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
</style>
