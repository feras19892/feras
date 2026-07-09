<script setup lang="ts">
const CONDITIONS = [
  { name: 'ΣFx = 0', desc: 'محصلة القوى الأفقية صفر', color: '#22c55e' },
  { name: 'ΣFy = 0', desc: 'محصلة القوى الرأسية صفر', color: '#5B8DB8' },
  { name: 'Στ = 0', desc: 'محصلة العزوم صفر', color: '#f59e0b' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 شروط الاتزان</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>الشرط</span>
        <span>الوصف</span>
      </div>
      <div v-for="ref in CONDITIONS" :key="ref.name" class="ref-row">
        <span :style="{ color: ref.color }">{{ ref.name }}</span>
        <span>{{ ref.desc }}</span>
      </div>
    </div>
    <div class="ref-note">
      💡 يجب تحقق الثلاثة شروط معاً للاتزان الكامل.
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
