<script setup lang="ts">
const ANGLES = [
  { angle: 15, sin2: Math.sin(30 * Math.PI / 180).toFixed(3), color: '#22c55e' },
  { angle: 30, sin2: Math.sin(60 * Math.PI / 180).toFixed(3), color: '#5B8DB8' },
  { angle: 45, sin2: Math.sin(90 * Math.PI / 180).toFixed(3), color: '#f59e0b' },
  { angle: 60, sin2: Math.sin(120 * Math.PI / 180).toFixed(3), color: '#8b5cf6' },
  { angle: 75, sin2: Math.sin(150 * Math.PI / 180).toFixed(3), color: '#ef4444' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 مرجع زوايا الإطلاق</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>الزاوية θ</span>
        <span>sin(2θ)</span>
      </div>
      <div v-for="ref in ANGLES" :key="ref.angle" class="ref-row">
        <span :style="{ color: ref.color }">{{ ref.angle }}°</span>
        <span>{{ ref.sin2 }}</span>
      </div>
    </div>
    <div class="ref-note">
      💡 أقصى مدى عند θ = 45° حيث sin(2θ) = 1.
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
