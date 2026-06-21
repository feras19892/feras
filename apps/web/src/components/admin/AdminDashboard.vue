<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminStats, getAdminActivityStats, getAdminInsights } from '../../services/admin.service';

const stats = ref<any>(null);
const activityStats = ref<any>(null);
const insights = ref<any>(null);
const loading = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [s, a, i] = await Promise.all([getAdminStats(), getAdminActivityStats(), getAdminInsights()]);
    if (s.success) stats.value = s.stats;
    if (a.success) activityStats.value = a.stats;
    if (i.success) insights.value = i.insights;
  } catch (err: any) {
    error.value = err?.message || 'فشل التحميل';
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
    case 'admin': return 'أدمن';
    case 'teacher': return 'مدرس';
    case 'student': return 'طالب';
    default: return role;
  }
}

onMounted(load);
</script>

<template>
  <div class="dashboard">
    <div v-if="loading" class="loading">جاري التحميل...</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>
    <template v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ stats?.users?.total ?? 0 }}</div>
          <div class="stat-label">إجمالي المستخدمين</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏫</div>
          <div class="stat-value">{{ stats?.classes?.total ?? 0 }}</div>
          <div class="stat-label">الفصول</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-value">{{ stats?.reports?.total ?? 0 }}</div>
          <div class="stat-label">التقارير</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ stats?.reports?.graded ?? 0 }}</div>
          <div class="stat-label">مصحح</div>
        </div>
      </div>

      <!-- Today's Activity -->
      <div v-if="activityStats" class="today-row">
        <div class="today-card">
          <div class="today-value">{{ activityStats.today }}</div>
          <div class="today-label">نشاط اليوم</div>
        </div>
        <div class="today-card">
          <div class="today-value">{{ activityStats.logins }}</div>
          <div class="today-label">تسجيلات دخول</div>
        </div>
        <div class="today-card">
          <div class="today-value">{{ activityStats.signups }}</div>
          <div class="today-label">تسجيلات جديدة</div>
        </div>
        <div class="today-card">
          <div class="today-value">{{ activityStats.reports }}</div>
          <div class="today-label">تقارير اليوم</div>
        </div>
      </div>

      <!-- Role Distribution -->
      <div v-if="stats?.users?.byRole?.length" class="role-chart">
        <h3>توزيع المستخدمين</h3>
        <div class="role-bars">
          <div v-for="r in stats.users.byRole" :key="r.role" class="role-bar">
            <span class="role-name" :style="{ color: roleColor(r.role) }">{{ roleLabel(r.role) }}</span>
            <div class="role-track">
              <div class="role-fill" :style="{ width: (r.count / Math.max(stats.users.total, 1) * 100) + '%', background: roleColor(r.role) }"></div>
            </div>
            <span class="role-count">{{ r.count }}</span>
          </div>
        </div>
      </div>

      <!-- Top Users -->
      <div v-if="insights?.topUsers?.length" class="top-users">
        <h3>🏆 أكثر المستخدمين نشاطاً</h3>
        <div class="top-list">
          <div v-for="u in insights.topUsers" :key="u.id" class="top-item">
            <span class="top-name">{{ u.name }}</span>
            <span class="top-role" :class="u.role">{{ roleLabel(u.role) }}</span>
            <div class="top-bar"><div class="top-fill" :style="{ width: Math.min((u.report_count / Math.max(insights.topUsers[0].report_count, 1)) * 100, 100) + '%' }"></div></div>
            <span class="top-count">{{ u.report_count }} تقرير</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-if="insights?.recentActivity?.length" class="recent-activity">
        <h3>📜 آخر النشاطات</h3>
        <div class="activity-list">
          <div v-for="(a, i) in insights.recentActivity" :key="i" class="activity-item">
            <span class="activity-dot"></span>
            <span class="activity-name">{{ a.actor_name }}</span>
            <span class="activity-action">{{ a.action === 'login' ? 'تسجيل دخول' : a.action }}</span>
            <span class="activity-date">{{ a.created_at?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div v-if="insights" class="alerts-grid">
        <div class="alert-card warning" v-if="insights.inactiveUsers?.length">
          <h4>😴 مستخدمون غير نشطين ({{ insights.inactiveUsers.length }})</h4>
          <ul><li v-for="u in insights.inactiveUsers" :key="u.id">{{ u.name }} ({{ roleLabel(u.role) }})</li></ul>
        </div>
        <div class="alert-card warning" v-if="insights.emptyClasses?.length">
          <h4>🏫 فصول بدون طلاب ({{ insights.emptyClasses.length }})</h4>
          <ul><li v-for="c in insights.emptyClasses" :key="c.id">{{ c.name }} — {{ c.teacher_name }}</li></ul>
        </div>
        <div class="alert-card alert" v-if="insights.ungradedCount">
          <h4>⏳ تقارير معلقة +3 أيام</h4>
          <p>{{ insights.ungradedCount }} تقرير بحاجة تصحيح</p>
        </div>
        <div class="alert-card info" v-if="insights.noReportsTeachers?.length">
          <h4>👨‍🏫 مدرسون بدون تقارير ({{ insights.noReportsTeachers.length }})</h4>
          <ul><li v-for="t in insights.noReportsTeachers" :key="t.id">{{ t.name }}</li></ul>
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
.role-name { width: 80px; font-weight: 700; font-size: 0.85rem; text-align: right; }
.role-track { flex: 1; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
.role-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.role-count { width: 30px; text-align: left; font-size: 0.85rem; font-weight: 700; }

.alerts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.alert-card { border-radius: 0.6rem; padding: 1rem; border: 1px solid rgba(255,255,255,0.06); }
.alert-card.warning { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.15); }
.alert-card.alert { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.15); }
.alert-card.info { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.15); }
.alert-card h4 { margin: 0 0 0.5rem; font-size: 0.9rem; }
.alert-card ul { margin: 0; padding-right: 1.2rem; font-size: 0.85rem; color: #cbd5e1; }
.alert-card li { margin-bottom: 0.2rem; }
.alert-card p { margin: 0; font-size: 0.85rem; }

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
.top-count { width: 80px; font-size: 0.8rem; color: #94a3b8; text-align: left; }

.recent-activity { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; }
.recent-activity h3 { margin: 0 0 1rem; font-size: 1rem; }
.activity-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.activity-dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; flex-shrink: 0; }
.activity-name { font-weight: 700; font-size: 0.85rem; width: 120px; }
.activity-action { flex: 1; font-size: 0.8rem; color: #94a3b8; }
.activity-date { font-size: 0.75rem; color: #64748b; }
</style>
