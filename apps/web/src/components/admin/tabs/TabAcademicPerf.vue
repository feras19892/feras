<script setup lang="ts">
import type { AdminStats } from '../../../services/admin.service';
import type { DetailedStats } from '../dashboard/useAdminDashboard';
import DashboardPerformance from '../dashboard/DashboardPerformance.vue';
import DashboardRanking from '../dashboard/DashboardRanking.vue';

defineProps<{
  stats: AdminStats | null;
  detailed: DetailedStats | null;
  usersByRole: { admin: number; teacher: number; student: number };
  completionRate: number;
  gradingRate: number;
  activityRate: number;
  topSchools: { id: number; name: string; meta: string }[];
  topClasses: { id: string; name: string; meta: string }[];
}>();
</script>

<template>
  <div class="tab-content">
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-top"><span class="kpi-icon">👥</span><span class="kpi-trend up">↑ 12%</span></div>
        <div class="kpi-value">{{ stats?.users?.total ?? 0 }}</div>
        <div class="kpi-label">إجمالي المستخدمين</div>
        <div class="kpi-sub">{{ usersByRole.student }} ط • {{ usersByRole.teacher }} م • {{ usersByRole.admin }} أ</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><span class="kpi-icon">📚</span><span class="kpi-trend up">↑ 5%</span></div>
        <div class="kpi-value">{{ stats?.classes?.total ?? 0 }}</div>
        <div class="kpi-label">الفصول النشطة</div>
        <div class="kpi-sub">فصول دراسية</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><span class="kpi-icon">⚡</span><span class="kpi-trend down">↓ 3%</span></div>
        <div class="kpi-value">{{ detailed?.totals.sessions ?? 0 }}</div>
        <div class="kpi-label">إجمالي الجلسات</div>
        <div class="kpi-sub">جلسات نشطة</div>
      </div>
      <div class="kpi-card accent">
        <div class="kpi-top"><span class="kpi-icon">🎯</span><span class="kpi-trend up">↑ {{ completionRate }}%</span></div>
        <div class="kpi-value">{{ stats?.reports?.average ?? 0 }}%</div>
        <div class="kpi-label">نسبة الإنجاز</div>
        <div class="kpi-sub">معدل الدرجات</div>
      </div>
    </div>

    <div class="perf-row">
      <div class="perf-left">
        <DashboardPerformance v-if="detailed"
          :graded="detailed.totals.graded" :pending="detailed.totals.pending"
          :overdue="detailed.totals.overdue" :total="detailed.totals.reports"
        />
        <div v-else class="dual-card"><h3 class="card-title">📊 الأداء</h3><p class="empty-state">لا توجد بيانات</p></div>
      </div>
      <div class="perf-right">
        <DashboardRanking v-if="topSchools.length" title="🏫 أفضل المدارس" :items="topSchools" />
        <DashboardRanking v-if="topClasses.length" title="📚 أكثر الفصول نشاطاً" :items="topClasses" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-content { display: flex; flex-direction: column; gap: 1.2rem; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
.kpi-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem; min-height: 130px; }
.kpi-card.accent { border-color: rgba(34,211,238,0.15); }
.kpi-top { display: flex; align-items: center; justify-content: space-between; }
.kpi-icon { font-size: 1.2rem; }
.kpi-trend { font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px; }
.kpi-trend.up { color: #34d399; background: rgba(52,211,153,0.1); }
.kpi-trend.down { color: #f87171; background: rgba(248,113,113,0.1); }
.kpi-value { font-size: 1.8rem; font-weight: 800; color: #e2e8f0; line-height: 1; }
.kpi-card.accent .kpi-value { color: #67e8f9; }
.kpi-label { font-size: 0.82rem; font-weight: 700; color: #e2e8f0; }
.kpi-sub { font-size: 0.65rem; color: #475569; }
@media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
.perf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
.perf-left, .perf-right { display: flex; flex-direction: column; gap: 1rem; }
@media (max-width: 768px) { .perf-row { grid-template-columns: 1fr; } }
.dual-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1.2rem; }
.card-title { margin: 0 0 0.8rem; font-size: 0.88rem; font-weight: 700; color: #e2e8f0; }
.empty-state { text-align: center; color: #475569; padding: 1.5rem; font-size: 0.82rem; margin: 0; }
</style>
