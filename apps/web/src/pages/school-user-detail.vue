<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import { useAuthStore } from '../modules/auth/stores/auth';
import {
  getSchoolUserDetail, createSchoolWarning, reportToAdmin,
} from '../services/school.service';
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue';
import NotificationBell from '../components/shared/NotificationBell.vue';
import CreateApprovalButton from '../components/shared/CreateApprovalButton.vue';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const auth = useAuthStore();

const userId = Number(route.params.id);
const loading = ref(true);
const error = ref('');

const user = ref<any>(null);
const joinedClasses = ref<any[]>([]);
const taughtClasses = ref<any[]>([]);
const reports = ref<any[]>([]);
const activity = ref<any[]>([]);
const sessions = ref<any[]>([]);
const warnings = ref<any[]>([]);
const stats = ref<any>({});

const activeTab = ref<'overview' | 'classes' | 'reports' | 'activity' | 'sessions' | 'warnings'>('overview');

const showWarningModal = ref(false);
const showReportModal = ref(false);
const warningForm = ref({ title: '', message: '', severity: 'normal' });
const reportForm = ref({ reason: '', details: '' });
const submitting = ref(false);
const formMsg = ref('');
const formSuccess = ref(false);

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US');

const roleIcon = computed(() => {
  if (!user.value) return '👤';
  return user.value.role === 'teacher' ? '👨‍🏫' : '🎓';
});

const roleLabel = computed(() => {
  if (!user.value) return '';
  return user.value.role === 'teacher' ? t('shared.roleTeacher') : t('shared.roleStudent');
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getSchoolUserDetail(userId);
    if (res.success) {
      user.value = res.user;
      joinedClasses.value = res.joinedClasses || [];
      taughtClasses.value = res.taughtClasses || [];
      reports.value = res.reports || [];
      activity.value = res.activity || [];
      sessions.value = res.sessions || [];
      warnings.value = res.warnings || [];
      stats.value = res.stats || {};
    } else {
      error.value = (res as any).message || 'Failed to load';
    }
  } catch (err) {
    error.value = 'Failed to load user data';
    if (import.meta.env.DEV) console.error('school-user-detail load failed:', err);
  } finally {
    loading.value = false;
  }
}

async function handleWarning() {
  if (!warningForm.value.title.trim() || !warningForm.value.message.trim()) return;
  submitting.value = true;
  formMsg.value = '';
  formSuccess.value = false;
  try {
    const res = await createSchoolWarning(userId, warningForm.value.title, warningForm.value.message, warningForm.value.severity);
    if (res.success) {
      formSuccess.value = true;
      formMsg.value = t('shared.sudWarningSent');
      showWarningModal.value = false;
      warningForm.value = { title: '', message: '', severity: 'normal' };
      await loadData();
    } else {
      formMsg.value = res.message || t('shared.sudSendFailed');
    }
  } catch {
    formMsg.value = t('shared.sudSendFailed');
  } finally {
    submitting.value = false;
  }
}

async function handleReport() {
  if (!reportForm.value.reason.trim() || !reportForm.value.details.trim()) return;
  submitting.value = true;
  formMsg.value = '';
  formSuccess.value = false;
  try {
    const res = await reportToAdmin(userId, reportForm.value.reason, reportForm.value.details);
    if (res.success) {
      formSuccess.value = true;
      formMsg.value = t('shared.sudReportSent');
      showReportModal.value = false;
      reportForm.value = { reason: '', details: '' };
    } else {
      formMsg.value = res.message || t('shared.sudSendFailed');
    }
  } catch {
    formMsg.value = t('shared.sudSendFailed');
  } finally {
    submitting.value = false;
  }
}

