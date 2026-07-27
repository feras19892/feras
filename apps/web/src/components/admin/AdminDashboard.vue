<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { getAdminStats, getAdminActivityStats, getAdminInsights } from '../../services/admin.service';

interface RoleStat { role: string; count: number }
interface UserStats { total: number; byRole: RoleStat[] }
interface ClassStats { total: number }
interface ReportStats { total: number; graded: number; pending: number; resubmitted: number; average: number }
interface StatsData { users: UserStats; classes: ClassStats; reports: ReportStats }

interface ActivityStatsData { today: number; logins: number; signups: number; reports: number }

interface TopUser { id: number; name: string; role: string; report_count: number }
interface ActivityItem { actor_name: string; action: string; created_at?: string }
interface InactiveUser { id: number; name: string; role: string }
interface EmptyClass { id: number; name: string; teacher_name: string }
interface NoReportsTeacher { id: number; name: string }
interface InsightsData {
  topUsers: TopUser[];
  recentActivity: ActivityItem[];
  inactiveUsers: InactiveUser[];
  emptyClasses: EmptyClass[];
  ungradedCount: number;
  noReportsTeachers: NoReportsTeacher[];
}

const { t } = useI18n();
const stats = ref<StatsData | null>(null);
const activityStats = ref<ActivityStatsData | null>(null);
const insights = ref<InsightsData | null>(null);
const loading = ref(false);
const error = ref('');

const reportBreakdown = computed(() => {
  if (!stats.value) return [];
  const r = stats.value.reports;
  const total = r.total || 1;
  return [
    { label: t('admin.statusGraded'), value: r.graded, color: '#34d399', pct: Math.round(r.graded / total * 100) },
    { label: t('admin.statusSubmitted'), value: r.pending, color: '#fbbf24', pct: Math.round(r.pending / total * 100) },
    { label: t('admin.statusResubmitted'), value: r.resubmitted, color: '#f87171', pct: Math.round(r.resubmitted / total * 100) },
  ];
});

const donutSegments = computed(() => {
  if (!stats.value?.users?.byRole?.length) return [];
  const total = stats.value.users.total || 1;
  let cumulative = 0;
  return stats.value.users.byRole.map(r => {
    const pct = r.count / total;
    const seg = {
      role: r.role,
      count: r.count,
      color: roleColor(r.role),
      start: cumulative * 360,
      end: (cumulative + pct) * 360,
    };
    cumulative += pct;
    return seg;
  });
});

const donutStyle = computed(() => {
  if (!donutSegments.value.length) return {};
  const segs = donutSegments.value.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(', ');
  return { background: `conic-gradient(${segs})` };
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [s, a, i] = await Promise.all([getAdminStats(), getAdminActivityStats(), getAdminInsights()]);
    if (s.success) stats.value = s.stats as StatsData;
    if (a.success) activityStats.value = a.stats as ActivityStatsData;
    if (i.success) insights.value = i.insights as InsightsData;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
  } finally {
    loading.value = false;
  }
}

function roleColor(role: string) {
  switch (role) {
    case 'admin': return '#f87171';
    case 'teacher': return '#60a5fa';
    case 'student': return '#34d399';
    default: return '#94a3b8';
  }
}

function roleLabel(role: string) {
  switch (role) {
    case 'admin': return t('admin.roleAdmin');
    case 'teacher': return t('admin.roleTeacher');
    case 'student': return t('admin.roleStudent');
    default: return role;
  }
}

onMounted(load);
</script>

