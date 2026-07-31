<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import { useAuthStore } from '../modules/auth/stores/auth';
import {
  getSchoolStats, getSchoolUsers, getSchoolClasses, getSchoolReports,
  logoutSchool,
  getSchoolSessions, getSchoolActivity, getSchoolWarnings,
  type School, type SchoolStats, type SchoolUser, type SchoolClass,
  type SchoolReportItem, type SchoolSessionItem, type SchoolActivityItem, type SchoolWarningItem,
} from '../services/school.service';
import { fetchJson } from '../services/http';
import HelpModal from '../components/shared/HelpModal.vue';
import AppSidebar from '../components/shared/AppSidebar.vue';
import type { SidebarGroup } from '../components/shared/AppSidebar.vue';
import SchoolNotificationBell from '../components/shared/SchoolNotificationBell.vue';
import SystemBanner from '../components/shared/SystemBanner.vue';
import SchoolOverview from '../components/school/SchoolOverview.vue';
import SchoolTables from '../components/school/SchoolTables.vue';
import { useApprovalBadge } from '../composables/useApprovalBadge';

const ApprovalPanel = defineAsyncComponent(() => import('../components/shared/ApprovalPanel.vue'));
const AnnouncementsPanel = defineAsyncComponent(() => import('../components/shared/AnnouncementsPanel.vue'));
const TeacherPerformance = defineAsyncComponent(() => import('../components/school/TeacherPerformance.vue'));
const SchoolReports = defineAsyncComponent(() => import('../components/school/SchoolReports.vue'));
const SchoolFeedback = defineAsyncComponent(() => import('../components/school/SchoolFeedback.vue'));
const SchoolSettings = defineAsyncComponent(() => import('../components/school/SchoolSettings.vue'));

const router = useRouter();
const { t, locale } = useI18n();
const auth = useAuthStore();

const school = ref<School | null>(null);
const stats = ref<SchoolStats | null>(null);
const users = ref<SchoolUser[]>([]);
const classes = ref<SchoolClass[]>([]);
const loading = ref(true);
const errorMsg = ref('');
const activeTab = ref<string>('overview');
const freezeReason = ref('');
const freezeLoading = ref(false);
const helpOpen = ref(false);
const sidebarCollapsed = ref(false);

const reports = ref<SchoolReportItem[]>([]);
const sessions = ref<SchoolSessionItem[]>([]);
const activityLog = ref<SchoolActivityItem[]>([]);
const schoolWarnings = ref<SchoolWarningItem[]>([]);
const { pendingCount: approvalPendingCount } = useApprovalBadge();

const groups = computed<SidebarGroup[]>(() => [
  { id: 'main', title: t('school.sidebarMain'), icon: '🏠', items: [
    { id: 'overview', icon: '📊', label: t('school.navOverview') },
  ]},
  { id: 'manage', title: t('school.sidebarManage'), icon: '👥', items: [
    { id: 'users', icon: '👥', label: t('school.navUsers'), badge: users.value.length || undefined },
    { id: 'classes', icon: '📚', label: t('school.navClasses'), badge: classes.value.length || undefined },
    { id: 'reports', icon: '📄', label: t('school.navReports'), badge: reports.value.length || undefined },
    { id: 'teachers', icon: '🎓', label: t('school.navTeachers') },
    { id: 'detailed-reports', icon: '📊', label: t('school.navDetailedReports') },
  ]},
  { id: 'monitor', title: t('school.sidebarMonitor'), icon: '🔍', items: [
    { id: 'sessions', icon: '🔑', label: t('school.navSessions'), badge: sessions.value.length || undefined },
    { id: 'activity', icon: '📝', label: t('school.navActivity'), badge: activityLog.value.length || undefined },
    { id: 'warnings', icon: '⚠️', label: t('school.navWarnings'), badge: schoolWarnings.value.length || undefined },
    { id: 'feedback', icon: '💬', label: t('school.navFeedback') },
  ]},
  { id: 'comm', title: t('school.sidebarComm'), icon: '💬', items: [
    { id: 'announcements', icon: '📢', label: t('school.navAnnouncements') },
    { id: 'approvals', icon: '📋', label: t('school.navApprovals'), badge: approvalPendingCount.value > 0 ? approvalPendingCount.value : undefined },
  ]},
  { id: 'account', title: t('school.sidebarAccount'), icon: '⚙️', items: [
    { id: 'settings', icon: '⚙️', label: t('school.navSettings') },
  ]},
]);

