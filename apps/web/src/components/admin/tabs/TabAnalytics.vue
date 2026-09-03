<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { DetailedStats } from '../dashboard/useAdminDashboard';
import { safeDivide, roleLabel, roleColor, statusLabel, statusColor } from '../dashboard/useAdminDashboard';


defineProps<{
  detailed: DetailedStats | null;
  completionRate: number;
  gradingRate: number;
  activityRate: number;
  maxHourly: number;
  maxDaily: number;
}>();
</script>

<template>
  <div class="tab-content">
    <div v-if="detailed" class="analytics-section">
      <h2 class="section-title">📊 التحليلات والرسوم البيانية</h2>
      <div class="analytics-grid">
        <div class="modern-card">
          <h3>المستخدمين حسب الدور</h3>
          <div class="chart-simple">
            <div v-for="r in detailed.users_by_role" :key="r.role" class="chart-bar">
              <div class="chart-label">{{ roleLabel(r.role) }}</div>
              <div class="chart-track">
                <div class="chart-fill" :style="{ width: safeDivide(r.count, detailed.totals.users) + '%', background: roleColor(r.role) }"></div>
              </div>
              <div class="chart-value">{{ r.count }}</div>
            </div>
          </div>
        </div>
        <div class="modern-card">
          <h3>التقارير حسب الحالة</h3>
          <div class="chart-simple">
            <div v-for="s in detailed.reports_by_status" :key="s.status" class="chart-bar">
              <div class="chart-label">{{ statusLabel(s.status) }}</div>
              <div class="chart-track">
                <div class="chart-fill" :style="{ width: safeDivide(s.count, detailed.totals.reports) + '%', background: statusColor(s.status) }"></div>
              </div>
              <div class="chart-value">{{ s.count }}</div>
            </div>
          </div>
        </div>
        <div class="modern-card">
          <h3>النشاط بالساعة (اليوم)</h3>
          <div class="chart-bars">
            <div v-for="h in detailed.hourly_activity" :key="h.hour" class="bar-item">
              <div class="bar-fill" :style="{ height: safeDivide(h.count, maxHourly) + '%' }"></div>
              <div class="bar-label">{{ h.hour }}</div>
            </div>
          </div>
        </div>
        <div class="modern-card">
          <h3>النشاط اليومي (آخر 7 أيام)</h3>
          <div class="chart-bars">
            <div v-for="d in detailed.daily_activity.slice(0, 7).reverse()" :key="d.date" class="bar-item">
              <div class="bar-fill" :style="{ height: safeDivide(d.count, maxDaily) + '%' }"></div>
              <div class="bar-label">{{ d.date.slice(5) }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">✅</div>
          <div class="metric-label">معدل الإنجاز</div>
          <div class="metric-value">{{ completionRate }}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">📝</div>
          <div class="metric-label">معدل التصحيح</div>
          <div class="metric-value">{{ gradingRate }}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">🎯</div>
          <div class="metric-label">متوسط الدرجات</div>
          <div class="metric-value">{{ detailed.totals.avg_grade }}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">⚡</div>
          <div class="metric-label">معدل النشاط</div>
          <div class="metric-value">{{ activityRate }}%</div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">📉</div>
      <h3>لا توجد بيانات تحليلية</h3>
      <p>لم يتم تحميل البيانات الإحصائية</p>
    </div>
  </div>
</template>

<style scoped>
.section-title { font-size: 1.3rem; font-weight: 800; color: #e2e8f0; margin-bottom: 1.2rem; }
.analytics-section { margin: 2rem 0; }
.analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.2rem; margin-bottom: 1.5rem; }
.modern-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; }
.modern-card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; color: #e2e8f0; }
.chart-simple { display: flex; flex-direction: column; gap: 1rem; }
.chart-bar { display: flex; align-items: center; gap: 1rem; }
.chart-label { width: 70px; font-size: 0.8rem; color: #94a3b8; }
.chart-track { flex: 1; height: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; }
.chart-fill { height: 100%; border-radius: 6px; transition: width 0.5s; }
.chart-value { width: 50px; text-align: end; font-weight: 700; color: #e2e8f0; font-size: 0.9rem; }
.chart-bars { display: flex; align-items: flex-end; gap: 0.5rem; height: 150px; padding: 1rem 0; }
.bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.bar-fill { width: 100%; background: linear-gradient(180deg, #67e8f9, #3b82f6); border-radius: 4px 4px 0 0; transition: height 0.5s; min-height: 2px; }
.bar-label { font-size: 0.7rem; color: #64748b; }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.metric-card { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.2); border-radius: 0.75rem; padding: 1.5rem; text-align: center; }
.metric-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
.metric-label { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem; }
.metric-value { font-size: 2rem; font-weight: 800; color: #67e8f9; }
.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-icon { font-size: 4rem; margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.5rem; color: #e2e8f0; margin-bottom: 0.5rem; }
.empty-state p { color: #94a3b8; font-size: 0.95rem; }
</style>
