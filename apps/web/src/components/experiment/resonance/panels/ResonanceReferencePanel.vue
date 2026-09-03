<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
const HARMONICS = [

  { n: 1, name: t('experiments.resHarmonic1'), color: '#22c55e' },
  { n: 2, name: t('experiments.resHarmonic2'), color: '#3b82f6' },
  { n: 3, name: t('experiments.resHarmonic3'), color: '#f59e0b' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">{{ t('experiments.resRefTitle') }}</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>n</span>
        <span>{{ t('experiments.resRefHeaderName') }}</span>
      </div>
      <div v-for="ref in HARMONICS" :key="ref.n" class="ref-row">
        <span :style="{ color: ref.color }">{{ ref.n }}</span>
        <span>{{ ref.name }}</span>
      </div>
    </div>
    <div class="ref-note">
      {{ t('experiments.resRefNote') }}
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; }
.ref-title { font-size: .9rem; font-weight: 700; color: #5B8DB8; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-table { display: flex; flex-direction: column; gap: .25rem; }
.ref-header { display: flex; justify-content: space-between; padding: .4rem .6rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .8rem; color: #94a3b8; }
.ref-row { display: flex; justify-content: space-between; padding: .35rem .6rem; border-bottom: 1px solid #1e2530; font-size: .8rem; }
.ref-row:last-child { border-bottom: none; }
.ref-note { font-size: .75rem; color: #64748b; margin-top: .5rem; }
</style>