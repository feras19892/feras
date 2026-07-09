<script setup lang="ts">
const MODES = [
  { name: 'شق واحد', formula: 'w = 2λD/a', color: '#22c55e' },
  { name: 'محبز', formula: 'd·sinθ = mλ', color: '#5B8DB8' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 معادلات الحيود</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>النوع</span>
        <span>المعادلة</span>
      </div>
      <div v-for="ref in MODES" :key="ref.name" class="ref-row">
        <span :style="{ color: ref.color }">{{ ref.name }}</span>
        <span>{{ ref.formula }}</span>
      </div>
    </div>
    <div class="ref-note">
      💡 للشق الواحد: عرض القمة ∝ 1/a. للمحبز: θ ∝ λ/d.
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
