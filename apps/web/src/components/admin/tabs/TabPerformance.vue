<script setup lang="ts">
import type { DetailedStats } from '../dashboard/useAdminDashboard';
import DashboardPerformance from '../dashboard/DashboardPerformance.vue';
import DashboardRanking from '../dashboard/DashboardRanking.vue';

defineProps<{
  detailed: DetailedStats | null;
  completionRate: number;
  gradingRate: number;
  activityRate: number;
  topSchools: { id: number; name: string; meta: string }[];
  topClasses: { id: string; name: string; meta: string }[];
}>();
</script>

<template>
  <div class="tab-content">
    <h2 class="section-title">📈 الأداء والإنجاز</h2>

    <div class="metrics-grid" v-if="detailed">
      <div class="metric-card">
        <div class="metric-icon">✅</div>
        <div class="metric-label">معدل الإنجاز</div>
        <div class="metric-value">{{ completionRate }}%</div>
        <div class="metric-bar"><div class="metric-bar-fill success" :style="{ width: completionRate + '%' }"></div></div>
      </div>
      <div class="metric-card">
        <div class="metric-icon">📝</div>
        <div class="metric-label">معدل التصحيح</div>
        <div class="metric-value">{{ gradingRate }}%</div>
        <div class="metric-bar"><div class="metric-bar-fill warn" :style="{ width: gradingRate + '%' }"></div></div>
      </div>
      <div class="metric-card">
        <div class="metric-icon">⚡</div>
        <div class="metric-label">معدل النشاط</div>
        <div class="metric-value">{{ activityRate }}%</div>
        <div class="metric-bar"><div class="metric-bar-fill info" :style="{ width: activityRate + '%' }"></div></div>
      </div>
      <div class="metric-card">
        <div class="metric-icon">🎯</div>
        <div class="metric-label">متوسط الدرجات</div>
        <div class="metric-value">{{ detailed.totals.avg_grade }}%</div>
        <div class="metric-bar"><div class="metric-bar-fill accent" :style="{ width: detailed.totals.avg_grade + '%' }"></div></div>
      </div>
    </div>

    <div class="content-grid" v-if="detailed">
      <DashboardPerformance
        :graded="detailed.totals.graded" :pending="detailed.totals.pending"
        :overdue="detailed.totals.overdue" :total="detailed.totals.reports"
      />
      <div class="modern-card">
        <h3>📋 تفاصيل التقارير</h3>
        <div class="perf-details">
          <div class="perf-detail-row"><span class="perf-detail-label">إجمالي التقارير</span><span class="perf-detail-value">{{ detailed.totals.reports }}</span></div>
          <div class="perf-detail-row"><span class="perf-detail-label">مصححة</span><span class="perf-detail-value success">{{ detailed.totals.graded }}</span></div>
          <div class="perf-detail-row"><span class="perf-detail-label">معلقة</span><span class="perf-detail-value warn">{{ detailed.totals.pending }}</span></div>
          <div class="perf-detail-row"><span class="perf-detail-label">متأخرة</span><span class="perf-detail-value danger">{{ detailed.totals.overdue }}</span></div>
          <div class="perf-detail-row"><span class="perf-detail-label">المدارس</span><span class="perf-detail-value">{{ detailed.totals.schools }}</span></div>
          <div class="perf-detail-row"><span class="perf-detail-label">دخول اليوم</span><span class="perf-detail-value success">{{ detailed.totals.today_logins }}</span></div>
          <div class="perf-detail-row"><span class="perf-detail-label">مستخدمين نشطين</span><span class="perf-detail-value success">{{ detailed.totals.active_users }}</span></div>
          <div class="perf-detail-row"><span class="perf-detail-label">جلسات نشطة الآن</span><span class="perf-detail-value">{{ detailed.totals.active_now }}</span></div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <DashboardRanking v-if="topSchools.length" title="🏫 أفضل المدارس" :items="topSchools" />
      <DashboardRanking v-if="topClasses.length" title="📚 أكثر الفصول نشاطاً" :items="topClasses" />
    </div>
  </div>
</template>

<style scoped>
.section-title { font-size: 1.3rem; font-weight: 800; color: #e2e8f0; margin-bottom: 1.2rem; }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.metric-card { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.2); border-radius: 0.75rem; padding: 1.5rem; text-align: center; }
.metric-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
.metric-label { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem; }
.metric-value { font-size: 2rem; font-weight: 800; color: #67e8f9; }
.metric-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-top: 0.75rem; }
.metric-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
.metric-bar-fill.success { background: linear-gradient(90deg, #34d399, #10b981); }
.metric-bar-fill.warn { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
.metric-bar-fill.info { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
.metric-bar-fill.accent { background: linear-gradient(90deg, #67e8f9, #22d3ee); }
.content-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.2rem; margin-bottom: 1.5rem; }
.modern-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; }
.modern-card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; color: #e2e8f0; }
.perf-details { display: flex; flex-direction: column; gap: 0.6rem; }
.perf-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem; background: rgba(255,255,255,0.02); border-radius: 0.4rem; }
.perf-detail-label { font-size: 0.85rem; color: #94a3b8; }
.perf-detail-value { font-size: 1rem; font-weight: 700; color: #e2e8f0; }
.perf-detail-value.success { color: #34d399; }
.perf-detail-value.warn { color: #fbbf24; }
.perf-detail-value.danger { color: #f87171; }
</style>
