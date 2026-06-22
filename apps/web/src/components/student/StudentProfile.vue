<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../modules/auth/stores/auth';
import { getReports, getStudentStats } from '../../services/report.service';
import { getMyClasses } from '../../services/class.service';
import type { Report } from '../../services/report.service';

const { t } = useI18n();
const auth = useAuthStore();
const reports = ref<Report[]>([]);
const stats = ref({ total: 0, graded: 0, pending: 0, average: 0 });
const classes = ref<{ id: string; name: string }[]>([]);
const loading = ref(false);

const bestGrade = computed(() => {
  const graded = reports.value.filter(r => r.grade !== undefined);
  if (!graded.length) return 0;
  return Math.max(...graded.map(r => r.grade!));
});

const recentReports = computed(() => reports.value.slice(0, 5));

async function load() {
  loading.value = true;
  try {
    const [rRes, sRes, cRes] = await Promise.all([
      getReports(),
      getStudentStats(auth.user!.id),
      getMyClasses(),
    ]);
    if (rRes.success) reports.value = rRes.reports;
    if (sRes.success) stats.value = sRes.stats;
    if (cRes.success) classes.value = cRes.classes;
  } catch (err) {
    console.error('load profile failed:', err);
  }
  loading.value = false;
}

function statusBadge(s: string) {
  if (s === 'graded') return { text: t('dashboard.statusGraded'), color: 'graded' };
  if (s === 'submitted') return { text: t('dashboard.statusSubmitted'), color: 'pending' };
  if (s === 'resubmitted') return { text: t('dashboard.statusResubmitted'), color: 'resubmitted' };
  return { text: t('dashboard.statusDraft'), color: 'draft' };
}

onMounted(() => load());
</script>

<template>
  <div class="profile-panel">
    <div class="profile-header">
      <div class="avatar">🎓</div>
      <div class="info">
        <h2>{{ auth.user?.name }}</h2>
        <p class="email">{{ auth.user?.email }}</p>
        <p class="role">{{ t('dashboard.student') }}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-val">{{ stats.total }}</span>
        <span class="stat-label">{{ t('dashboard.totalReports') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ stats.graded }}</span>
        <span class="stat-label">{{ t('dashboard.graded') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ stats.pending }}</span>
        <span class="stat-label">{{ t('dashboard.pending') }}</span>
      </div>
      <div class="stat-card highlight">
        <span class="stat-val">{{ stats.average }}%</span>
        <span class="stat-label">{{ t('dashboard.average') }}</span>
      </div>
      <div class="stat-card highlight">
        <span class="stat-val">{{ bestGrade }}%</span>
        <span class="stat-label">{{ t('dashboard.bestGrade') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ classes.length }}</span>
        <span class="stat-label">{{ t('dashboard.classes') }}</span>
      </div>
    </div>

    <div class="recent-section">
      <h3>{{ t('dashboard.recentReports') }}</h3>
      <div v-if="loading" class="empty">...</div>
      <div v-else-if="recentReports.length === 0" class="empty">{{ t('dashboard.noReportsMsg') }}</div>
      <div v-else class="report-list">
        <div v-for="r in recentReports" :key="r.id" class="report-row">
          <span class="report-name">{{ r.experiment_name }}</span>
          <span :class="['badge', statusBadge(r.status).color]">{{ statusBadge(r.status).text }}</span>
          <span v-if="r.grade !== undefined" class="grade">{{ r.grade }}%</span>
          <span class="date">{{ r.submitted_at?.slice(0, 10) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-panel { width: 100%; padding: 1rem 1.5rem; }
.profile-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.info h2 { margin: 0; font-size: 1.3rem; color: #f1f5f9; }
.email { margin: 0.2rem 0 0; font-size: 0.85rem; color: #94a3b8; }
.role { margin: 0; font-size: 0.75rem; color: #67e8f9; background: rgba(99,102,241,0.1); padding: 0.15rem 0.5rem; border-radius: 999px; display: inline-block; margin-top: 0.3rem; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin-bottom: 1.5rem; }
.stat-card { text-align: center; padding: 0.8rem; border-radius: 0.5rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); }
.stat-card.highlight { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.15); }
.stat-val { display: block; font-size: 1.4rem; font-weight: 800; color: #67e8f9; }
.stat-card.highlight .stat-val { color: #a5b4fc; }
.stat-label { font-size: 0.75rem; color: #94a3b8; }
.recent-section h3 { margin: 0 0 0.75rem; font-size: 1rem; color: #e2e8f0; }
.empty { text-align: center; padding: 1rem; color: #64748b; font-size: 0.85rem; }
.report-list { display: flex; flex-direction: column; gap: 0.4rem; }
.report-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.8rem; border-radius: 0.4rem; background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.05); }
.report-name { flex: 1; font-weight: 600; color: #f1f5f9; font-size: 0.85rem; }
.badge { padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
.badge.graded { background: rgba(34,197,94,0.15); color: #22c55e; }
.badge.pending { background: rgba(245,158,11,0.15); color: #fbbf24; }
.badge.resubmitted { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.badge.draft { background: rgba(148,163,184,0.15); color: #94a3b8; }
.grade { color: #67e8f9; font-weight: 700; font-family: monospace; font-size: 0.85rem; }
.date { color: #475569; font-size: 0.75rem; margin-right: auto; }
</style>
