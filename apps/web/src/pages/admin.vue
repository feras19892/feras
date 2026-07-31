<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';
import { useI18n } from '../composables/useI18n';
import { useAdmin } from '../composables/useAdmin';
import { useNotifications } from '../composables/useNotifications';
import AdminDashboard from '../components/admin/AdminDashboard.vue';
import AdminUserManager from '../components/admin/AdminUserManager.vue';
import AdminUserDetail from '../components/admin/AdminUserDetail.vue';
import AdminFeedbackPanel from '../components/admin/AdminFeedbackPanel.vue';
import AdminSystemHealth from '../components/admin/AdminSystemHealth.vue';
import AdminExportPanel from '../components/admin/AdminExportPanel.vue';
import AdminSystemSettings from '../components/admin/AdminSystemSettings.vue';
import AdminChatMonitor from '../components/admin/AdminChatMonitor.vue';
import AdminGlobalSearch from '../components/admin/AdminGlobalSearch.vue';
import AdminAuditLog from '../components/admin/AdminAuditLog.vue';
import AdminSchoolManager from '../components/admin/AdminSchoolManager.vue';
import AdminRequests from '../components/admin/AdminRequests.vue';
import AdminSmartReports from '../components/admin/AdminSmartReports.vue';
import AdminDetailedReports from '../components/admin/AdminDetailedReports.vue';
import EmergencyControls from '../components/admin/EmergencyControls.vue';
import AdminEnhancements from '../components/admin/AdminEnhancements.vue';
import SystemBanner from '../components/shared/SystemBanner.vue';
import ApprovalPanel from '../components/shared/ApprovalPanel.vue';
import AppSidebar from '../components/shared/AppSidebar.vue';
import type { SidebarGroup } from '../components/shared/AppSidebar.vue';
import AnnouncementsPanel from '../components/shared/AnnouncementsPanel.vue';
import NotificationBell from '../components/shared/NotificationBell.vue';
import NotificationToast from '../components/shared/NotificationToast.vue';
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue';
import NameRequestBadge from '../components/shared/NameRequestBadge.vue';
import BranchCard from '../components/ui/BranchCard.vue';
import { fetchHomeCards } from '../services/home.service';
import type { HomeCard } from '../types/physics';

const router = useRouter();
const auth = useAuthStore();
const { t, locale } = useI18n();
if (!auth.isAdmin) { router.push('/home'); }

type Section = 'overview' | 'experiments' | 'users' | 'schools' | 'requests' | 'approvals' | 'announcements' | 'health' | 'settings' | 'export' | 'feedback' | 'audit' | 'chat' | 'smart' | 'detailed' | 'emergency' | 'enhancements';
const active = ref<Section>('overview');
const selectedUserId = ref<number | null>(null);
const hovered = ref<string | null>(null);
const sidebarCollapsed = ref(false);
const cards = ref<HomeCard[]>([]);

const groups = computed<SidebarGroup[]>(() => [
  {
    id: 'main',
    title: t('shared.navHome'),
    icon: '🏠',
    items: [
      { id: 'overview', icon: '📊', label: t('shared.navOverview') },
      { id: 'experiments', icon: '🔬', label: t('shared.navExperiments') },
    ],
  },
  {
    id: 'manage',
    title: t('shared.navManage'),
    icon: '👥',
    items: [
      { id: 'users', icon: '👥', label: t('shared.navUsers'), badge: users.value.length || undefined },
      { id: 'schools', icon: '🏫', label: t('shared.navSchools') },
      { id: 'requests', icon: '📋', label: t('shared.navRequests') },
      { id: 'approvals', icon: '✅', label: t('shared.navApprovals') },
    ],
  },
  {
    id: 'comm',
    title: t('shared.navComm'),
    icon: '💬',
    items: [
      { id: 'announcements', icon: '📢', label: t('shared.navAnnouncements') },
      { id: 'feedback', icon: '💬', label: t('shared.navFeedback') },
      { id: 'chat', icon: '🖥️', label: t('shared.navChat') },
    ],
  },
  {
    id: 'system',
    title: t('shared.navSystem'),
    icon: '🖥️',
    items: [
      { id: 'smart', icon: '🧠', label: t('shared.navSmart') },
      { id: 'detailed', icon: '📈', label: t('shared.navDetailed') },
      { id: 'enhancements', icon: '✨', label: t('shared.navAdvancedFeatures') },
      { id: 'health', icon: '🩺', label: t('shared.navHealth') },
      { id: 'emergency', icon: '🚨', label: t('shared.navEmergency') },
      { id: 'audit', icon: '📜', label: t('shared.navAudit') },
      { id: 'export', icon: '📤', label: t('shared.navExport') },
      { id: 'settings', icon: '⚙️', label: t('shared.navSettings') },
    ],
  },
]);

