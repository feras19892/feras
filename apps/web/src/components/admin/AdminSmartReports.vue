<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { getAdminInsights, getAdminActivity, getAdminActivityStats } from '../../services/admin.service';

const loading = ref(false);
const error = ref('');
interface InactiveUser { id: number; name: string; role: string }
interface EmptyClass { id: number; name: string; teacher_name: string }
interface NoReportsTeacher { id: number; name: string }
interface InsightsData {
  inactiveUsers?: InactiveUser[];
  emptyClasses?: EmptyClass[];
  ungradedCount?: number;
  noReportsTeachers?: NoReportsTeacher[];
}
interface ActivityItem {
  id: number;
  action: string;
  actor_name: string;
  actor_role: string;
  target_type?: string;
  target_id?: number;
  created_at?: string;
}
interface ActivityStatsData { today: number; logins: number; signups: number; reports: number }

const { t } = useI18n();
const insights = ref<InsightsData | null>(null);
const activities = ref<ActivityItem[]>([]);
const activityStats = ref<ActivityStatsData | null>(null);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [i, a, s] = await Promise.all([
      getAdminInsights(),
      getAdminActivity(),
      getAdminActivityStats(),
    ]);
    if (i.success) insights.value = i.insights;
    if (a.success) activities.value = a.activities;
    if (s.success) activityStats.value = s.stats;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
  } finally {
    loading.value = false;
  }
}

function formatDate(d: string | undefined) {
  return d ? new Date(d).toLocaleString() : '';
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    login: t('adminUser.actionLogin'),
    signup: t('adminUser.actionSignup'),
    create_user: t('adminUser.actionCreateUser'),
    delete_user: t('adminUser.actionDeleteUser'),
    submit_report: t('adminUser.actionSubmitReport'),
    grade_report: t('adminUser.actionGradeReport'),
    create_class: t('adminUser.actionCreateClass'),
    delete_class: t('adminUser.actionDeleteClass'),
  };
  return map[action] || action;
}

onMounted(load);
</script>

<template>
  <div class="section">
    <div class="section-header">
      <h3>{{ t('admin.smart') }}</h3>
      <button class="btn-primary" @click="load">{{ t('admin.refresh') }}</button>
    </div>

    <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="error-box">❌ {{ error }}</div>
    <template v-else>
      <!-- Activity Stats -->
      <div v-if="activityStats" class="stats-row">
        <div class="mini-card">
          <div class="mini-value">{{ activityStats.today }}</div>
          <div class="mini-label">{{ t('admin.todayActivity') }}</div>
        </div>
        <div class="mini-card">
          <div class="mini-value">{{ activityStats.logins }}</div>
          <div class="mini-label">{{ t('admin.todayLogins') }}</div>
        </div>
        <div class="mini-card">
          <div class="mini-value">{{ activityStats.signups }}</div>
          <div class="mini-label">{{ t('admin.todaySignups') }}</div>
        </div>
        <div class="mini-card">
          <div class="mini-value">{{ activityStats.reports }}</div>
          <div class="mini-label">{{ t('admin.todayReports') }}</div>
        </div>
      </div>

      <!-- Insights -->
      <div v-if="insights" class="insights-grid">
        <div class="insight-card warning" v-if="insights.inactiveUsers?.length">
          <h4>{{ t('adminUser.inactiveUsers7') }}</h4>
          <ul>
            <li v-for="u in insights.inactiveUsers" :key="u.id">{{ u.name }} ({{ u.role }})</li>
          </ul>
        </div>
        <div class="insight-card warning" v-if="insights.emptyClasses?.length">
          <h4>{{ t('adminUser.emptyClassesLabel') }}</h4>
          <ul>
            <li v-for="c in insights.emptyClasses" :key="c.id">{{ c.name }} — {{ c.teacher_name }}</li>
          </ul>
        </div>
        <div class="insight-card alert" v-if="insights.ungradedCount">
          <h4>{{ t('adminUser.pendingReports3') }}</h4>
          <p>{{ insights.ungradedCount }} {{ t('admin.needsGrading') }}</p>
        </div>
        <div class="insight-card info" v-if="insights.noReportsTeachers?.length">
          <h4>{{ t('adminUser.teachersNoReportsLabel') }}</h4>
          <ul>
            <li v-for="teacher in insights.noReportsTeachers" :key="teacher.id">{{ teacher.name }}</li>
          </ul>
        </div>
      </div>

      <!-- Activity Log -->
      <div class="activity-section">
        <h4>{{ t('adminUser.activityLog') }}</h4>
        <div class="activity-list">
          <div v-for="a in activities.slice(0, 50)" :key="a.id" class="activity-item">
            <span class="act-action">{{ actionLabel(a.action) }}</span>
            <span class="act-actor">{{ a.actor_name }} ({{ a.actor_role }})</span>
            <span class="act-target" v-if="a.target_type">→ {{ a.target_type }} {{ a.target_id }}</span>
            <span class="act-time">{{ formatDate(a.created_at) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; }
.loading { text-align: center; color: #64748b; padding: 2rem; }
.error-box { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }

.btn-primary { padding: 0.45rem 0.9rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.85rem; }

.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
.mini-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.8rem; text-align: center; }
.mini-value { font-size: 1.4rem; font-weight: 800; color: #67e8f9; }
.mini-label { font-size: 0.75rem; color: #94a3b8; }

.insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.insight-card { border-radius: 0.6rem; padding: 1rem; border: 1px solid rgba(255,255,255,0.06); }
.insight-card.warning { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.15); }
.insight-card.alert { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.15); }
.insight-card.info { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.15); }
.insight-card h4 { margin: 0 0 0.5rem; font-size: 0.9rem; }
.insight-card ul { margin: 0; padding-right: 1.2rem; font-size: 0.85rem; color: #cbd5e1; }
.insight-card li { margin-bottom: 0.2rem; }
.insight-card p { margin: 0; font-size: 0.85rem; }

.activity-section h4 { margin: 0 0 0.75rem; font-size: 1rem; }
.activity-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: 400px; overflow-y: auto; }
.activity-item { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; padding: 0.4rem 0.6rem; border-radius: 0.35rem; background: rgba(0,0,0,0.2); font-size: 0.8rem; }
.act-action { font-weight: 700; color: #a5b4fc; }
.act-actor { color: #94a3b8; }
.act-target { color: #67e8f9; }
.act-time { margin-right: auto; color: #64748b; font-size: 0.75rem; }
</style>
