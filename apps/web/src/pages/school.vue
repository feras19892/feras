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
import SchoolLiveToastContainer from '../components/shared/SchoolLiveToastContainer.vue';
import SchoolAccountSettingsModal from '../components/shared/SchoolAccountSettingsModal.vue';
import NameRequestBadge from '../components/shared/NameRequestBadge.vue';
import SystemBanner from '../components/shared/SystemBanner.vue';
import SchoolOverview from '../components/school/SchoolOverview.vue';
import SchoolCapacitySection from '../components/school/SchoolCapacitySection.vue';
import SchoolTables from '../components/school/SchoolTables.vue';
import { useApprovalBadge } from '../composables/useApprovalBadge';
import { useSubTabs } from '../composables/useSubTabs';

const ApprovalPanel = defineAsyncComponent(() => import('../components/shared/ApprovalPanel.vue'));
const AnnouncementsPanel = defineAsyncComponent(() => import('../components/shared/AnnouncementsPanel.vue'));
const TeacherPerformance = defineAsyncComponent(() => import('../components/school/TeacherPerformance.vue'));
const SchoolReports = defineAsyncComponent(() => import('../components/school/SchoolReports.vue'));
const SchoolFeedback = defineAsyncComponent(() => import('../components/school/SchoolFeedback.vue'));
const SchoolSettings = defineAsyncComponent(() => import('../components/school/SchoolSettings.vue'));
const SchoolExportPanel = defineAsyncComponent(() => import('../components/school/SchoolExportPanel.vue'));

const router = useRouter();
const { t, locale } = useI18n();
const auth = useAuthStore();

const school = ref<School | null>(null);
const stats = ref<SchoolStats | null>(null);
const users = ref<SchoolUser[]>([]);
const classes = ref<SchoolClass[]>([]);
const loading = ref(true);
const errorMsg = ref('');
type SchoolTab = 'overview' | 'users' | 'classes' | 'reports' | 'settings';
const activeTab = ref<SchoolTab>('overview');
type UsersSub = 'users' | 'teachers';
type ReportsSub = 'reports' | 'detailed';
type SettingsSub = 'settings' | 'sessions' | 'activity' | 'warnings' | 'feedback' | 'announcements' | 'approvals' | 'export';
const { subTab: usersSub, setSubTab: setUsersSub } = useSubTabs<UsersSub>('users', ['users', 'teachers']);
const { subTab: reportsSub, setSubTab: setReportsSub } = useSubTabs<ReportsSub>('reports', ['reports', 'detailed']);
const { subTab: settingsSub, setSubTab: setSettingsSub } = useSubTabs<SettingsSub>('settings', ['settings', 'sessions', 'activity', 'warnings', 'feedback', 'announcements', 'approvals', 'export']);
const freezeReason = ref('');
const freezeLoading = ref(false);
const helpOpen = ref(false);
const sidebarCollapsed = ref(false);

const reports = ref<SchoolReportItem[]>([]);
const sessions = ref<SchoolSessionItem[]>([]);
const dataTruncated = ref(false);
const activityLog = ref<SchoolActivityItem[]>([]);
const schoolWarnings = ref<SchoolWarningItem[]>([]);
const { pendingCount: approvalPendingCount } = useApprovalBadge();

