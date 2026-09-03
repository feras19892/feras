<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { useRouter } from 'vue-router';
import type { SchoolUserDetail, SchoolClass, SchoolReportItem, SchoolActivityItem, SchoolSessionItem, SchoolWarningItem } from '../../services/school.service';
const props = defineProps<{
  activeTab: string;
  user: SchoolUserDetail | null;
  roleLabel: string;
  joinedClasses: SchoolClass[];
  taughtClasses: SchoolClass[];
  reports: SchoolReportItem[];
  activity: SchoolActivityItem[];
  sessions: SchoolSessionItem[];
  warnings: SchoolWarningItem[];
  stats: Record<string, unknown>;
  dateLocaleStr: string;
}>();

const router = useRouter();
function fmtDate(s?: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(props.dateLocaleStr, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
</script>

<template>
  <div>
    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'" class="sud-tab-panel">
      <div class="sud-grid">
        <div class="sud-card">
          <h3>{{ t('shared.sudAccountInfo') }}</h3>
          <div class="info-row"><span>{{ t('shared.sudName') }}</span><strong>{{ user?.name }}</strong></div>
          <div class="info-row"><span>{{ t('shared.sudEmail') }}</span><strong>{{ user?.email }}</strong></div>
          <div class="info-row"><span>{{ t('shared.sudRole') }}</span><strong>{{ roleLabel }}</strong></div>
          <div class="info-row"><span>{{ t('shared.sudRegDate') }}</span><strong>{{ fmtDate(user?.created_at) }}</strong></div>
          <div class="info-row"><span>{{ t('shared.sudEmailVerified') }}</span><strong>{{ user?.email_verified_at ? fmtDate(user?.email_verified_at) : t('shared.sudNotVerified') }}</strong></div>
          <div v-if="user?.blocked_at" class="info-row"><span>{{ t('shared.sudBlockDate') }}</span><strong class="danger">{{ fmtDate(user?.blocked_at) }}</strong></div>
          <div v-if="user?.block_reason" class="info-row"><span>{{ t('shared.sudBlockReason') }}</span><strong class="danger">{{ user?.block_reason }}</strong></div>
        </div>
        <div class="sud-card">
          <h3>{{ t('shared.sudStats') }}</h3>
          <div class="mini-stat"><span>📚 {{ t('shared.sudStatClasses') }}:</span><strong>{{ stats.totalClasses || 0 }}</strong></div>
          <div class="mini-stat"><span>📄 {{ t('shared.sudStatReports') }}:</span><strong>{{ stats.totalReports || 0 }}</strong></div>
          <div class="mini-stat"><span>✅ {{ t('shared.sudStatGraded') }}:</span><strong>{{ stats.gradedReports || 0 }}</strong></div>
          <div class="mini-stat"><span>⏳ {{ t('shared.sudStatPending') }}:</span><strong>{{ stats.pendingReports || 0 }}</strong></div>
          <div class="mini-stat"><span>📊 {{ t('shared.sudStatAvg') }}:</span><strong>{{ stats.avgGrade || 0 }}%</strong></div>
          <div class="mini-stat"><span>🔑 {{ t('shared.sudStatSessions') }}:</span><strong>{{ stats.totalSessions || 0 }}</strong></div>
        </div>
      </div>
    </div>

    <!-- Classes Tab -->
    <div v-if="activeTab === 'classes'" class="sud-tab-panel">
      <div v-if="user?.role === 'teacher'" class="sud-section">
        <h3>{{ t('shared.sudClassesTaught') }}</h3>
        <div v-if="taughtClasses.length === 0" class="sud-empty">{{ t('shared.sudNoClasses') }}</div>
        <div v-else class="sud-table-wrap">
          <table class="sud-table">
            <thead><tr><th>{{ t('shared.sudThClass') }}</th><th>{{ t('shared.sudThCode') }}</th><th>{{ t('shared.sudThStudents') }}</th><th>{{ t('shared.sudThCreated') }}</th></tr></thead>
            <tbody>
              <tr v-for="c in taughtClasses" :key="c.id" class="clickable-row" @click="router.push(`/school/class/${c.id}`)">
                <td>{{ c.name }}</td>
                <td><code>{{ c.code }}</code></td>
                <td>{{ c.student_count }}</td>
                <td>{{ fmtDate(c.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="sud-section">
        <h3>{{ t('shared.sudClassesJoined') }}</h3>
        <div v-if="joinedClasses.length === 0" class="sud-empty">{{ t('shared.sudNoClasses') }}</div>
        <div v-else class="sud-table-wrap">
          <table class="sud-table">
            <thead><tr><th>{{ t('shared.sudThClass') }}</th><th>{{ t('shared.sudThCode') }}</th><th>{{ t('shared.sudThTeacher') }}</th><th>{{ t('shared.sudThCreated') }}</th></tr></thead>
            <tbody>
              <tr v-for="c in joinedClasses" :key="c.id" class="clickable-row" @click="router.push(`/school/class/${c.id}`)">
                <td>{{ c.name }}</td>
                <td><code>{{ c.code }}</code></td>
                <td>{{ c.teacher_name || '—' }}</td>
                <td>{{ fmtDate(c.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Reports Tab -->
    <div v-if="activeTab === 'reports'" class="sud-tab-panel">
      <div v-if="reports.length === 0" class="sud-empty">{{ t('shared.sudNoReports') }}</div>
      <div v-else class="sud-table-wrap">
        <table class="sud-table">
          <thead><tr><th>{{ t('shared.sudThExperiment') }}</th><th>{{ t('shared.sudThClassCol') }}</th><th>{{ t('shared.sudThStatus') }}</th><th>{{ t('shared.sudThGrade') }}</th><th>{{ t('shared.sudThDate') }}</th></tr></thead>
          <tbody>
            <tr v-for="r in reports" :key="r.id">
              <td>{{ r.experiment_name }}</td>
              <td>{{ r.class_name || '—' }}</td>
              <td><span class="status-tag" :class="r.status">{{ r.status }}</span></td>
              <td>{{ r.grade != null ? r.grade : '—' }}</td>
              <td>{{ fmtDate(r.submitted_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Activity Tab -->
    <div v-if="activeTab === 'activity'" class="sud-tab-panel">
      <div v-if="activity.length === 0" class="sud-empty">{{ t('shared.sudNoActivity') }}</div>
      <div v-else class="sud-timeline">
        <div v-for="(a, i) in activity" :key="i" class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <span class="timeline-action">{{ a.action }}</span>
            <span class="timeline-details">{{ a.details }}</span>
            <span class="timeline-date">{{ fmtDate(a.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sessions Tab -->
    <div v-if="activeTab === 'sessions'" class="sud-tab-panel">
      <div v-if="sessions.length === 0" class="sud-empty">{{ t('shared.sudNoSessions') }}</div>
      <div v-else class="sud-table-wrap">
        <table class="sud-table">
          <thead><tr><th>{{ t('shared.sudThIP') }}</th><th>{{ t('shared.sudThBrowser') }}</th><th>{{ t('shared.sudThLogin') }}</th><th>{{ t('shared.sudThLogout') }}</th></tr></thead>
          <tbody>
            <tr v-for="(s, i) in sessions" :key="i">
              <td>{{ s.ip || '—' }}</td>
              <td class="sud-ua">{{ s.user_agent || '—' }}</td>
              <td>{{ fmtDate(s.login_at) }}</td>
              <td>{{ s.logout_at ? fmtDate(s.logout_at) : t('shared.sudSessionActive') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Warnings Tab -->
    <div v-if="activeTab === 'warnings'" class="sud-tab-panel">
      <div v-if="warnings.length === 0" class="sud-empty">{{ t('shared.sudNoWarnings') }}</div>
      <div v-else class="sud-warnings">
        <div v-for="w in warnings" :key="w.id" class="warning-card" :class="w.severity">
          <div class="warning-header">
            <span class="warning-sev" :class="w.severity">{{ w.severity }}</span>
            <span class="warning-title">{{ w.title }}</span>
          </div>
          <p class="warning-msg">{{ w.message }}</p>
          <span class="warning-date">{{ fmtDate(w.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
