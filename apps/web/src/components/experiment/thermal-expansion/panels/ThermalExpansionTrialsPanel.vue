<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
import type { ThermalExpansionTrial } from '../../../../composables/thermal-expansion/useThermalExpansionTrials'
const { t } = useI18n()
defineProps<{ trials: ThermalExpansionTrial[] }>()
const matNames: Record<string, string> = {
  copper: 'نحاس', aluminum: 'ألمنيوم', iron: 'حديد', steel: 'فولاذ', brass: 'سبائك نحاس', glass: 'زجاج',
}
const emit = defineEmits<{ (e: 'remove', id: number): void; (e: 'clear'): void }>()
</script>
<template>
  <div class="trials-panel">
    <table v-if="trials.length">
      <thead><tr><th>#</th><th>المادة</th><th>L₀</th><th>t₀</th><th>t₁</th><th>ΔL</th><th>α</th><th></th></tr></thead>
      <tbody>
        <tr v-for="trial in trials" :key="trial.id">
          <td>{{ trial.id }}</td>
          <td>{{ matNames[trial.material] || trial.material }}</td>
          <td>{{ trial.L0.toFixed(2) }}</td>
          <td>{{ trial.t0 }}</td>
          <td>{{ trial.t1 }}</td>
          <td>{{ (trial.deltaL * 1000).toFixed(2) }}mm</td>
          <td>{{ trial.alpha.toFixed(1) }}</td>
          <td><button class="rm" @click="emit('remove', trial.id)">&#x2715;</button></td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty">
      <div class="empty-icon">📝</div>
      <div class="empty-title">لا توجد تجارب</div>
      <div class="empty-hint">اضغط Start → Record بعد كل تشغيل</div>
    </div>
    <button v-if="trials.length" class="clear-btn" @click="emit('clear')">{{ t('experiments.clearAll') }}</button>
  </div>
</template>
<style scoped>
.trials-panel { display:flex; flex-direction:column; gap:.5rem; padding:.3rem; }
table { width:100%; border-collapse:collapse; font-size:.68rem; }
th, td { padding:.25rem .3rem; text-align:center; border-bottom:1px solid #1e2530; }
th { color:#5B8DB8; font-weight:700; }
.rm { background:none; border:none; color:#8B95A5; cursor:pointer; font-size:.65rem; }
.rm:hover { color:#f87171; }
.empty { text-align:center; padding:1rem .5rem; display:flex; flex-direction:column; align-items:center; gap:.3rem; }
.empty-icon { font-size:1.4rem; opacity:.5; }
.empty-title { color:#8B95A5; font-size:.78rem; font-weight:600; }
.empty-hint { color:#475569; font-size:.68rem; max-width:180px; line-height:1.4; }
.clear-btn { padding:.25rem .5rem; border-radius:4px; border:1px solid #1e2530; background:#161B22; color:#8B95A5; font-size:.7rem; cursor:pointer; }
.clear-btn:hover { color:#f87171; border-color:rgba(248,113,113,.3); }
</style>
