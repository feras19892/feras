<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import { useAuthStore } from '../modules/auth/stores/auth';
import {
  getSchoolUserDetail, createSchoolWarning, reportToAdmin,
  type SchoolUserDetail, type SchoolClass, type SchoolActivityItem, type SchoolSessionItem, type SchoolWarningItem, type SchoolReportItem,
} from '../services/school.service';
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue';
import SchoolNotificationBell from '../components/shared/SchoolNotificationBell.vue';
import CreateApprovalButton from '../components/shared/CreateApprovalButton.vue';
import SchoolUserDetailTabs from '../components/school/SchoolUserDetailTabs.vue';
import SchoolUserDetailModals from '../components/school/SchoolUserDetailModals.vue';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const auth = useAuthStore();

const userId = Number(route.params.id);
const loading = ref(true);
const error = ref('');

const user = ref<SchoolUserDetail | null>(null);
const joinedClasses = ref<SchoolClass[]>([]);
const taughtClasses = ref<SchoolClass[]>([]);
const reports = ref<SchoolReportItem[]>([]);
const activity = ref<SchoolActivityItem[]>([]);
const sessions = ref<SchoolSessionItem[]>([]);
const warnings = ref<SchoolWarningItem[]>([]);
const stats = ref<Record<string, unknown>>({});

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
        <SchoolNotificationBell />
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
            approver-type="teacher"
            :target-user-id="userId"
            :target-user-name="user?.name || ''"
            :school-id="user?.school_id"
          >
            {{ t('shared.sudReqGradeChange') }}
          </CreateApprovalButton>
          <CreateApprovalButton
            v-if="user?.role === 'student'"
            type="student_removal"
            approver-type="teacher"
            :target-user-id="userId"
            :target-user-name="user?.name || ''"
            :school-id="user?.school_id"
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

      <!-- Tab Content: Overview, Classes, Reports, Activity, Sessions, Warnings -->
      <SchoolUserDetailTabs
        :active-tab="activeTab"
        :user="user"
        :role-label="roleLabel"
        :joined-classes="joinedClasses"
        :taught-classes="taughtClasses"
        :reports="reports"
        :activity="activity"
        :sessions="sessions"
        :warnings="warnings"
        :stats="stats"
        :date-locale-str="dateLocaleStr"
      />
    </div>

    <!-- Modals -->
    <SchoolUserDetailModals
      :show-warning-modal="showWarningModal"
      :show-report-modal="showReportModal"
      :warning-form="warningForm"
      :report-form="reportForm"
      :submitting="submitting"
      :form-msg="formMsg"
      :form-success="formSuccess"
      :user-name="user?.name"
      @close-warning="showWarningModal = false"
      @close-report="showReportModal = false"
      @submit-warning="handleWarning"
      @submit-report="handleReport"
    />
  </div>
</template>


<style scoped src='./school-user-detail.css'></style>
