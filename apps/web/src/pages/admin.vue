<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';
import { useI18n } from '../composables/useI18n';
import { useGoToBranch } from '../composables/useGoToBranch';
import { useAdmin } from '../composables/useAdmin';
import { useUrlTab } from '../composables/useUrlTab';
import { useAdminDashboard } from '../components/admin/dashboard/useAdminDashboard';
import AdminSidebar from '../components/admin/AdminSidebar.vue';
import type { NavGroup } from '../components/admin/AdminSidebar.vue';
import AdminTopHeader from '../components/admin/AdminTopHeader.vue';
import TabSystemActivity from '../components/admin/tabs/TabSystemActivity.vue';
import TabAcademicPerf from '../components/admin/tabs/TabAcademicPerf.vue';
import TabAlertsReports from '../components/admin/tabs/TabAlertsReports.vue';
import SystemBanner from '../components/shared/SystemBanner.vue';
import BranchCard from '../components/ui/BranchCard.vue';
import { fetchHomeCards } from '../services/home.service';
import { useApprovalBadge } from '../composables/useApprovalBadge';
import { useSubTabs } from '../composables/useSubTabs';
import type { HomeCard } from '../types/physics';

const AdminUserManager = defineAsyncComponent(() => import('../components/admin/AdminUserManager.vue'));
const AdminUserDetail = defineAsyncComponent(() => import('../components/admin/AdminUserDetail.vue'));
const AdminClassManager = defineAsyncComponent(() => import('../components/admin/AdminClassManager.vue'));
const AdminReportViewer = defineAsyncComponent(() => import('../components/admin/AdminReportViewer.vue'));
const AdminFeedbackPanel = defineAsyncComponent(() => import('../components/admin/AdminFeedbackPanel.vue'));
const AdminSystemHealth = defineAsyncComponent(() => import('../components/admin/AdminSystemHealth.vue'));
const AdminExportPanel = defineAsyncComponent(() => import('../components/admin/AdminExportPanel.vue'));
const AdminSystemSettings = defineAsyncComponent(() => import('../components/admin/AdminSystemSettings.vue'));
const AdminChatMonitor = defineAsyncComponent(() => import('../components/admin/AdminChatMonitor.vue'));
const AdminAuditLog = defineAsyncComponent(() => import('../components/admin/AdminAuditLog.vue'));
const AdminSchoolManager = defineAsyncComponent(() => import('../components/admin/AdminSchoolManager.vue'));
const AdminRequests = defineAsyncComponent(() => import('../components/admin/AdminRequests.vue'));
const AdminSmartReports = defineAsyncComponent(() => import('../components/admin/AdminSmartReports.vue'));
const AdminDetailedReports = defineAsyncComponent(() => import('../components/admin/AdminDetailedReports.vue'));
const EmergencyControls = defineAsyncComponent(() => import('../components/admin/EmergencyControls.vue'));
const AdminEnhancements = defineAsyncComponent(() => import('../components/admin/AdminEnhancements.vue'));
const ApprovalPanel = defineAsyncComponent(() => import('../components/shared/ApprovalPanel.vue'));
const AnnouncementsPanel = defineAsyncComponent(() => import('../components/shared/AnnouncementsPanel.vue'));
const AdminMessages = defineAsyncComponent(() => import('../components/admin/AdminMessages.vue'));
const AdminBackupPanel = defineAsyncComponent(() => import('../components/admin/AdminBackupPanel.vue'));

const router = useRouter();
const { goToBranch } = useGoToBranch();
const auth = useAuthStore();
const { t, locale } = useI18n();

type Section = 'overview' | 'users' | 'academics' | 'system';
type DashTab = 'system' | 'academic' | 'alerts' | 'experiments';
type UsersSub = 'users' | 'requests' | 'approvals';
type AcademicsSub = 'schools' | 'classes' | 'reports' | 'detailed' | 'smart' | 'experiments';
type SystemSub = 'health' | 'audit' | 'emergency' | 'chat' | 'messages' | 'feedback' | 'announcements' | 'export' | 'enhancements' | 'settings' | 'backup';