const groups = computed<SidebarGroup[]>(() => [
  { id: 'main', title: t('school.sidebarMain'), icon: '🏠', items: [
    { id: 'overview', icon: '📊', label: t('school.navOverview') },
    { id: 'users', icon: '👥', label: t('school.navUsers'), badge: users.value.length || undefined },
    { id: 'classes', icon: '📚', label: t('school.navClasses'), badge: classes.value.length || undefined },
    { id: 'reports', icon: '📄', label: t('school.navReports'), badge: reports.value.length || undefined },
  ]},
  { id: 'system', title: t('school.sidebarMonitor'), icon: '⚙️', items: [
    { id: 'settings', icon: '⚙️', label: t('school.navSettings'), badge: approvalPendingCount.value > 0 ? approvalPendingCount.value : undefined },
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
      getSchoolStats(), getSchoolUsers(1, 200), getSchoolClasses(), getSchoolReports(1, 200),
      getSchoolSessions(), getSchoolActivity(), getSchoolWarnings(),
    ]);
    if (results[0].status === 'fulfilled' && results[0].value.success) {
      school.value = results[0].value.school;
      stats.value = results[0].value.stats;
    }
    if (results[1].status === 'fulfilled' && results[1].value.success) users.value = results[1].value.users;
    if (results[2].status === 'fulfilled' && results[2].value.success) classes.value = results[2].value.classes;
    if (results[3].status === 'fulfilled' && results[3].value.success) reports.value = results[3].value.reports;
    const usersTruncated = results[1].status === 'fulfilled' && results[1].value.success && (results[1].value.total ?? results[1].value.users.length) > results[1].value.users.length;
    const reportsTruncated = results[3].status === 'fulfilled' && results[3].value.success && (results[3].value.total ?? results[3].value.reports.length) > results[3].value.reports.length;
    dataTruncated.value = usersTruncated || reportsTruncated;
    if (results[4].status === 'fulfilled' && results[4].value.success) sessions.value = results[4].value.sessions.slice(0, 200);
    if (results[5].status === 'fulfilled' && results[5].value.success) activityLog.value = results[5].value.activity.slice(0, 200);
    if (results[6].status === 'fulfilled' && results[6].value.success) schoolWarnings.value = results[6].value.warnings;
  } catch (err) {
    errorMsg.value = t('school.loadFailed');
    if (import.meta.env.DEV) console.error('school load failed:', err);
  } finally {
    loading.value = false;
  }
}

const freezeError = ref('');

async function refreshClassesAndStats() {
  try {
    const [cls, st] = await Promise.all([getSchoolClasses(), getSchoolStats()]);
    if (cls.success) classes.value = cls.classes;
    if (st.success) stats.value = st.stats;
  } catch { /* ignore partial refresh errors */ }
}

async function freezeClass(classId: string) {
  const reason = freezeReason.value.trim() || t('school.freezeDefault');
  freezeLoading.value = true;
  freezeError.value = '';
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/school/freeze-class', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId, reason }),
    });
    if (res.success) { freezeReason.value = ''; await refreshClassesAndStats(); }
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
    if (res.success) await refreshClassesAndStats();
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

onMounted(async () => {
  if (!auth.isSchool) { router.push('/'); return; }
  await auth.fetchMe();
  await loadAll();
  refreshTimer = setInterval(() => {
    if (document.visibilityState === 'visible') loadAll();
  }, 300000);
});

onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer); });
</script>