const activeLabel = computed(() => {
  for (const g of groups.value) {
    const item = g.items.find(i => i.id === activeTab.value);
    if (item) return item.label;
  }
  return '';
});

const helpSections = computed(() => [
  { heading: t('school.helpHeader'), items: [
    { label: t('school.helpCode'), desc: t('school.helpCodeDesc') },
    { label: t('school.helpCapacity'), desc: t('school.helpCapacityDesc') },
    { label: t('school.helpUsers'), desc: t('school.helpUsersDesc') },
    { label: t('school.helpClasses'), desc: t('school.helpClassesDesc') },
    { label: t('school.navReports'), desc: t('school.helpReportsDesc') },
    { label: t('school.navSettings'), desc: t('school.helpSettingsDesc') },
  ]},
]);

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US');

async function loadAll() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const results = await Promise.allSettled([
      getSchoolStats(), getSchoolUsers(), getSchoolClasses(), getSchoolReports(),
      getSchoolSessions(), getSchoolActivity(), getSchoolWarnings(),
    ]);
    if (results[0].status === 'fulfilled' && results[0].value.success) {
      school.value = results[0].value.school;
      stats.value = results[0].value.stats;
    }
    if (results[1].status === 'fulfilled' && results[1].value.success) users.value = results[1].value.users;
    if (results[2].status === 'fulfilled' && results[2].value.success) classes.value = results[2].value.classes;
    if (results[3].status === 'fulfilled' && results[3].value.success) reports.value = results[3].value.reports;
    if (results[4].status === 'fulfilled' && results[4].value.success) sessions.value = results[4].value.sessions;
    if (results[5].status === 'fulfilled' && results[5].value.success) activityLog.value = results[5].value.activity;
    if (results[6].status === 'fulfilled' && results[6].value.success) schoolWarnings.value = results[6].value.warnings;
  } catch (err) {
    errorMsg.value = t('school.loadFailed');
    if (import.meta.env.DEV) console.error('school load failed:', err);
  } finally {
    loading.value = false;
  }
}

const freezeError = ref('');

async function freezeClass(classId: string) {
  if (!freezeReason.value.trim()) freezeReason.value = t('school.freezeDefault');
  freezeLoading.value = true;
  freezeError.value = '';
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/school/freeze-class', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId, reason: freezeReason.value }),
    });
    if (res.success) { freezeReason.value = ''; await loadAll(); }
    else { freezeError.value = res.message || t('school.freezeFailed'); }
  } catch (err) {
    freezeError.value = t('school.freezeFailed');
    if (import.meta.env.DEV) console.error('freeze failed:', err);
  }
  freezeLoading.value = false;
}

async function unfreezeClass(classId: string) {
  freezeLoading.value = true;
  freezeError.value = '';
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/school/unfreeze-class', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId }),
    });
    if (res.success) await loadAll();
    else { freezeError.value = res.message || t('school.unfreezeFailed'); }
  } catch (err) {
    freezeError.value = t('school.unfreezeFailed');
    if (import.meta.env.DEV) console.error('unfreeze failed:', err);
  }
  freezeLoading.value = false;
}

function handleUserRemoved(userId: number) {
  users.value = users.value.filter(u => u.id !== userId);
}

async function handleLogout() {
  await logoutSchool();
  auth.clearSchoolSession();
  router.push('/');
}

let refreshTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  loadAll();
  refreshTimer = setInterval(() => { loadAll(); }, 60000);
});

onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer); });
</script>