function fmtDate(s: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(dateLocaleStr.value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

onMounted(loadData);
</script>

<template>
  <div class="sud-page">
    <!-- Header -->
    <div class="sud-header">
      <div class="sud-back" @click="router.push('/school')">
        <span>{{ t('shared.back') }}</span>
      </div>
      <div class="sud-header-right">
        <AccountSettingsModal />
        <NotificationBell />
        <button class="logout-btn" @click="auth.clearSchoolSession(); router.push('/')">{{ t('shared.logout') }}</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="sud-loading"><div class="spinner"></div></div>
    <div v-else-if="error" class="sud-error">❌ {{ error }}</div>

    <div v-else>
      <!-- User Profile Card -->
      <div class="sud-profile-card">
        <div class="sud-avatar">{{ roleIcon }}</div>
        <div class="sud-profile-info">
          <h2>{{ user?.name }}</h2>
          <p class="sud-email">{{ user?.email }}</p>
          <div class="sud-badges">
            <span class="badge-role" :class="user?.role">{{ roleLabel }}</span>
            <span v-if="user?.blocked_at" class="badge-blocked">{{ t('shared.sudBlocked') }}</span>
            <span v-else class="badge-active">{{ t('shared.sudActive') }}</span>
            <span v-if="user?.email_verified_at" class="badge-verified">{{ t('shared.sudVerified') }}</span>
          </div>
        </div>
        <div class="sud-profile-actions">
          <CreateApprovalButton
            v-if="user?.role === 'student'"
            type="grade_change"
            approverType="teacher"
            :targetUserId="userId"
            :targetUserName="user?.name || ''"
            :schoolId="user?.school_id"
          >
            {{ t('shared.sudReqGradeChange') }}
          </CreateApprovalButton>
          <CreateApprovalButton
            v-if="user?.role === 'student'"
            type="student_removal"
            approverType="teacher"
            :targetUserId="userId"
            :targetUserName="user?.name || ''"
            :schoolId="user?.school_id"
          >
            {{ t('shared.sudReqStudentRemoval') }}
          </CreateApprovalButton>
          <button class="action-btn warning" @click="showWarningModal = true">
            {{ t('shared.sudDirectWarning') }}
          </button>
          <button class="action-btn report" @click="showReportModal = true">
            {{ t('shared.sudReportToAdmin') }}
          </button>
          <button class="action-btn approvals" @click="router.push('/approvals')">
            {{ t('shared.sudApprovals') }}
          </button>
        </div>
      </div>

      <!-- Stats Strip -->
      <div class="sud-stats-strip">
        <div class="stat-item">
          <span class="stat-icon">📚</span>
          <span class="stat-val">{{ stats.totalClasses || 0 }}</span>
          <span class="stat-lab">{{ t('shared.sudStatClasses') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📄</span>
          <span class="stat-val">{{ stats.totalReports || 0 }}</span>
          <span class="stat-lab">{{ t('shared.sudStatReports') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">✅</span>
          <span class="stat-val">{{ stats.gradedReports || 0 }}</span>
          <span class="stat-lab">{{ t('shared.sudStatGraded') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⏳</span>
          <span class="stat-val">{{ stats.pendingReports || 0 }}</span>
          <span class="stat-lab">{{ t('shared.sudStatPending') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-val">{{ stats.avgGrade || 0 }}%</span>
          <span class="stat-lab">{{ t('shared.sudStatAvg') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🔑</span>
          <span class="stat-val">{{ stats.totalSessions || 0 }}</span>
          <span class="stat-lab">{{ t('shared.sudStatSessions') }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="sud-tabs">
        <button :class="['tab', { active: activeTab === 'overview' }]" @click="activeTab = 'overview'">
          <span>📊</span> {{ t('shared.sudTabOverview') }}
        </button>
        <button :class="['tab', { active: activeTab === 'classes' }]" @click="activeTab = 'classes'">
          <span>📚</span> {{ t('shared.sudTabClasses') }}
        </button>
        <button :class="['tab', { active: activeTab === 'reports' }]" @click="activeTab = 'reports'">
          <span>📄</span> {{ t('shared.sudTabReports') }}
        </button>
        <button :class="['tab', { active: activeTab === 'activity' }]" @click="activeTab = 'activity'">
          <span>📝</span> {{ t('shared.sudTabActivity') }}
        </button>
        <button :class="['tab', { active: activeTab === 'sessions' }]" @click="activeTab = 'sessions'">
          <span>🔑</span> {{ t('shared.sudTabSessions') }}
        </button>
        <button :class="['tab', { active: activeTab === 'warnings' }]" @click="activeTab = 'warnings'">
          <span>⚠️</span> {{ t('shared.sudTabWarnings') }}
          <span v-if="warnings.length" class="tab-badge">{{ warnings.length }}</span>
        </button>
      </div>

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

    <!-- Warning Modal -->
    <div v-if="showWarningModal" class="sud-modal-overlay" @click.self="showWarningModal = false">
      <div class="sud-modal">
        <h3>{{ t('shared.sudWarningTitle') }}</h3>
        <p class="modal-subtitle">{{ t('shared.sudWarningSubtitle', { name: user?.name }) }}</p>
        <select v-model="warningForm.severity" class="sud-input">
          <option value="low">{{ t('shared.sudSevLow') }}</option>
          <option value="normal">{{ t('shared.sudSevNormal') }}</option>
          <option value="high">{{ t('shared.sudSevHigh') }}</option>
          <option value="critical">{{ t('shared.sudSevCritical') }}</option>
        </select>
        <input v-model="warningForm.title" type="text" class="sud-input" :placeholder="t('shared.sudWarningTitleInput')" />
        <textarea v-model="warningForm.message" class="sud-input sud-textarea" :placeholder="t('shared.sudWarningDetailsInput')" rows="3"></textarea>
        <p v-if="formMsg && !formSuccess" class="sud-form-error">{{ formMsg }}</p>
        <div class="sud-modal-actions">
          <button class="sud-btn-cancel" @click="showWarningModal = false">{{ t('shared.annCancel') }}</button>
          <button class="sud-btn-confirm" :disabled="submitting" @click="handleWarning">{{ submitting ? '...' : t('shared.annPublish') }}</button>
        </div>
      </div>
    </div>

    <!-- Report Modal -->
    <div v-if="showReportModal" class="sud-modal-overlay" @click.self="showReportModal = false">
      <div class="sud-modal">
        <h3>{{ t('shared.sudReportTitle') }}</h3>
        <p class="modal-subtitle">{{ t('shared.sudReportSubtitle', { name: user?.name }) }}</p>
        <input v-model="reportForm.reason" type="text" class="sud-input" :placeholder="t('shared.sudReportReasonInput')" />
        <textarea v-model="reportForm.details" class="sud-input sud-textarea" :placeholder="t('shared.sudReportDetailsInput')" rows="4"></textarea>
        <p v-if="formMsg && !formSuccess" class="sud-form-error">{{ formMsg }}</p>
        <div class="sud-modal-actions">
          <button class="sud-btn-cancel" @click="showReportModal = false">{{ t('shared.annCancel') }}</button>
          <button class="sud-btn-confirm" :disabled="submitting" @click="handleReport">{{ submitting ? '...' : t('shared.sudSendReport') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sud-page { min-height: 100vh; background: #0a0f1e; color: #e2e8f0; padding: 1rem; max-width: 1100px; margin: 0 auto; }
.sud-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.sud-back { cursor: pointer; color: #94a3b8; font-size: 0.85rem; transition: color 0.15s; }
.sud-back:hover { color: #c7d2fe; }
.sud-header-right { display: flex; align-items: center; gap: 0.6rem; }
.logout-btn { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); color: #f87171; font-size: 0.78rem; cursor: pointer; font-family: inherit; }
.sud-loading { display: flex; justify-content: center; padding: 3rem; }
.spinner { width: 32px; height: 32px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.sud-error { text-align: center; color: #f87171; padding: 2rem; }

.sud-profile-card { display: flex; align-items: center; gap: 1.2rem; background: rgba(15,23,42,0.6); border: 1px solid rgba(99,102,241,0.12); border-radius: 0.8rem; padding: 1.2rem; margin-bottom: 1rem; }
.sud-avatar { font-size: 2.5rem; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); flex-shrink: 0; }
.sud-profile-info { flex: 1; }
.sud-profile-info h2 { margin: 0 0 0.2rem; font-size: 1.1rem; color: #f1f5f9; }
.sud-email { margin: 0 0 0.4rem; font-size: 0.82rem; color: #64748b; }
.sud-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.badge-role { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.68rem; font-weight: 700; }
.badge-role.teacher { background: rgba(59,130,246,0.15); color: #93c5fd; }
.badge-role.student { background: rgba(34,197,94,0.15); color: #86efac; }
.badge-blocked { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.68rem; background: rgba(239,68,68,0.15); color: #fca5a5; }
.badge-active { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.68rem; background: rgba(34,197,94,0.15); color: #86efac; }
.badge-verified { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.68rem; background: rgba(99,102,241,0.15); color: #a5b4fc; }
.sud-profile-actions { display: flex; flex-direction: column; gap: 0.4rem; }
.action-btn { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: none; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.action-btn.warning { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.2); }
.action-btn.warning:hover { background: rgba(245,158,11,0.25); }
.action-btn.report { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }
.action-btn.report:hover { background: rgba(239,68,68,0.25); }
.action-btn.approvals { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2); }
.action-btn.approvals:hover { background: rgba(99,102,241,0.25); }

.sud-stats-strip { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; background: rgba(15,23,42,0.4); border-radius: 0.6rem; padding: 0.8rem; }
.stat-item { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 80px; }
.stat-icon { font-size: 1rem; }
.stat-val { font-size: 1.2rem; font-weight: 800; color: #f1f5f9; }
.stat-lab { font-size: 0.68rem; color: #64748b; }

.sud-tabs { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; }
.tab { padding: 0.5rem 0.8rem; border: none; background: transparent; color: #64748b; font-size: 0.78rem; font-weight: 600; cursor: pointer; border-radius: 0.4rem; font-family: inherit; transition: all 0.15s; display: flex; align-items: center; gap: 0.3rem; }
.tab:hover { background: rgba(99,102,241,0.06); color: #c7d2fe; }
.tab.active { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.tab-badge { background: rgba(239,68,68,0.2); color: #fca5a5; font-size: 0.65rem; padding: 0.1rem 0.35rem; border-radius: 0.3rem; }

.sud-tab-panel { animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.sud-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
@media (max-width: 700px) { .sud-grid { grid-template-columns: 1fr; } }
.sud-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; }
.sud-card h3 { margin: 0 0 0.6rem; font-size: 0.9rem; color: #c7d2fe; }
.info-row { display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.8rem; }
.info-row span { color: #64748b; }
.info-row strong { color: #e2e8f0; }
.info-row .danger { color: #fca5a5; }
.mini-stat { display: flex; justify-content: space-between; padding: 0.3rem 0; font-size: 0.8rem; }
.mini-stat span { color: #64748b; }
.mini-stat strong { color: #e2e8f0; }

.sud-section { margin-bottom: 1.2rem; }
.sud-section h3 { font-size: 0.88rem; color: #c7d2fe; margin: 0 0 0.5rem; }
.sud-empty { text-align: center; color: #475569; padding: 1.5rem; font-size: 0.82rem; }

.sud-table-wrap { overflow-x: auto; }
.sud-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.sud-table th { text-align: right; padding: 0.5rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.sud-table td { padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.03); color: #cbd5e1; }
.clickable-row { cursor: pointer; transition: background 0.12s; }
.clickable-row:hover { background: rgba(99,102,241,0.06); }
.sud-ua { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #475569; font-size: 0.72rem; }

.status-tag { padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.68rem; font-weight: 600; }
.status-tag.graded { background: rgba(34,197,94,0.15); color: #86efac; }
.status-tag.submitted { background: rgba(245,158,11,0.15); color: #fcd34d; }
.status-tag.draft { background: rgba(100,116,139,0.15); color: #94a3b8; }
.status-tag.resubmitted { background: rgba(168,85,247,0.15); color: #c4b5fd; }

.sud-timeline { display: flex; flex-direction: column; gap: 0.5rem; }
.timeline-item { display: flex; gap: 0.6rem; align-items: flex-start; }
.timeline-dot { width: 8px; height: 8px; border-radius: 50%; background: #6366f1; margin-top: 0.35rem; flex-shrink: 0; }
.timeline-content { flex: 1; background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.04); border-radius: 0.4rem; padding: 0.5rem 0.7rem; }
.timeline-action { font-size: 0.8rem; font-weight: 700; color: #c7d2fe; display: block; }
.timeline-details { font-size: 0.75rem; color: #94a3b8; display: block; margin-top: 0.15rem; }
.timeline-date { font-size: 0.68rem; color: #475569; display: block; margin-top: 0.2rem; }

.sud-warnings { display: flex; flex-direction: column; gap: 0.5rem; }
.warning-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.7rem; }
.warning-card.high { border-color: rgba(239,68,68,0.2); }
.warning-card.critical { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); }
.warning-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.3rem; }
.warning-sev { padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.65rem; font-weight: 700; }
.warning-sev.low { background: rgba(100,116,139,0.2); color: #94a3b8; }
.warning-sev.normal { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.warning-sev.high { background: rgba(245,158,11,0.15); color: #fcd34d; }
.warning-sev.critical { background: rgba(239,68,68,0.15); color: #fca5a5; }
.warning-title { font-size: 0.82rem; font-weight: 700; color: #f1f5f9; }
.warning-msg { font-size: 0.78rem; color: #94a3b8; margin: 0.2rem 0; }
.warning-date { font-size: 0.68rem; color: #475569; }

.sud-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.sud-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 1.5rem; width: 90%; max-width: 420px; display: flex; flex-direction: column; gap: 0.7rem; }
.sud-modal h3 { margin: 0; font-size: 1rem; color: #f1f5f9; text-align: center; }
.modal-subtitle { font-size: 0.78rem; color: #64748b; text-align: center; margin: 0; }
.sud-input { padding: 0.6rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-size: 0.82rem; font-family: inherit; }
.sud-textarea { resize: vertical; }
.sud-form-error { color: #f87171; font-size: 0.78rem; text-align: center; margin: 0; }
.sud-modal-actions { display: flex; gap: 0.5rem; }
.sud-btn-cancel { flex: 1; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.sud-btn-confirm { flex: 1; padding: 0.5rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.sud-btn-confirm:disabled { opacity: 0.6; cursor: wait; }
</style>
