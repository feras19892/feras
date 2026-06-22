<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

interface Trial {
  id: number; mass: number; k: number; amplitude: number; T: number; f: number; omega: number; kCalc: number; err: number;
}

const trials = defineModel<Trial[]>({ required: true })

const { t } = useI18n()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()

const tableHeaders = ['#', 'm', 'k', 'A', 'T', 'f', 'ω', 'kcalc', t('experiments.error')]
</script>

<template>
  <div class="data-panel">
    <!-- Table -->
    <div class="lab-card">
      <div class="card-header"><h4>&#x1F4CB; {{ t('experiments.readings') }}</h4></div>
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
            <tr v-if="!trials.length"><td colspan="10" class="empty-msg">{{ t('experiments.noMeasurements') }}</td></tr>
          </tbody>
        </table>
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