const activeLabel = computed(() => {
  for (const g of groups.value) {
    const item = g.items.find(i => i.id === active.value);
    if (item) return item.label;
  }
  return '';
});

const { notifications } = useNotifications();
const toastShow = ref(false);
const toastTitle = ref('');
const toastMessage = ref('');
const toastType = ref<'info' | 'success' | 'warning' | 'error'>('info');

watch(notifications, (val, old) => {
  if (val.length > (old?.length || 0)) {
    const latest = val[0];
    toastTitle.value = latest?.title || t('common.notifications');
    toastMessage.value = latest?.message || '';
    toastShow.value = true;
  }
}, { deep: false });

const {
  loading, errorMsg,
  users, classes, reports, feedback, stats,
  loadAll, handleRemoveUser, handleChangeRole, handleAddUser,
} = useAdmin();

function select(s: Section) { selectedUserId.value = null; active.value = s; }
function openUserDetail(id: number) { selectedUserId.value = id; }
function closeUserDetail() { selectedUserId.value = null; }
function selectClass(_id: string) { select('users'); }
function selectReport(id: number) { router.push(`/report/${id}`); }

function goToBranch(branchId: string) {
  if (branchId === 'physics') router.push('/physics');
  if (branchId === 'chemistry') router.push('/chemistry');
  if (branchId === 'mathematics') router.push('/math');
  if (branchId === 'general') router.push('/biology');
}

async function loadCards() {
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ }
}

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US')

const translatedCards = computed(() => cards.value.map(card => ({
  ...card,
  title: t(`dashboard.${card.id}Title`),
  desc: t(`dashboard.${card.id}Desc`),
  stats: t(`dashboard.${card.id}Stats`),
})))

onMounted(() => {
  loadAll();
  loadCards();
});
</script>

