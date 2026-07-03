<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
import type { CalorimetryTrial } from '../../../../composables/calorimetry/useCalorimetryTrials'
const { t } = useI18n()
defineProps<{ trials: CalorimetryTrial[] }>()
const emit = defineEmits<{ (e: 'remove', id: number): void; (e: 'clear'): void }>()
</script>
<template>
  <div class="trials-panel">
    <table v-if="trials.length">
      <thead><tr><th>#</th><th>mW</th><th>tW</th><th>mM</th><th>tM</th><th>Tf</th><th>c</th><th></th></tr></thead>
      <tbody>
        <tr v-for="trial in trials" :key="trial.id">
          <td>{{ trial.id }}</td>
          <td>{{ trial.mWater.toFixed(3) }}</td>
          <td>{{ trial.tWater }}</td>
          <td>{{ trial.mMetal.toFixed(3) }}</td>
          <td>{{ trial.tMetal }}</td>
          <td>{{ trial.tf.toFixed(1) }}</td>
          <td>{{ trial.cMetal.toFixed(0) }}</td>
          <td><button class="rm" @click="emit('remove', trial.id)">&#x2715;</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">{{ t('experiments.noTrials') }}</p>
    <button v-if="trials.length" class="clear-btn" @click="emit('clear')">{{ t('experiments.clearAll') }}</button>
  </div>
</template>
<style scoped>
.trials-panel { display:flex; flex-direction:column; gap:.5rem; }
table { width:100%; border-collapse:collapse; font-size:.7rem; }
th, td { padding:.2rem .3rem; text-align:center; border-bottom:1px solid #1e2530; }
th { color:#5B8DB8; font-weight:700; }
.rm { background:none; border:none; color:#8B95A5; cursor:pointer; font-size:.65rem; }
.rm:hover { color:#f87171; }
.empty { color:#64748b; font-size:.75rem; text-align:center; }
.clear-btn { padding:.25rem .5rem; border-radius:4px; border:1px solid #1e2530; background:#161B22; color:#8B95A5; font-size:.7rem; cursor:pointer; }
.clear-btn:hover { color:#f87171; border-color:rgba(248,113,113,.3); }
</style>
