<script setup lang="ts">
const MATERIALS = [
  { name: 'ثلج على ثلج', mu: 0.03, color: '#22c55e' },
  { name: 'خشب على خشب', mu: 0.4, color: '#5B8DB8' },
  { name: 'معدن على معدن', mu: 0.2, color: '#f59e0b' },
  { name: 'مطاط على أسفلت', mu: 0.9, color: '#ef4444' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 معاملات الاحتكاك μ</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>المواد</span>
        <span>μ</span>
      </div>
      <div v-for="ref in MATERIALS" :key="ref.name" class="ref-row">
        <span :style="{ color: ref.color }">{{ ref.name }}</span>
        <span>{{ ref.mu }}</span>
      </div>
    </div>
    <div class="ref-note">
      💡 μ = 0 يعني سطح مثالي بدون احتكاك.
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
