<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
const CONDITIONS = [
  { name: 'بناءي', condition: 'Δr = mλ', color: '#22c55e' },
  { name: 'هدام', condition: 'Δr = (m+½)λ', color: '#ef4444' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 شروط التداخل</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>النوع</span>
        <span>الشرط</span>
      </div>
      <div v-for="ref in CONDITIONS" :key="ref.name" class="ref-row">
        <span :style="{ color: ref.color }">{{ ref.name }}</span>
        <span>{{ ref.condition }}</span>
      </div>
    </div>
    <div class="ref-note">
      💡 Δr = فرق المسار بين الموجتين. m = 0, ±1, ±2, ...
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