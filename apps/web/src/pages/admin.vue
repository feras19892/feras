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
import ApprovalPanel from '../components/shared/ApprovalPanel.vue';
import PanelShell from '../components/shared/PanelShell.vue';
import type { DockItem } from '../components/shared/PanelShell.vue';
import NotificationBell from '../components/shared/NotificationBell.vue';
import NotificationToast from '../components/shared/NotificationToast.vue';
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue';
import NameRequestBadge from '../components/shared/NameRequestBadge.vue';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();
if (!auth.isAdmin) { router.push('/home'); }

type Section = 'overview' | 'users' | 'schools' | 'requests' | 'approvals' | 'health' | 'settings' | 'export' | 'feedback' | 'audit' | 'chat';
const active = ref<Section>('overview');
const selectedUserId = ref<number | null>(null);
const hovered = ref<string | null>(null);

const dockItems = computed<DockItem[]>(() => [
  { id: 'overview' as Section, icon: '📊', label: t('admin.dockOverview') },
  { id: 'users' as Section, icon: '👥', label: t('admin.dockUsers') },
  { id: 'schools' as Section, icon: '🏫', label: t('admin.dockSchools') },
  { id: 'requests' as Section, icon: '📋', label: t('admin.dockRequests') },
  { id: 'approvals' as Section, icon: '✅', label: 'الموافقات' },
  { id: 'health' as Section, icon: '🖥️', label: t('admin.dockHealth') },
  { id: 'settings' as Section, icon: '⚙️', label: t('admin.dockSettings') },
  { id: 'export' as Section, icon: '📤', label: t('admin.dockExport') },
  { id: 'feedback' as Section, icon: '💬', label: t('admin.dockFeedback') },
  { id: 'audit' as Section, icon: '📜', label: t('admin.dockAudit') },
  { id: 'chat' as Section, icon: '👁️', label: t('admin.dockChat') },
]);

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

onMounted(loadAll);
</script>

<template>
  <PanelShell
    :dock-items="dockItems"
    :active-id="active"
    :title="dockItems.find(i => i.id === active)?.label || ''"
    role="admin"
    :user-name="auth.user?.name || ''"
    :stats="stats ? [
      { icon: '👥', value: users.length, label: t('admin.statUsers') },
      { icon: '📚', value: classes.length, label: t('admin.statClasses') },
      { icon: '📄', value: reports.length, label: t('admin.statReports') },
    ] : []"
    @select="select($event as Section)"
    @home="router.push({ path: '/home', query: { view: 'experiments' } })"
    @logout="auth.logout(); router.push('/')"
  >
    <AdminGlobalSearch :users="users" :classes="classes" :reports="reports" :feedback="feedback"
      @select-user="openUserDetail" @select-class="selectClass" @select-report="selectReport" />

    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else-if="errorMsg" class="error-box">❌ {{ errorMsg }}</div>

    <template v-else-if="stats">
      <div v-if="active === 'overview'" class="panel"><AdminDashboard /></div>

      <div v-else-if="active === 'users'" class="panel">
        <AdminUserDetail v-if="selectedUserId" :user-id="selectedUserId" @back="closeUserDetail" @refresh="loadAll" />
        <AdminUserManager v-else :users="users" @refresh="loadAll" @delete="handleRemoveUser"
          @change-role="handleChangeRole" @add="handleAddUser" @view="openUserDetail" />
      </div>

      <div v-else-if="active === 'schools'" class="panel"><AdminSchoolManager /></div>
      <div v-else-if="active === 'requests'" class="panel"><AdminRequests /></div>
      <div v-else-if="active === 'approvals'" class="panel"><ApprovalPanel mode="admin" /></div>
      <div v-else-if="active === 'health'" class="panel"><AdminSystemHealth /></div>
      <div v-else-if="active === 'settings'" class="panel"><AdminSystemSettings /></div>
      <div v-else-if="active === 'export'" class="panel"><AdminExportPanel /></div>
      <div v-else-if="active === 'feedback'" class="panel"><AdminFeedbackPanel /></div>
      <div v-else-if="active === 'audit'" class="panel"><AdminAuditLog /></div>
      <div v-else-if="active === 'chat'" class="panel"><AdminChatMonitor /></div>
    </template>
  </PanelShell>

    <div class="toast-zone">
      <NotificationToast :show="toastShow" :title="toastTitle" :message="toastMessage"
        :type="toastType" :timeout-ms="4500" @close="toastShow = false" />
    </div>
</template>

<style scoped>
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
