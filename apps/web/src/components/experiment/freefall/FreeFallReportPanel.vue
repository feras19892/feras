<script setup lang="ts">
const props = defineProps<{ trials: any[]; trialStats: any; gTheoretical: number }>()
const emit = defineEmits<{ (e: 'printReport'): void; (e: 'openFullReport'): void }>()
</script>

<template>
  <div>
    <h5>📋 تقرير سريع</h5>
    <div v-if="trials.length" class="mini-report">
      <div>القراءات: {{ trials.length }}</div>
      <div>g المتوسط: {{ trialStats?.g_mean?.toFixed(2) ?? '--' }} m/s²</div>
      <div>g النظري: {{ gTheoretical }} m/s²</div>
    </div>
    <p v-else class="no-data">لا توجد بيانات</p>
    <div class="report-actions">
      <button @click="emit('printReport')">🖨️ طباعة</button>
      <button class="primary" @click="emit('openFullReport')">📋 تقرير كامل</button>
    </div>
  </div>
</template>

<style scoped>
h5 { margin: 0 0 .3rem; font-size: .82rem; color: #5B8DB8; }
.mini-report { font-size: .78rem; color: #D1D7E0; line-height: 1.6; }
.no-data { text-align: center; color: #64748b; font-size: .75rem; }
.report-actions { display: flex; gap: .3rem; margin-top: .3rem; }
.report-actions button { background: #252D3A; border: 1px solid #2D3645; color: #94a3b8; border-radius: 4px; padding: .2rem .5rem; font-size: .72rem; cursor: pointer; }
.report-actions button.primary { background: rgba(91,141,184,.15); border-color: #5B8DB8; color: #5B8DB8; }
</style>
