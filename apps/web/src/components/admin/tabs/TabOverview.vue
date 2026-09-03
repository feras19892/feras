<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { AdminStats } from '../../../services/admin.service';
import type { DetailedStats, SystemHealth } from '../dashboard/useAdminDashboard';
import { formatTime } from '../dashboard/useAdminDashboard';
import DashboardPerformance from '../dashboard/DashboardPerformance.vue';
import DashboardRanking from '../dashboard/DashboardRanking.vue';


defineProps<{
  stats: AdminStats | null;
  health: SystemHealth;
  detailed: DetailedStats | null;
  usersByRole: { admin: number; teacher: number; student: number };
  systemStatus: { ok: boolean; label: string; cls: string };
  recentActivityList: { actor_name: string; actor_role?: string; action: string; created_at?: string; details?: string }[];
  healthTables: [string, number][];
  topSchools: { id: number; name: string; meta: string }[];
  topClasses: { id: string; name: string; meta: string }[];
}>();

const emit = defineEmits<{ (e: 'navigate', section: string): void }>();

const actionLabels: Record<string, string> = {
  login: 'تسجيل دخول',
  logout: 'تسجيل خروج',
  create_report: 'إنشاء تقرير',
  create_class: 'إنشاء فصل',
  join_class: 'انضمام لفصل',
  grade_report: 'تصحيح تقرير',
  signup: 'تسجيل جديد',
  impersonate: 'تسجيل دخول كـ',
  impersonate_return: 'عودة من انتحال',
};

function actionLabel(action: string): string {
  return actionLabels[action] || action;
}
</script>

