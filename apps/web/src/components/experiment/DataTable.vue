<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
interface Trial {

  id: number;
  mass: number;
  k: number;
  amplitude: number;
  T: number;
  f: number;
  omega: number;
  kCalc: number;
}

const trials = defineModel<Trial[]>({ required: true });

defineEmits<{
  (e: 'remove', id: number): void;
  (e: 'clear'): void;
}>()
</script>

<template>
  <div class="lab-card">
    <div class="card-header"><h4>📋 {{ t('experiments.readings') }}</h4></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>m</th><th>k</th><th>A</th><th>T</th><th>f</th><th>ω</th><th>k<sub>calc</sub></th><th></th></tr></thead>
        <tbody>
          <tr v-for="(tr, i) in trials" :key="tr.id" :class="{ latest: i === trials.length - 1 }">
            <td>{{ i + 1 }}</td>
            <td>{{ tr.mass.toFixed(2) }}</td>
            <td>{{ tr.k.toFixed(0) }}</td>
            <td>{{ tr.amplitude.toFixed(3) }}</td>
            <td>{{ tr.T.toFixed(4) }}</td>
            <td>{{ tr.f.toFixed(2) }}</td>
            <td>{{ tr.omega.toFixed(2) }}</td>
            <td>{{ tr.kCalc.toFixed(2) }}</td>
            <td><button class="btn-danger small" @click="$emit('remove', tr.id)">×</button></td>
          </tr>
          <tr v-if="!trials.length"><td colspan="9" class="empty-msg">{{ t('experiments.noMeasurements') }}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
th, td { padding: 0.3rem 0.35rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
th { color: #94a3b8; }
.latest { background: rgba(6,182,212,0.08); }
.empty-msg { color: #64748b; text-align: center; padding: 1rem; }
.btn-danger { background: #ef4444; color: #fff; border: none; border-radius: 0.25rem; cursor: pointer; }
.btn-danger.small { padding: 0.1rem 0.35rem; font-size: 0.7rem; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.card-header h4 { margin: 0; font-size: 0.85rem; color: #67e8f9; }
</style>