const validSections: Section[] = ['overview', 'users', 'academics', 'system'];
const active = useUrlTab('tab', 'overview', validSections) as Ref<Section>;
const dashTab = useUrlTab('dash', 'system', ['system', 'academic', 'alerts', 'experiments']) as Ref<DashTab>;
const { subTab: usersSub, setSubTab: setUsersSub } = useSubTabs<UsersSub>('users', ['users', 'requests', 'approvals']);
const { subTab: academicsSub, setSubTab: setAcademicsSub } = useSubTabs<AcademicsSub>('schools', ['schools', 'classes', 'reports', 'detailed', 'smart', 'experiments']);
const { subTab: systemSub, setSubTab: setSystemSub } = useSubTabs<SystemSub>('health', ['health', 'audit', 'emergency', 'chat', 'messages', 'feedback', 'announcements', 'export', 'enhancements', 'settings', 'backup']);
const selectedUserId = ref<number | null>(null);
const sidebarCollapsed = ref(false);
const globalSearchQuery = ref('');
const cards = ref<HomeCard[]>([]);
const { pendingCount: approvalPendingCount } = useApprovalBadge();

const {
  loading, errorMsg,
  users, classes, reports, stats,
  loadAll, handleRemoveUser, handleChangeRole, handleAddUser, handleRemoveClass,
} = useAdmin();

const statsComputed = computed(() => stats.value);
const {
  detailed, health, insights, loading: dashLoading, load: dashLoad,
  usersByRole, topSchools, topClasses, completionRate, gradingRate, activityRate,
  systemStatus, totalAlerts, hasAlerts, recentActivityList, healthTables,
} = useAdminDashboard(statsComputed);

const groups = computed<NavGroup[]>(() => [
  { id: 'dashboard', title: t('shared.adminGroupDashboard'), icon: '🏠', items: [
    { id: 'overview', icon: '📊', label: t('shared.navOverview') },
  ]},
  { id: 'users', title: t('shared.adminGroupUsers'), icon: '👥', items: [
    { id: 'users', icon: '👥', label: t('shared.navUsers'), badge: users.value.length || undefined },
  ]},
  { id: 'academics', title: t('shared.adminGroupAcademics'), icon: '🏫', items: [
    { id: 'academics', icon: '🏫', label: t('shared.navSchools') },
  ]},
  { id: 'system', title: t('shared.adminGroupSystem'), icon: '🛡️', items: [
    { id: 'system', icon: '🛡️', label: t('shared.navHealth'), badge: approvalPendingCount.value > 0 ? approvalPendingCount.value : undefined },
  ]},
]);

const activeLabel = computed(() => {
  for (const g of groups.value) {
    const item = g.items.find(i => i.id === active.value);
    if (item) return item.label;
  }
  return '';
});

function select(s: string) { selectedUserId.value = null; active.value = s as Section; }
function openUserDetail(id: number) { selectedUserId.value = id; }
function closeUserDetail() { selectedUserId.value = null; }

function onGlobalSearch(q: string) {
  const query = q.trim();
  if (!query) return;
  const queryLower = query.toLowerCase();
  globalSearchQuery.value = query;
  if (users.value.some(u => u.name.toLowerCase().includes(queryLower) || u.email.toLowerCase().includes(queryLower))) {
    active.value = 'users'; setUsersSub('users');
  } else if (classes.value.some(c => c.name.toLowerCase().includes(queryLower))) {
    active.value = 'academics'; setAcademicsSub('classes');
  } else if (reports.value.some(r => r.student_name?.toLowerCase().includes(queryLower) || r.experiment_name?.toLowerCase().includes(queryLower))) {
    active.value = 'academics'; setAcademicsSub('reports');
  } else {
    active.value = 'users'; setUsersSub('users');
  }
}

function goBackToOverview() {
  selectedUserId.value = null;
  active.value = 'overview';
}

async function loadCards() {
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ }
}

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US')
const dateStr = computed(() => new Date().toLocaleDateString(dateLocaleStr.value, { weekday: 'long', day: 'numeric', month: 'long' }))

const translatedCards = computed(() => cards.value.map(card => ({
  ...card,
  title: t(`dashboard.${card.id}Title`),
  desc: t(`dashboard.${card.id}Desc`),
  stats: t(`dashboard.${card.id}Stats`),
})))

onMounted(async () => {
  if (!auth.isAdmin) { router.push('/home'); return; }
  await auth.fetchMe();
  await Promise.all([loadCards(), dashLoad()]);
});
</script>

