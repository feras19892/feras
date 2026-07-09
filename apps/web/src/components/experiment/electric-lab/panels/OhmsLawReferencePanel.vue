<script setup lang="ts">
const RELATIONS = [
  { relation: 'V ∝ I', desc: 'عند ثبوت R، الجهد يتناسب طردياً مع التيار', color: '#fbbf24' },
  { relation: 'I ∝ 1/R', desc: 'عند ثبوت V، التيار يتناسب عكسياً مع المقاومة', color: '#67e8f9' },
  { relation: 'V ∝ R', desc: 'عند ثبوت I، الجهد يتناسب طردياً مع المقاومة', color: '#4ade80' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 علاقات قانون أوم</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>العلاقة</span>
        <span>الشرح</span>
      </div>
      <div v-for="ref in RELATIONS" :key="ref.relation" class="ref-row">
        <span :style="{ color: ref.color, fontFamily: 'Courier New, monospace', fontWeight: 700 }">{{ ref.relation }}</span>
        <span>{{ ref.desc }}</span>
      </div>
    </div>
    <div class="ref-note">
      💡 ميل خط V vs I يساوي المقاومة R. كلما زاد الميل، زادت المقاومة.
    </div>
    <div class="ref-note">
      ⚡ R² ≈ 1 يعني أن العلاقة خطية مثالية — قانون أوم محقق.
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; }
.ref-title { font-size: .9rem; font-weight: 700; color: #f59e0b; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-table { display: flex; flex-direction: column; gap: .25rem; }
.ref-header { display: flex; justify-content: space-between; padding: .4rem .6rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .8rem; color: #94a3b8; }
.ref-row { display: flex; justify-content: space-between; padding: .35rem .6rem; border-bottom: 1px solid #1e2530; font-size: .78rem; gap: .5rem; }
.ref-row:last-child { border-bottom: none; }
.ref-note { font-size: .75rem; color: #64748b; margin-top: .5rem; }
</style>