<template>
  <div class="admin-layout">
    <SystemBanner />
    <AppSidebar
      :groups="groups"
      :active-id="active"
      role="admin"
      :user-name="auth.user?.name || ''"
      :collapsed="sidebarCollapsed"
      @select="select($event as Section)"
      @home="router.push({ path: '/home', query: { view: 'experiments' } })"
      @logout="auth.logout(); router.push('/')"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="admin-main">
      <!-- Top Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">{{ activeLabel }}</h1>
          <span class="topbar-date">{{ new Date().toLocaleDateString(dateLocaleStr, { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
        </div>
        <div class="topbar-right">
          <NameRequestBadge />
          <NotificationBell />
          <AccountSettingsModal />
        </div>
      </header>

      <!-- KPI Strip -->
      <div class="kpi-strip" v-if="stats">
        <div class="kpi-item"><span class="kpi-icon">👥</span><span class="kpi-val">{{ stats.users.total }}</span><span class="kpi-lab">{{ t('shared.kpiUsers') }}</span></div>
        <div class="kpi-item"><span class="kpi-icon">📚</span><span class="kpi-val">{{ stats.classes.total }}</span><span class="kpi-lab">{{ t('shared.kpiClasses') }}</span></div>
        <div class="kpi-item"><span class="kpi-icon">📄</span><span class="kpi-val">{{ stats.reports.total }}</span><span class="kpi-lab">{{ t('shared.kpiReports') }}</span></div>
        <div class="kpi-item"><span class="kpi-icon">⏳</span><span class="kpi-val">{{ stats.reports.pending }}</span><span class="kpi-lab">{{ t('shared.kpiPending') }}</span></div>
        <div class="kpi-item"><span class="kpi-icon">✅</span><span class="kpi-val">{{ stats.reports.graded }}</span><span class="kpi-lab">{{ t('shared.kpiGraded') }}</span></div>
        <div class="kpi-item"><span class="kpi-icon">📊</span><span class="kpi-val">{{ stats.reports.average }}%</span><span class="kpi-lab">{{ t('shared.kpiAvg') }}</span></div>
      </div>

      <!-- Content -->
      <div class="content-area">
        <AdminGlobalSearch :users="users" :classes="classes" :reports="reports" :feedback="feedback"
          @select-user="openUserDetail" @select-class="selectClass" @select-report="selectReport" />

        <div v-if="loading" class="loading"><div class="spinner"></div></div>
        <div v-else-if="errorMsg" class="error-box">❌ {{ errorMsg }}</div>

        <template v-else-if="stats">
          <div v-if="active === 'overview'" class="panel"><AdminDashboard /></div>

          <!-- Experiments -->
          <div v-else-if="active === 'experiments'" class="panel">
            <div class="cards-grid">
              <BranchCard
                v-for="card in translatedCards"
                :key="card.id"
                :id="card.id"
                :icon="card.icon"
                :title="card.title"
                :desc="card.desc"
                :stats="card.stats"
                :action="() => goToBranch(card.branchId)"
              />
            </div>
          </div>

          <div v-else-if="active === 'users'" class="panel">
            <AdminUserDetail v-if="selectedUserId" :user-id="selectedUserId" @back="closeUserDetail" @refresh="loadAll" />
            <AdminUserManager v-else :users="users" :current-user-id="auth.user?.id" @refresh="loadAll" @delete="handleRemoveUser"
              @change-role="handleChangeRole" @add="handleAddUser" @view="openUserDetail" />
          </div>

          <div v-else-if="active === 'schools'" class="panel"><AdminSchoolManager /></div>
          <div v-else-if="active === 'requests'" class="panel"><AdminRequests /></div>
          <div v-else-if="active === 'approvals'" class="panel"><ApprovalPanel mode="admin" /></div>
          <div v-else-if="active === 'announcements'" class="panel"><AnnouncementsPanel /></div>
          <div v-else-if="active === 'health'" class="panel"><AdminSystemHealth /></div>
          <div v-else-if="active === 'settings'" class="panel"><AdminSystemSettings /></div>
          <div v-else-if="active === 'export'" class="panel"><AdminExportPanel /></div>
          <div v-else-if="active === 'feedback'" class="panel"><AdminFeedbackPanel /></div>
          <div v-else-if="active === 'smart'" class="panel"><AdminSmartReports /></div>
          <div v-else-if="active === 'detailed'" class="panel"><AdminDetailedReports /></div>
          <div v-else-if="active === 'emergency'" class="panel"><EmergencyControls /></div>
          <div v-else-if="active === 'enhancements'" class="panel"><AdminEnhancements /></div>
          <div v-else-if="active === 'audit'" class="panel"><AdminAuditLog /></div>
          <div v-else-if="active === 'chat'" class="panel"><AdminChatMonitor /></div>
        </template>
      </div>
    </div>
  </div>

    <div class="toast-zone">
      <NotificationToast :show="toastShow" :title="toastTitle" :message="toastMessage"
        :type="toastType" :timeout-ms="4500" @close="toastShow = false" />
    </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
}
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: rgba(10,15,28,0.5);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-left { display: flex; align-items: center; gap: 0.8rem; }
.topbar-title { margin: 0; font-size: 1.15rem; font-weight: 800; color: #f1f5f9; }
.topbar-date { font-size: 0.75rem; color: #64748b; }
.topbar-right { display: flex; align-items: center; gap: 0.4rem; }
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.kpi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.5rem 0.4rem;
  border-radius: 0.6rem;
  background: rgba(15,23,42,0.5);
  border: 1px solid rgba(255,255,255,0.05);
}
.kpi-icon { font-size: 1rem; }
.kpi-val { font-size: 1.05rem; font-weight: 800; color: #e5e7eb; line-height: 1; }
.kpi-lab { font-size: 0.6rem; color: #64748b; text-align: center; white-space: nowrap; }
.content-area {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.panel { animation: slideUp 0.2s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

.loading { text-align: center; padding: 3rem; }
.spinner {
  width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.2);
  border-top-color: #818cf8; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-box {
  background: rgba(239,68,68,0.1); color: #f87171;
  padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(239,68,68,0.2); text-align: center;
}
.toast-zone { position: fixed; top: 1rem; inset-inline-end: 1rem; z-index: 10000; }
</style>
