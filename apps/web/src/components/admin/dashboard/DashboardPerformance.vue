<script setup lang="ts">
interface Props {
  graded: number;
  pending: number;
  overdue: number;
  total: number;
}
defineProps<Props>();
</script>

<template>
  <div class="card">
    <div class="card-head">📊 الأداء</div>
    <div class="perf-grid">
      <div class="perf-item">
        <div class="perf-val">{{ graded }}</div>
        <div class="perf-lab">مصحح</div>
      </div>
      <div class="perf-item warn">
        <div class="perf-val">{{ pending }}</div>
        <div class="perf-lab">معلق</div>
      </div>
      <div class="perf-item danger">
        <div class="perf-val">{{ overdue }}</div>
        <div class="perf-lab">متأخر</div>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: (total > 0 ? graded / total * 100 : 0) + '%' }"></div>
    </div>
    <div class="progress-txt">معدل الإنجاز: {{ total > 0 ? Math.round(graded / total * 100) : 0 }}%</div>
  </div>
</template>

<style scoped>
.card { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.6rem; padding: 1rem; }
.card-head { font-size: 0.9rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.8rem; padding-bottom: 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
.perf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; margin-bottom: 0.8rem; }
.perf-item { text-align: center; padding: 0.8rem; background: rgba(255,255,255,0.02); border-radius: 0.4rem; }
.perf-item.warn { background: rgba(251,191,36,0.08); }
.perf-item.danger { background: rgba(239,68,68,0.08); }
.perf-val { font-size: 1.6rem; font-weight: 800; color: #67e8f9; }
.perf-item.warn .perf-val { color: #fbbf24; }
.perf-item.danger .perf-val { color: #f87171; }
.perf-lab { font-size: 0.7rem; color: #94a3b8; margin-top: 0.2rem; }
.progress-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 0.5rem; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #34d399, #67e8f9); border-radius: 3px; transition: width 0.5s; }
.progress-txt { font-size: 0.75rem; color: #94a3b8; text-align: center; }
</style>