<template>
  <div class="admin-layout">
    <SystemBanner />
    <AdminSidebar
      :groups="groups"
      :active-id="active"
      :user-name="auth.user?.name || ''"
      :collapsed="sidebarCollapsed"
      @select="select($event)"
      @home="router.push({ path: '/home', query: { view: 'experiments' } })"
      @logout="auth.logout(); router.push('/')"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="admin-main">
      <AdminTopHeader :title="activeLabel" :date-str="dateStr" @search="onGlobalSearch" @back="goBackToOverview" />

      <div class="content-area">
        <div v-if="loading" class="loading"><div class="spinner"></div></div>
        <div v-else-if="errorMsg" class="error-box">❌ {{ errorMsg }}</div>

        <template v-else-if="stats">
          <!-- Tab 1: Overview (with existing dash-tabs + experiments sub-tab) -->
          <div v-if="active === 'overview'" class="panel">
            <div class="dash-tabs">
              <button :class="['dash-tab', { active: dashTab === 'system' }]" @click="dashTab = 'system'"><span>🖥️</span><span>{{ t('shared.adminTabSystem') }}</span></button>
              <button :class="['dash-tab', { active: dashTab === 'academic' }]" @click="dashTab = 'academic'"><span>🎓</span><span>{{ t('shared.adminTabAcademic') }}</span></button>
              <button :class="['dash-tab', { active: dashTab === 'alerts' }]" @click="dashTab = 'alerts'"><span>🚨</span><span>{{ t('shared.adminTabAlerts') }}</span><span v-if="totalAlerts > 0" class="tab-badge">{{ totalAlerts }}</span></button>
              <button :class="['dash-tab', { active: dashTab === 'experiments' }]" @click="dashTab = 'experiments'"><span>🔬</span><span>{{ t('shared.navExperiments') }}</span></button>
            </div>
            <TabSystemActivity v-if="dashTab === 'system' && health" :health="health" :detailed="detailed" :system-status="systemStatus" :recent-activity-list="recentActivityList" :health-tables="healthTables" />
            <TabAcademicPerf v-if="dashTab === 'academic'" :stats="stats" :detailed="detailed" :users-by-role="usersByRole" :completion-rate="completionRate" :grading-rate="gradingRate" :activity-rate="activityRate" :top-schools="topSchools" :top-classes="topClasses" />
            <TabAlertsReports v-if="dashTab === 'alerts'" :insights="insights" :has-alerts="hasAlerts" :total-alerts="totalAlerts" />
            <div v-if="dashTab === 'experiments'" class="cards-grid">
              <BranchCard v-for="card in translatedCards" :key="card.id" :id="card.id" :icon="card.icon" :title="card.title" :desc="card.desc" :stats="card.stats" :action="() => goToBranch(card.branchId)" />
            </div>
            <div v-if="dashLoading" class="loading"><div class="spinner"></div></div>
          </div>

          <!-- Tab 2: Users (sub-tabs: users + requests + approvals) -->
          <template v-else-if="active === 'users'">
            <div class="sub-tabs">
              <button :class="['sub-tab', { active: usersSub === 'users' }]" @click="setUsersSub('users')">👥 {{ t('shared.navUsers') }}</button>
              <button :class="['sub-tab', { active: usersSub === 'requests' }]" @click="setUsersSub('requests')">📋 {{ t('shared.navRequests') }}</button>
              <button :class="['sub-tab', { active: usersSub === 'approvals' }]" @click="setUsersSub('approvals')">✅ {{ t('shared.navApprovals') }}</button>
            </div>
            <div v-if="usersSub === 'users'" class="panel">
              <AdminUserDetail v-if="selectedUserId" :user-id="selectedUserId" @back="closeUserDetail" @refresh="loadAll" />
              <AdminUserManager v-else :users="users" :current-user-id="auth.user?.id" :initial-search="globalSearchQuery" @refresh="loadAll" @delete="handleRemoveUser" @change-role="handleChangeRole" @add="handleAddUser" @view="openUserDetail" />
            </div>
            <div v-else-if="usersSub === 'requests'" class="panel"><AdminRequests /></div>
            <div v-else-if="usersSub === 'approvals'" class="panel"><ApprovalPanel mode="admin" /></div>
          </template>

          <!-- Tab 3: Academics (sub-tabs: schools + classes + reports + detailed + smart + experiments) -->
          <template v-else-if="active === 'academics'">
            <div class="sub-tabs">
              <button :class="['sub-tab', { active: academicsSub === 'schools' }]" @click="setAcademicsSub('schools')">🏫 {{ t('shared.navSchools') }}</button>
              <button :class="['sub-tab', { active: academicsSub === 'classes' }]" @click="setAcademicsSub('classes')">📚 {{ t('shared.navClasses') }}</button>
              <button :class="['sub-tab', { active: academicsSub === 'reports' }]" @click="setAcademicsSub('reports')">📄 {{ t('shared.navReports') }}</button>
              <button :class="['sub-tab', { active: academicsSub === 'detailed' }]" @click="setAcademicsSub('detailed')">📈 {{ t('shared.navDetailed') }}</button>
              <button :class="['sub-tab', { active: academicsSub === 'smart' }]" @click="setAcademicsSub('smart')">🧠 {{ t('shared.navSmart') }}</button>
              <button :class="['sub-tab', { active: academicsSub === 'experiments' }]" @click="setAcademicsSub('experiments')">🔬 {{ t('shared.navExperiments') }}</button>
            </div>
            <div v-if="academicsSub === 'schools'" class="panel"><AdminSchoolManager /></div>
            <div v-else-if="academicsSub === 'classes'" class="panel"><AdminClassManager :classes="classes" :initial-search="globalSearchQuery" @delete="handleRemoveClass" @refresh="loadAll" /></div>
            <div v-else-if="academicsSub === 'reports'" class="panel"><AdminReportViewer :reports="reports" :initial-search="globalSearchQuery" @refresh="loadAll" /></div>
            <div v-else-if="academicsSub === 'detailed'" class="panel"><AdminDetailedReports /></div>
            <div v-else-if="academicsSub === 'smart'" class="panel"><AdminSmartReports /></div>
            <div v-else-if="academicsSub === 'experiments'" class="panel">
              <div class="cards-grid">
                <BranchCard v-for="card in translatedCards" :key="card.id" :id="card.id" :icon="card.icon" :title="card.title" :desc="card.desc" :stats="card.stats" :action="() => goToBranch(card.branchId)" />
              </div>
            </div>
          </template>

          <!-- Tab 4: System (sub-tabs: health + audit + emergency + chat + messages + feedback + announcements + export + enhancements + settings) -->
          <template v-else-if="active === 'system'">
            <div class="sub-tabs">
              <button :class="['sub-tab', { active: systemSub === 'health' }]" @click="setSystemSub('health')">🩺 {{ t('shared.navHealth') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'audit' }]" @click="setSystemSub('audit')">📜 {{ t('shared.navAudit') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'emergency' }]" @click="setSystemSub('emergency')">🚨 {{ t('shared.navEmergency') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'chat' }]" @click="setSystemSub('chat')">💬 {{ t('shared.navChat') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'messages' }]" @click="setSystemSub('messages')">✉️ {{ t('shared.navMessages') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'feedback' }]" @click="setSystemSub('feedback')">💬 {{ t('shared.navFeedback') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'announcements' }]" @click="setSystemSub('announcements')">📢 {{ t('shared.navAnnouncements') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'export' }]" @click="setSystemSub('export')">📁 {{ t('shared.navExport') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'enhancements' }]" @click="setSystemSub('enhancements')">✨ {{ t('shared.navAdvancedFeatures') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'settings' }]" @click="setSystemSub('settings')">⚙️ {{ t('shared.navSettings') }}</button>
              <button :class="['sub-tab', { active: systemSub === 'backup' }]" @click="setSystemSub('backup')">💾 النسخ الاحتياطي</button>
            </div>
            <div v-if="systemSub === 'health'" class="panel"><AdminSystemHealth /></div>
            <div v-else-if="systemSub === 'audit'" class="panel"><AdminAuditLog /></div>
            <div v-else-if="systemSub === 'emergency'" class="panel"><EmergencyControls /></div>
            <div v-else-if="systemSub === 'chat'" class="panel"><AdminChatMonitor /></div>
            <div v-else-if="systemSub === 'messages'" class="panel"><AdminMessages /></div>
            <div v-else-if="systemSub === 'feedback'" class="panel"><AdminFeedbackPanel /></div>
            <div v-else-if="systemSub === 'announcements'" class="panel"><AnnouncementsPanel /></div>
            <div v-else-if="systemSub === 'export'" class="panel"><AdminExportPanel /></div>
            <div v-else-if="systemSub === 'enhancements'" class="panel"><AdminEnhancements /></div>
            <div v-else-if="systemSub === 'settings'" class="panel"><AdminSystemSettings /></div>
            <div v-else-if="systemSub === 'backup'" class="panel"><AdminBackupPanel /></div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>


<style scoped src='./admin.css'></style>
