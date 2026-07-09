<script setup lang="ts">
const REFERENCES = [
  { location: 'أعلى الجبل', g: 9.78, color: '#22c55e' },
  { location: 'سطح البحر', g: 9.81, color: '#5B8DB8' },
  { location: 'القطب', g: 9.83, color: '#f59e0b' },
  { location: 'القمر', g: 1.62, color: '#8b5cf6' },
  { location: 'المريخ', g: 3.72, color: '#ef4444' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 مرجع قيم g</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>الموقع</span>
        <span>g (m/s²)</span>
      </div>
      <div v-for="ref in REFERENCES" :key="ref.location" class="ref-row">
        <span :style="{ color: ref.color }">{{ ref.location }}</span>
        <span>{{ ref.g.toFixed(2) }}</span>
      </div>
    </div>
    <div class="ref-note">
      💡 قيمة g = 9.81 m/s² هي القيمة القياسية على سطح البحر عند خط الاستواء.
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