<template>
  <div class="school-layout">
    <SystemBanner />
    <SchoolLiveToastContainer />
    <AppSidebar
      :groups="groups"
      :active-id="activeTab"
      role="school"
      :user-name="school?.name || ''"
      :collapsed="sidebarCollapsed"
      @select="(e: string) => { freezeError = ''; activeTab = e as SchoolTab }"
      @home="router.push({ path: '/home', query: { view: 'experiments' } })"
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
          <NameRequestBadge />
          <SchoolNotificationBell />
          <SchoolAccountSettingsModal />
          <button class="help-btn-top" @click="helpOpen = true" :title="t('school.helpBtn')">❓</button>
        </div>
      </header>

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
          <!-- Tab 1: Overview (includes capacity) -->
          <template v-if="activeTab === 'overview'">
            <SchoolOverview :school="school" :stats="stats" :date-locale-str="dateLocaleStr" :users="users" :classes="classes" :reports="reports" :warnings="schoolWarnings" @navigate="activeTab = $event as SchoolTab" />
            <SchoolCapacitySection :school="school" :date-locale-str="dateLocaleStr" />
          </template>

          <!-- Tab 2: Users (sub-tabs: users table + teacher performance) -->
          <template v-else-if="activeTab === 'users'">
            <div class="sub-tabs">
              <button :class="['sub-tab', { active: usersSub === 'users' }]" @click="setUsersSub('users')">{{ t('school.navUsers') }}</button>
              <button :class="['sub-tab', { active: usersSub === 'teachers' }]" @click="setUsersSub('teachers')">{{ t('school.navTeachers') }}</button>
            </div>
            <div v-if="dataTruncated && usersSub === 'users'" class="truncation-notice">⚠️ {{ t('school.dataTruncated') }}</div>
            <SchoolTables v-if="usersSub === 'users'" active-tab="users" :users="users" :classes="classes" :reports="reports" :sessions="sessions" :activity-log="activityLog" :school-warnings="schoolWarnings" :date-locale-str="dateLocaleStr" :freeze-loading="freezeLoading" @user-removed="handleUserRemoved" @reload="loadAll" @freeze="freezeClass" @unfreeze="unfreezeClass" />
            <TeacherPerformance v-else />
          </template>

          <!-- Tab 3: Classes -->
          <template v-else-if="activeTab === 'classes'">
            <SchoolTables active-tab="classes" :users="users" :classes="classes" :reports="reports" :sessions="sessions" :activity-log="activityLog" :school-warnings="schoolWarnings" :date-locale-str="dateLocaleStr" :freeze-loading="freezeLoading" @user-removed="handleUserRemoved" @reload="loadAll" @freeze="freezeClass" @unfreeze="unfreezeClass" />
          </template>

          <!-- Tab 4: Reports (sub-tabs: reports table + detailed reports) -->
          <template v-else-if="activeTab === 'reports'">
            <div class="sub-tabs">
              <button :class="['sub-tab', { active: reportsSub === 'reports' }]" @click="setReportsSub('reports')">{{ t('school.navReports') }}</button>
              <button :class="['sub-tab', { active: reportsSub === 'detailed' }]" @click="setReportsSub('detailed')">{{ t('school.navDetailedReports') }}</button>
            </div>
            <div v-if="dataTruncated && reportsSub === 'reports'" class="truncation-notice">⚠️ {{ t('school.dataTruncated') }}</div>
            <SchoolTables v-if="reportsSub === 'reports'" active-tab="reports" :users="users" :classes="classes" :reports="reports" :sessions="sessions" :activity-log="activityLog" :school-warnings="schoolWarnings" :date-locale-str="dateLocaleStr" :freeze-loading="freezeLoading" @user-removed="handleUserRemoved" @reload="loadAll" @freeze="freezeClass" @unfreeze="unfreezeClass" />
            <SchoolReports v-else />
          </template>

          <!-- Tab 5: Settings (sub-tabs: settings + monitoring + admin) -->
          <template v-else-if="activeTab === 'settings'">
            <div class="sub-tabs">
              <button :class="['sub-tab', { active: settingsSub === 'settings' }]" @click="setSettingsSub('settings')">⚙️ {{ t('school.navSettings') }}</button>
              <button :class="['sub-tab', { active: settingsSub === 'sessions' }]" @click="setSettingsSub('sessions')">🔑 {{ t('school.navSessions') }}</button>
              <button :class="['sub-tab', { active: settingsSub === 'activity' }]" @click="setSettingsSub('activity')">📝 {{ t('school.navActivity') }}</button>
              <button :class="['sub-tab', { active: settingsSub === 'warnings' }]" @click="setSettingsSub('warnings')">⚠️ {{ t('school.navWarnings') }}</button>
              <button :class="['sub-tab', { active: settingsSub === 'feedback' }]" @click="setSettingsSub('feedback')">💬 {{ t('school.navFeedback') }}</button>
              <button :class="['sub-tab', { active: settingsSub === 'announcements' }]" @click="setSettingsSub('announcements')">📢 {{ t('school.navAnnouncements') }}</button>
              <button :class="['sub-tab', { active: settingsSub === 'approvals' }]" @click="setSettingsSub('approvals')">📋 {{ t('school.navApprovals') }}</button>
              <button :class="['sub-tab', { active: settingsSub === 'export' }]" @click="setSettingsSub('export')">📁 {{ t('school.navExport') }}</button>
            </div>
            <SchoolSettings v-if="settingsSub === 'settings'" :school="school" @school-updated="school = $event" />
            <SchoolTables v-else-if="['sessions', 'activity', 'warnings'].includes(settingsSub)" :active-tab="settingsSub" :users="users" :classes="classes" :reports="reports" :sessions="sessions" :activity-log="activityLog" :school-warnings="schoolWarnings" :date-locale-str="dateLocaleStr" :freeze-loading="freezeLoading" @user-removed="handleUserRemoved" @reload="loadAll" @freeze="freezeClass" @unfreeze="unfreezeClass" />
            <SchoolFeedback v-else-if="settingsSub === 'feedback'" />
            <AnnouncementsPanel v-else-if="settingsSub === 'announcements'" />
            <ApprovalPanel v-else-if="settingsSub === 'approvals'" mode="school" />
            <SchoolExportPanel v-else-if="settingsSub === 'export'" />
          </template>
        </template>

        <HelpModal v-if="helpOpen" :title="t('school.helpTitle')" :sections="helpSections" @close="helpOpen = false" />
      </div>
    </div>
  </div>
</template>


<style scoped src='./school.css'></style>
