<script setup lang="ts">
import type { CollisionTrial } from '../../../composables/collision/useCollisionTrials'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  trials: CollisionTrial[]
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="data-panel">
    <div v-if="!props.trials.length" class="empty">{{ t('experiments.noAttemptsRecorded') }}</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>m₁</th><th>m₂</th><th>v₁i</th><th>v₂i</th><th>e</th><th>v₁f</th><th>v₂f</th><th>Loss%</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="(t, i) in props.trials" :key="t.id">
            <td>{{ i + 1 }}</td>
            <td>{{ t.m1 }}</td>
            <td>{{ t.m2 }}</td>
            <td :class="t.v1i < 0 ? 'neg' : ''">{{ t.v1i }}</td>
            <td :class="t.v2i < 0 ? 'neg' : ''">{{ t.v2i }}</td>
            <td>{{ t.e }}</td>
            <td :class="t.v1f < 0 ? 'neg' : ''">{{ t.v1f }}</td>
            <td :class="t.v2f < 0 ? 'neg' : ''">{{ t.v2f }}</td>
            <td>{{ t.lossPercent }}%</td>
            <td><button class="del" @click="emit('remove', t.id)">×</button></td>
          </tr>
        </tbody>
      </table>
      <button class="clear-btn" @click="emit('clear')">{{ t('experiments.clearAll') }}</button>
    </div>
  </div>
</template>

<style scoped>
.data-panel { padding: .5rem; }
.empty { color: #94a3b8; text-align: center; font-size: .75rem; padding: 1rem; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: .68rem; }
th, td { border: 1px solid #2D3645; padding: .25rem .3rem; text-align: center; color: #D1D7E0; }
th { background: rgba(91,141,184,.1); color: #5B8DB8; }
td.neg { color: #ef4444; }
.del { background: none; border: none; color: #ef4444; cursor: pointer; font-size: .9rem; }
.clear-btn { margin-top: .4rem; padding: .25rem .5rem; font-size: .68rem; background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid #ef4444; border-radius: 4px; cursor: pointer; }
</style>