<template>
  <div class="tab-content">

    <!-- ═══ Container 1: KPI Overview — 4 دوائر متساوية ═══ -->
    <div class="kpi-container">
      <div class="kpi-circle" @click="emit('navigate', 'users')">
        <div class="kpi-ring"><div class="kpi-num">{{ stats?.users?.total ?? 0 }}</div></div>
        <div class="kpi-bottom"><span class="kpi-icon">👥</span><span class="kpi-label">المستخدمين</span></div>
        <div class="kpi-sub">{{ usersByRole.student }} ط • {{ usersByRole.teacher }} م • {{ usersByRole.admin }} أ</div>
      </div>
      <div class="kpi-circle" @click="emit('navigate', 'classes')">
        <div class="kpi-ring"><div class="kpi-num">{{ stats?.classes?.total ?? 0 }}</div></div>
        <div class="kpi-bottom"><span class="kpi-icon">📚</span><span class="kpi-label">الفصول</span></div>
        <div class="kpi-sub">فصول دراسية</div>
      </div>
      <div class="kpi-circle" @click="emit('navigate', 'reports')">
        <div class="kpi-ring"><div class="kpi-num">{{ detailed?.totals.active_now ?? health.counts.sessions ?? 0 }}</div></div>
        <div class="kpi-bottom"><span class="kpi-icon">⚡</span><span class="kpi-label">النشطون</span></div>
        <div class="kpi-sub">{{ detailed?.totals.today_logins ?? 0 }} دخول اليوم</div>
      </div>
      <div class="kpi-circle accent">
        <div class="kpi-ring"><div class="kpi-num">{{ stats?.reports?.average ?? 0 }}%</div></div>
        <div class="kpi-bottom"><span class="kpi-icon">🎯</span><span class="kpi-label">الإنجاز</span></div>
        <div class="kpi-sub">معدل الدرجات</div>
      </div>
    </div>

    <!-- ═══ Container 2: Daily Activity — شريط موحد ═══ -->
    <div class="activity-bar">
      <div class="ab-item"><span class="ab-icon">📊</span><span class="ab-num">{{ detailed?.totals.today_logins ?? health.today.logins }}</span><span class="ab-label">دخول</span></div>
      <div class="ab-sep"></div>
      <div class="ab-item"><span class="ab-icon">✨</span><span class="ab-num">{{ health.today.signups }}</span><span class="ab-label">جديد</span></div>
      <div class="ab-sep"></div>
      <div class="ab-item"><span class="ab-icon">📝</span><span class="ab-num">{{ health.today.reports }}</span><span class="ab-label">تقارير</span></div>
      <div class="ab-sep"></div>
      <div class="ab-item" v-if="detailed"><span class="ab-icon">⚡</span><span class="ab-num">{{ detailed.totals.active_now }}</span><span class="ab-label">نشط</span></div>
      <div class="ab-sep" v-if="detailed"></div>
      <div class="ab-item" v-if="detailed"><span class="ab-icon">👥</span><span class="ab-num">{{ detailed.totals.active_users }}</span><span class="ab-label">مستخدم نشط</span></div>
      <div class="ab-sep" v-if="detailed"></div>
      <div class="ab-item status" :class="systemStatus.cls"><span class="ab-icon">🩺</span><span class="ab-label">{{ systemStatus.label }}</span></div>
    </div>

    <!-- ═══ Container 3: Performance & Reports — صف متوازن ═══ -->
    <div class="perf-row">
      <div class="perf-left">
        <DashboardPerformance v-if="detailed"
          :graded="detailed.totals.graded" :pending="detailed.totals.pending"
          :overdue="detailed.totals.overdue" :total="detailed.totals.reports"
        />
        <div v-else class="modern-card"><h3>📊 الأداء</h3><p class="empty-inline">لا توجد بيانات</p></div>
      </div>
      <div class="perf-right">
        <DashboardRanking v-if="topSchools.length" title="🏫 أفضل المدارس" :items="topSchools" />
        <DashboardRanking v-if="topClasses.length" title="📚 أكثر الفصول نشاطاً" :items="topClasses" />
      </div>
    </div>

    <!-- ═══ Container 4: System Health — حاوية مدمجة ═══ -->
    <div class="health-container">
      <h3 class="container-title">🩺 صحة النظام</h3>
      <div class="health-grid">
        <div class="health-item"><span class="health-label">المستخدمين</span><span class="health-value">{{ health.counts.users }}</span></div>
        <div class="health-item"><span class="health-label">الفصول</span><span class="health-value">{{ health.counts.classes }}</span></div>
        <div class="health-item"><span class="health-label">التقارير</span><span class="health-value">{{ health.counts.reports }}</span></div>
        <div class="health-item"><span class="health-label">جلسات نشطة</span><span class="health-value success">{{ health.counts.sessions }}</span></div>
        <div class="health-item" v-if="detailed"><span class="health-label">مستخدمين نشطين</span><span class="health-value success">{{ detailed.totals.active_users }}</span></div>
        <div class="health-item"><span class="health-label">الملاحظات</span><span class="health-value">{{ health.counts.feedback }}</span></div>
        <div class="health-item"><span class="health-label">سجل النشاط</span><span class="health-value">{{ health.counts.activity }}</span></div>
        <div class="health-item"><span class="health-label">حجم القاعدة</span><span class="health-value">{{ Math.round(health.dbSize / 1024) }} KB</span></div>
        <div class="health-item" v-if="detailed"><span class="health-label">نشط الآن</span><span class="health-value success">{{ detailed.totals.active_now }}</span></div>
      </div>
    </div>

    <!-- ═══ Container 5: Monitoring — نشاط + جداول ═══ -->
    <div class="monitor-row" v-if="recentActivityList.length || healthTables.length">
      <div class="monitor-left" v-if="recentActivityList.length">
        <h3 class="container-title">🕐 آخر النشاطات</h3>
        <div class="activity-list">
          <div v-for="(act, i) in recentActivityList" :key="i" class="activity-item">
            <div class="activity-dot" :class="act.action"></div>
            <div class="activity-info">
              <div class="activity-name">{{ act.actor_name }} <span v-if="act.actor_role" class="activity-role">{{ act.actor_role }}</span></div>
              <div class="activity-action">{{ actionLabel(act.action) }}<span v-if="act.details" class="activity-details"> — {{ act.details }}</span></div>
            </div>
            <div class="activity-time">{{ formatTime(act.created_at) }}</div>
          </div>
        </div>
      </div>
      <div class="monitor-right" v-if="healthTables.length">
        <h3 class="container-title">🗄️ جداول قاعدة البيانات</h3>
        <table class="db-table">
          <thead>
            <tr><th>الجدول</th><th>السجلات</th></tr>
          </thead>
          <tbody>
            <tr v-for="[name, count] in healthTables" :key="name">
              <td class="db-name">{{ name }}</td>
              <td class="db-count">{{ count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
.tab-content { display: flex; flex-direction: column; gap: 1.2rem; }

/* ═══ Container 1: KPI Circles — 4 متساوية ═══ */
.kpi-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
.kpi-circle { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; cursor: pointer; transition: opacity 0.12s; }
.kpi-circle:hover { opacity: 0.8; }
.kpi-ring {
  width: 80px; height: 80px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: #0f172a; border: 2px solid rgba(99,102,241,0.2);
  transition: border-color 0.15s;
}
.kpi-circle:hover .kpi-ring { border-color: rgba(99,102,241,0.4); }
.kpi-circle.accent .kpi-ring { border-color: rgba(34,211,238,0.25); }
.kpi-circle.accent:hover .kpi-ring { border-color: rgba(34,211,238,0.5); }
.kpi-num { font-size: 1.4rem; font-weight: 800; color: #e2e8f0; line-height: 1; }
.kpi-circle.accent .kpi-num { color: #67e8f9; }
.kpi-bottom { display: flex; align-items: center; gap: 0.3rem; }
.kpi-icon { font-size: 0.85rem; }
.kpi-label { font-size: 0.78rem; font-weight: 700; color: #e2e8f0; }
.kpi-sub { font-size: 0.62rem; color: #475569; }
@media (max-width: 768px) { .kpi-container { grid-template-columns: repeat(2, 1fr); } }

/* ═══ Container 2: Activity Bar — شريط موحد ═══ */
.activity-bar {
  display: flex; align-items: center; gap: 0; padding: 0.8rem 1.2rem;
  background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;
}
.ab-item { display: flex; align-items: center; gap: 0.4rem; padding: 0 0.8rem; }
.ab-icon { font-size: 1rem; }
.ab-num { font-size: 1rem; font-weight: 800; color: #e2e8f0; }
.ab-label { font-size: 0.75rem; color: #64748b; font-weight: 600; }
.ab-item.status.success .ab-label { color: #34d399; }
.ab-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.06); }
@media (max-width: 768px) {
  .activity-bar { flex-wrap: wrap; gap: 0.5rem; padding: 0.6rem; }
  .ab-sep { display: none; }
}

/* ═══ Container 3: Performance Row ═══ */
.perf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
.perf-left, .perf-right { display: flex; flex-direction: column; gap: 1rem; }
@media (max-width: 768px) { .perf-row { grid-template-columns: 1fr; } }

/* ═══ Container 4: Health — حاوية مدمجة ═══ */
.health-container {
  background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1.2rem;
}
.container-title { margin: 0 0 0.8rem; font-size: 0.88rem; font-weight: 700; color: #e2e8f0; }
.health-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.health-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.7rem; background: rgba(255,255,255,0.02); border-radius: 4px; border: 1px solid rgba(255,255,255,0.03); }
.health-label { font-size: 0.75rem; color: #94a3b8; }
.health-value { font-size: 0.85rem; font-weight: 700; color: #e2e8f0; }
.health-value.success { color: #34d399; }
@media (max-width: 768px) { .health-grid { grid-template-columns: 1fr 1fr; } }

/* ═══ Container 5: Monitor Row ═══ */
.monitor-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
.monitor-left, .monitor-right {
  background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1.2rem;
}
@media (max-width: 768px) { .monitor-row { grid-template-columns: 1fr; } }

/* Modern Card (fallback) */
.modern-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1.2rem; }
.modern-card h3 { margin: 0 0 0.8rem; font-size: 0.88rem; font-weight: 700; color: #e2e8f0; }
.empty-inline { color: #64748b; font-size: 0.82rem; margin: 0.5rem 0; }

/* Activity List */
.activity-list { display: flex; flex-direction: column; gap: 0.3rem; }
.activity-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); transition: background 0.12s; }
.activity-item:hover { background: rgba(99,102,241,0.04); }
.activity-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; flex-shrink: 0; }
.activity-dot.login { background: #34d399; }
.activity-dot.logout { background: #64748b; }
.activity-dot.create_report { background: #60a5fa; }
.activity-dot.grade_report { background: #fbbf24; }
.activity-dot.signup { background: #a78bfa; }
.activity-dot.impersonate { background: #f87171; }
.activity-role { font-size: 0.62rem; color: #64748b; background: rgba(255,255,255,0.05); padding: 0.05rem 0.3rem; border-radius: 3px; margin-inline-start: 0.3rem; }
.activity-details { color: #475569; font-size: 0.65rem; }
.activity-info { flex: 1; min-width: 0; }
.activity-name { font-size: 0.78rem; font-weight: 600; color: #e2e8f0; }
.activity-action { font-size: 0.7rem; color: #64748b; margin-top: 0.1rem; }
.activity-time { font-size: 0.7rem; color: #475569; flex-shrink: 0; }

/* DB Table */
.db-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.db-table thead th { text-align: start; padding: 0.5rem 0.6rem; font-size: 0.68rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.db-table thead th:last-child { text-align: end; }
.db-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.12s; }
.db-table tbody tr:hover { background: rgba(99,102,241,0.03); }
.db-table tbody td { padding: 0.4rem 0.6rem; }
.db-name { color: #cbd5e1; font-family: monospace; font-size: 0.75rem; }
.db-count { color: #67e8f9; font-weight: 700; text-align: end; }
</style>
