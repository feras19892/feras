<script setup lang="ts">
const TEMPS = [
  { t: 0, v: 331, color: '#3b82f6' },
  { t: 20, v: 343, color: '#22c55e' },
  { t: 40, v: 355, color: '#ef4444' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 سرعة الصوت في الهواء</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>T (°C)</span>
        <span>v (m/s)</span>
      </div>
      <div v-for="ref in TEMPS" :key="ref.t" class="ref-row">
        <span>{{ ref.t }}</span>
        <span :style="{ color: ref.color }">{{ ref.v }}</span>
      </div>
    </div>
    <div class="ref-note">
      💡 v ≈ 331 + 0.6T. تزداد السرعة بارتفاع الحرارة.
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