<template>
  <div class="dashboard">
    <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>
    <template v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ stats?.users?.total ?? 0 }}</div>
          <div class="stat-label">{{ t('admin.totalUsers') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏫</div>
          <div class="stat-value">{{ stats?.classes?.total ?? 0 }}</div>
          <div class="stat-label">{{ t('admin.totalClasses') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-value">{{ stats?.reports?.total ?? 0 }}</div>
          <div class="stat-label">{{ t('admin.totalReports') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ stats?.reports?.graded ?? 0 }}</div>
          <div class="stat-label">{{ t('admin.graded') }}</div>
        </div>
      </div>

      <!-- Today's Activity -->
      <div v-if="activityStats" class="today-row">
        <div class="today-card">
          <div class="today-value">{{ activityStats.today }}</div>
          <div class="today-label">{{ t('admin.todayActivity') }}</div>
        </div>
        <div class="today-card">
          <div class="today-value">{{ activityStats.logins }}</div>
          <div class="today-label">{{ t('admin.todayLogins') }}</div>
        </div>
        <div class="today-card">
          <div class="today-value">{{ activityStats.signups }}</div>
          <div class="today-label">{{ t('admin.todaySignups') }}</div>
        </div>
        <div class="today-card">
          <div class="today-value">{{ activityStats.reports }}</div>
          <div class="today-label">{{ t('admin.todayReports') }}</div>
        </div>
      </div>

      <!-- Role Distribution + Report Breakdown -->
      <div class="charts-row">
        <div v-if="donutSegments.length" class="chart-card">
          <h3>{{ t('admin.roleDistribution') }}</h3>
          <div class="donut-wrapper">
            <div class="donut" :style="donutStyle">
              <div class="donut-hole">
                <span class="donut-total">{{ stats?.users?.total ?? 0 }}</span>
                <span class="donut-label">{{ t('admin.totalUsers') }}</span>
              </div>
            </div>
            <div class="donut-legend">
              <div v-for="s in donutSegments" :key="s.role" class="legend-item">
                <span class="legend-dot" :style="{ background: s.color }"></span>
                <span class="legend-name">{{ roleLabel(s.role) }}</span>
                <span class="legend-count">{{ s.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="reportBreakdown.length" class="chart-card">
          <h3>{{ t('admin.totalReports') }}</h3>
          <div class="report-breakdown">
            <div v-for="r in reportBreakdown" :key="r.label" class="breakdown-item">
              <div class="breakdown-header">
                <span class="breakdown-dot" :style="{ background: r.color }"></span>
                <span class="breakdown-label">{{ r.label }}</span>
                <span class="breakdown-value">{{ r.value }}</span>
              </div>
              <div class="breakdown-track">
                <div class="breakdown-fill" :style="{ width: r.pct + '%', background: r.color }"></div>
              </div>
              <span class="breakdown-pct">{{ r.pct }}%</span>
            </div>
            <div v-if="stats?.reports?.average" class="breakdown-avg">
              {{ t('admin.graded') }}: {{ stats.reports.average }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Top Users -->
      <div v-if="insights?.topUsers?.length" class="top-users">
        <h3>{{ t('admin.topUsers') }}</h3>
        <div class="top-list">
          <div v-for="u in insights.topUsers" :key="u.id" class="top-item">
            <span class="top-name">{{ u.name }}</span>
            <span class="top-role" :class="u.role">{{ roleLabel(u.role) }}</span>
            <div class="top-bar"><div class="top-fill" :style="{ width: Math.min((u.report_count / Math.max(insights.topUsers[0].report_count, 1)) * 100, 100) + '%' }"></div></div>
            <span class="top-count">{{ u.report_count }} {{ t('admin.reportUnit') }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-if="insights?.recentActivity?.length" class="recent-activity">
        <h3>{{ t('admin.recentActivity') }}</h3>
        <div class="activity-list">
          <div v-for="(a, i) in insights.recentActivity" :key="i" class="activity-item">
            <span class="activity-dot"></span>
            <span class="activity-name">{{ a.actor_name }}</span>
            <span class="activity-action">{{ a.action === 'login' ? t('admin.actionLogin') : a.action }}</span>
            <span class="activity-date">{{ a.created_at?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div v-if="insights" class="alerts-grid">
        <div class="alert-card warning" v-if="insights.inactiveUsers?.length">
          <h4>{{ t('admin.inactiveUsers') }} ({{ insights.inactiveUsers.length }})</h4>
          <ul><li v-for="u in insights.inactiveUsers" :key="u.id">{{ u.name }} ({{ roleLabel(u.role) }})</li></ul>
        </div>
        <div class="alert-card warning" v-if="insights.emptyClasses?.length">
          <h4>{{ t('admin.emptyClasses') }} ({{ insights.emptyClasses.length }})</h4>
          <ul><li v-for="c in insights.emptyClasses" :key="c.id">{{ c.name }} — {{ c.teacher_name }}</li></ul>
        </div>
        <div class="alert-card alert" v-if="insights.ungradedCount">
          <h4>{{ t('admin.pendingReports') }}</h4>
          <p>{{ insights.ungradedCount }} {{ t('admin.needsGrading') }}</p>
        </div>
        <div class="alert-card info" v-if="insights.noReportsTeachers?.length">
          <h4>{{ t('admin.teachersNoReports') }} ({{ insights.noReportsTeachers.length }})</h4>
          <ul><li v-for="teacher in insights.noReportsTeachers" :key="teacher.id">{{ teacher.name }}</li></ul>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard { color: #e2e8f0; }
.loading { text-align: center; padding: 2rem; color: #64748b; }
.error { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.75rem; padding: 1.2rem; text-align: center; }
.stat-icon { font-size: 1.5rem; margin-bottom: 0.3rem; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: #67e8f9; }
.stat-label { font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem; }

.today-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
.today-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.8rem; text-align: center; }
.today-value { font-size: 1.4rem; font-weight: 800; color: #67e8f9; }
.today-label { font-size: 0.75rem; color: #94a3b8; }

.role-chart { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; }
.role-chart h3 { margin: 0 0 1rem; font-size: 1rem; }
.role-bars { display: flex; flex-direction: column; gap: 0.6rem; }
.role-bar { display: flex; align-items: center; gap: 0.8rem; }
.role-name { width: 80px; font-weight: 700; font-size: 0.85rem; text-align: end; }
.role-track { flex: 1; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
.role-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.role-count { width: 30px; text-align: start; font-size: 0.85rem; font-weight: 700; }

.alerts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.alert-card { border-radius: 0.6rem; padding: 1rem; border: 1px solid rgba(255,255,255,0.06); }
.alert-card.warning { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.15); }
.alert-card.alert { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.15); }
.alert-card.info { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.15); }
.alert-card h4 { margin: 0 0 0.5rem; font-size: 0.9rem; }
.alert-card ul { margin: 0; padding-inline-start: 1.2rem; font-size: 0.85rem; color: #cbd5e1; }
.alert-card li { margin-bottom: 0.2rem; }
.alert-card p { margin: 0; font-size: 0.85rem; }

.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.chart-card { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; }
.chart-card h3 { margin: 0 0 1rem; font-size: 1rem; }

.donut-wrapper { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.donut { width: 120px; height: 120px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.donut-hole { width: 70px; height: 70px; border-radius: 50%; background: #0a0f1c; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.donut-total { font-size: 1.4rem; font-weight: 800; color: #67e8f9; }
.donut-label { font-size: 0.6rem; color: #94a3b8; text-align: center; }
.donut-legend { display: flex; flex-direction: column; gap: 0.4rem; }
.legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-name { color: #cbd5e1; }
.legend-count { font-weight: 700; color: #e2e8f0; margin-inline-start: auto; }

.report-breakdown { display: flex; flex-direction: column; gap: 0.7rem; }
.breakdown-item { display: flex; flex-direction: column; gap: 0.2rem; }
.breakdown-header { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; }
.breakdown-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.breakdown-label { color: #cbd5e1; }
.breakdown-value { font-weight: 700; color: #e2e8f0; margin-inline-start: auto; }
.breakdown-track { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.breakdown-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
.breakdown-pct { font-size: 0.7rem; color: #64748b; align-self: flex-end; }
.breakdown-avg { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.85rem; color: #94a3b8; font-weight: 700; }

.top-users { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; }
.top-users h3 { margin: 0 0 1rem; font-size: 1rem; }
.top-item { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.6rem; }
.top-name { width: 120px; font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-role { width: 60px; font-size: 0.7rem; padding: 0.1rem 0.3rem; border-radius: 0.2rem; text-align: center; }
.top-role.admin { background: rgba(248,113,113,0.2); color: #f87171; }
.top-role.teacher { background: rgba(96,165,250,0.2); color: #60a5fa; }
.top-role.student { background: rgba(52,211,153,0.2); color: #34d399; }
.top-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.top-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #67e8f9); border-radius: 3px; transition: width 0.5s; }
.top-count { width: 80px; font-size: 0.8rem; color: #94a3b8; text-align: start; }

.recent-activity { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; }
.recent-activity h3 { margin: 0 0 1rem; font-size: 1rem; }
.activity-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.activity-dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; flex-shrink: 0; }
.activity-name { font-weight: 700; font-size: 0.85rem; width: 120px; }
.activity-action { flex: 1; font-size: 0.8rem; color: #94a3b8; }
.activity-date { font-size: 0.75rem; color: #64748b; }
</style>