<template>
  <div class="school-layout">
    <SystemBanner />
    <AppSidebar
      :groups="groups"
      :active-id="activeTab"
      role="school"
      :user-name="school?.name || ''"
      :collapsed="sidebarCollapsed"
      @select="activeTab = $event as string"
      @home="router.push('/')"
      @logout="handleLogout"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="school-main">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">{{ activeLabel }}</h1>
          <span class="topbar-date">{{ new Date().toLocaleDateString(dateLocaleStr, { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
        </div>
        <div class="topbar-right">
          <SchoolNotificationBell />
          <button class="help-btn-top" @click="helpOpen = true" :title="t('school.helpBtn')">❓</button>
        </div>
      </header>

      <div class="kpi-strip" v-if="stats">
        <div class="kpi-item"><span class="kpi-icon">🎓</span><span class="kpi-val">{{ stats.students }}</span><span class="kpi-lab">{{ t('school.kpiStudents') }}</span></div>
        <div class="kpi-item"><span class="kpi-icon">👨‍🏫</span><span class="kpi-val">{{ stats.teachers }}</span><span class="kpi-lab">{{ t('school.kpiTeachers') }}</span></div>
        <div class="kpi-item"><span class="kpi-icon">🏫</span><span class="kpi-val">{{ stats.classes }}</span><span class="kpi-lab">{{ t('school.kpiClasses') }}</span></div>
        <div class="kpi-item"><span class="kpi-icon">📄</span><span class="kpi-val">{{ stats.reports }}</span><span class="kpi-lab">{{ t('school.kpiReports') }}</span></div>
      </div>

      <div class="content-area">
        <div v-if="school" class="code-box">
          <span class="code-label">{{ t('school.yourCode') }}:</span>
          <span class="code-value">{{ school.code }}</span>
          <span class="code-hint">{{ t('school.codeHint') }}</span>
        </div>

        <div v-if="freezeError" class="error-box" style="margin-bottom: 1rem;">⚠️ {{ freezeError }}</div>
        <div v-if="loading" class="loading"><div class="spinner"></div></div>
        <div v-else-if="errorMsg" class="error-box">❌ {{ errorMsg }}</div>

        <template v-else>
          <SchoolOverview v-if="activeTab === 'overview'" :school="school" :stats="stats" :date-locale-str="dateLocaleStr" />
          <div v-else-if="activeTab === 'teachers'" class="tab-panel"><TeacherPerformance /></div>
          <div v-else-if="activeTab === 'detailed-reports'" class="tab-panel"><SchoolReports /></div>
          <SchoolTables
            v-else-if="['users', 'classes', 'reports', 'sessions', 'activity', 'warnings'].includes(activeTab)"
            :active-tab="activeTab"
            :users="users"
            :classes="classes"
            :reports="reports"
            :sessions="sessions"
            :activity-log="activityLog"
            :school-warnings="schoolWarnings"
            :date-locale-str="dateLocaleStr"
            :freeze-loading="freezeLoading"
            @user-removed="handleUserRemoved"
            @reload="loadAll"
            @freeze="freezeClass"
            @unfreeze="unfreezeClass"
          />
          <div v-else-if="activeTab === 'feedback'" class="tab-panel"><SchoolFeedback /></div>
          <div v-else-if="activeTab === 'announcements'" class="tab-panel"><AnnouncementsPanel /></div>
          <div v-else-if="activeTab === 'approvals'" class="tab-panel"><ApprovalPanel mode="school" /></div>
          <SchoolSettings v-else-if="activeTab === 'settings'" :school="school" @school-updated="school = $event" />
        </template>

        <HelpModal v-if="helpOpen" :title="t('school.helpTitle')" :sections="helpSections" @close="helpOpen = false" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.school-layout { display: flex; min-height: 100vh; background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%); color: #e2e8f0; }
.school-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); background: rgba(10,15,28,0.5); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50; }
.topbar-left { display: flex; align-items: center; gap: 0.8rem; }
.topbar-title { margin: 0; font-size: 1.15rem; font-weight: 800; color: #f1f5f9; }
.topbar-date { font-size: 0.75rem; color: #64748b; }
.topbar-right { display: flex; align-items: center; gap: 0.4rem; }
.help-btn-top { width: 38px; height: 38px; border-radius: 0.6rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.help-btn-top:hover { border-color: rgba(6,182,212,0.3); background: rgba(6,182,212,0.08); }
.kpi-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.5rem; padding: 0.8rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
.kpi-item { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; padding: 0.5rem 0.4rem; border-radius: 0.6rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); }
.kpi-icon { font-size: 1rem; }
.kpi-val { font-size: 1.05rem; font-weight: 800; color: #e5e7eb; line-height: 1; }
.kpi-lab { font-size: 0.6rem; color: #64748b; text-align: center; white-space: nowrap; }
.content-area { flex: 1; padding: 1.5rem; overflow-y: auto; }
.code-box { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1.2rem; margin-bottom: 1.5rem; border-radius: 0.8rem; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); }
.code-label { font-size: 0.85rem; color: #94a3b8; }
.code-value { font-size: 1.4rem; font-weight: 800; color: #67e8f9; font-family: monospace; letter-spacing: 0.15rem; }
.code-hint { font-size: 0.75rem; color: #64748b; }
.loading { text-align: center; padding: 3rem; }
.spinner { width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #818cf8; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-box { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(239,68,68,0.2); text-align: center; }
.tab-panel { animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
