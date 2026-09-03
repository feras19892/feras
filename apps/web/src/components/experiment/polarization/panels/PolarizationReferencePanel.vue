<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
const ANGLES = [
  { theta: 0, transmission: 100, color: '#22c55e' },
  { theta: 45, transmission: 50, color: '#f59e0b' },
  { theta: 90, transmission: 0, color: '#ef4444' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 نسب الترشيح</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>Δθ</span>
        <span>I/I₀ (%)</span>
      </div>
      <div v-for="ref in ANGLES" :key="ref.theta" class="ref-row">
        <span>{{ ref.theta }}°</span>
        <span :style="{ color: ref.color }">{{ ref.transmission }}%</span>
      </div>
    </div>
    <div class="ref-note">
      💡 عند Δθ = 90°: الاستقطاب متعامد → I = 0.
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