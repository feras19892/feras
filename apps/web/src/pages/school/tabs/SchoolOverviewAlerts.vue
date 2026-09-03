<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { StrugglingStudent, OutstandingStudent, SchoolFeedbackStats } from '@/services/school-reports.service'


defineProps<{
  capacityAlert: string
  struggling: StrugglingStudent[]
  outstanding: OutstandingStudent[]
  feedback: SchoolFeedbackStats | null
  goToTab: (tabId: string) => void
}>()
</script>

<template>
  <div class="alerts">
    <div v-if="capacityAlert" class="sh-alert">⚠️ {{ capacityAlert }}</div>

    <div v-if="feedback" class="sh-panel">
      <h3 class="sh-panel__title">💬 الشكاوى والملاحظات</h3>
      <div class="fb-row"><span>إجمالي الشكاوى</span><b>{{ feedback.total }}</b></div>
      <div class="fb-row"><span>غير المقروءة</span><b :class="{ 'text-warn': feedback.open > 0 }">{{ feedback.open }}</b></div>
      <div class="fb-row"><span>متوسط التقييم</span><b>{{ feedback.avg_rating.toFixed(1) }} / 5</b></div>
      <button class="sh-quick-btn" @click="goToTab('feedback')">عرض الشكاوى</button>
    </div>

    <div v-if="struggling.length" class="sh-panel">
      <h3 class="sh-panel__title">⚠️ طلاب يحتاجون دعماً</h3>
      <div class="at-risk-list">
        <div v-for="(s, i) in struggling" :key="`${s.name}-${i}`" class="at-risk-row">
          <span class="at-risk-name">{{ s.name }}</span>
          <span class="at-risk-grade">{{ Math.round(s.avg_grade) }}%</span>
          <span class="at-risk-bar"><span class="at-risk-bar-fill" :style="{ width: Math.round(s.avg_grade) + '%' }"></span></span>
        </div>
      </div>
    </div>

    <div v-if="outstanding.length" class="sh-panel">
      <h3 class="sh-panel__title">🌟 طلاب متميزون</h3>
      <div class="at-risk-list">
        <div v-for="(s, i) in outstanding" :key="`out-${s.name}-${i}`" class="at-risk-row">
          <span class="at-risk-name">{{ s.name }}</span>
          <span class="at-risk-grade">{{ Math.round(s.avg_grade) }}%</span>
          <span class="at-risk-bar"><span class="at-risk-bar-fill out" :style="{ width: Math.round(s.avg_grade) + '%' }"></span></span>
        </div>
      </div>
    </div>

    <div v-if="!capacityAlert && !feedback && !struggling.length && !outstanding.length" class="all-good">
      ✅ لا توجد تنبيهات حالية
    </div>
  </div>
</template>

<style scoped>
.alerts { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.sh-alert { grid-column: 1 / -1; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: var(--as-danger, #ef4444); }
.sh-panel { background: var(--as-surface); border: 1px solid var(--as-border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; overflow: hidden; }
.sh-panel__title { margin: 0 0 12px; font-size: 13px; font-weight: 700; color: var(--as-text); }
.fb-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 12px; border-bottom: 1px solid var(--as-border); }
.fb-row b { color: var(--as-text); }
.text-warn { color: var(--as-warning, #f59e0b); }
.sh-quick-btn { margin-top: 12px; padding: 10px; border: 1px solid var(--as-border); border-radius: 10px; background: var(--as-raised); color: var(--as-text); cursor: pointer; font-size: 12px; transition: background 0.2s; }
.sh-quick-btn:hover { background: var(--as-surface); }
.at-risk-list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
.at-risk-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.at-risk-name { flex: 1; min-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--as-text); }
.at-risk-grade { color: var(--as-danger, #ef4444); font-weight: 700; min-width: 36px; text-align: center; }
.at-risk-bar { flex: 1; height: 6px; border-radius: 3px; background: var(--as-raised); overflow: hidden; }
.at-risk-bar-fill { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--as-danger, #ef4444), var(--as-warning, #f59e0b)); }
.at-risk-bar-fill.out { background: linear-gradient(90deg, var(--as-success, #22c55e), var(--as-accent, #8b5cf6)); }
.all-good { grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--as-success, #34d399); background: var(--as-surface); border-radius: 14px; font-size: 14px; }
@media (max-width: 1000px) { .alerts { grid-template-columns: 1fr; } }
</style>
