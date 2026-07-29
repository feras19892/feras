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
import NotificationBell from '../components/shared/NotificationBell.vue';
import NotificationToast from '../components/shared/NotificationToast.vue';
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue';
import NameRequestBadge from '../components/shared/NameRequestBadge.vue';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();
if (!auth.isAdmin) { router.push('/home'); }

type Section = 'overview' | 'users' | 'schools' | 'requests' | 'health' | 'settings' | 'export' | 'feedback' | 'audit' | 'chat';
const active = ref<Section>('overview');
const selectedUserId = ref<number | null>(null);
const hovered = ref<string | null>(null);

const dockItems = computed(() => [
  { id: 'overview' as Section, icon: '📊', label: t('admin.dockOverview') },
  { id: 'users' as Section, icon: '👥', label: t('admin.dockUsers') },
  { id: 'schools' as Section, icon: '🏫', label: t('admin.dockSchools') },
  { id: 'requests' as Section, icon: '📋', label: t('admin.dockRequests') },
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
  <div class="admin-shell">
    <!-- Icon Dock -->
    <nav class="dock">
      <div class="dock-brand" @click="router.push('/home')">⚛</div>
      <div class="dock-divider"></div>
      <button
        v-for="item in dockItems"
        :key="item.id"
        :class="['dock-btn', { active: active === item.id }]"
        @click="select(item.id)"
        @mouseenter="hovered = item.id"
        @mouseleave="hovered = null"
      >
        <span class="dock-icon">{{ item.icon }}</span>
        <span v-if="hovered === item.id" class="dock-tooltip">{{ item.label }}</span>
        <span v-if="active === item.id" class="dock-bar"></span>
      </button>
      <div class="dock-spacer"></div>
      <button class="dock-btn" @click="router.push({ path: '/home', query: { view: 'experiments' } })">
        <span class="dock-icon">�</span>
      </button>
    </nav>

    <!-- Main Area -->
    <div class="admin-main">
      <!-- Top Bar -->
      <header class="bar">
        <div class="bar-left">
          <h1 class="bar-title">{{ dockItems.find(i => i.id === active)?.label }}</h1>
          <div class="bar-stats" v-if="stats">
            <span class="bar-stat">👥 {{ users.length }} {{ t('admin.statUsers') }}</span>
            <span class="bar-stat">📚 {{ classes.length }} {{ t('admin.statClasses') }}</span>
            <span class="bar-stat">📄 {{ reports.length }} {{ t('admin.statReports') }}</span>
          </div>
        </div>
        <div class="bar-right">
          <AdminGlobalSearch :users="users" :classes="classes" :reports="reports" :feedback="feedback"
            @select-user="openUserDetail" @select-class="selectClass" @select-report="selectReport" />
          <NameRequestBadge />
          <AccountSettingsModal />
          <NotificationBell />
          <div class="bar-user"><span>�️</span><span class="bar-username">{{ auth.user?.name }}</span></div>
          <button class="bar-logout" @click="auth.logout(); router.push('/')">{{ t('dashboard.logout') }}</button>
        </div>
      </header>

      <!-- Content -->
      <div class="admin-content">
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
          <div v-else-if="active === 'health'" class="panel"><AdminSystemHealth /></div>
          <div v-else-if="active === 'settings'" class="panel"><AdminSystemSettings /></div>
          <div v-else-if="active === 'export'" class="panel"><AdminExportPanel /></div>
          <div v-else-if="active === 'feedback'" class="panel"><AdminFeedbackPanel /></div>
          <div v-else-if="active === 'audit'" class="panel"><AdminAuditLog /></div>
          <div v-else-if="active === 'chat'" class="panel"><AdminChatMonitor /></div>
        </template>
      </div>
    </div>

    <div class="toast-zone">
      <NotificationToast :show="toastShow" :title="toastTitle" :message="toastMessage"
        :type="toastType" :timeout-ms="4500" @close="toastShow = false" />
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
}

/* ═══ Dock ═══ */
.dock {
  width: 64px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.8rem 0;
  gap: 0.3rem;
  background: rgba(10, 15, 28, 0.8);
  border-inline-end: 1px solid rgba(255,255,255,0.04);
  position: sticky;
  top: 0;
  height: 100vh;
}
.dock-brand {
  width: 40px; height: 40px; border-radius: 0.6rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 900; color: #fff; cursor: pointer;
  margin-bottom: 0.3rem;
}
.dock-divider { width: 32px; height: 1px; background: rgba(255,255,255,0.06); margin: 0.3rem 0; }
.dock-btn {
  width: 44px; height: 44px; border-radius: 0.55rem;
  border: none; background: transparent;
  color: #64748b; cursor: pointer; font-size: 1.2rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; position: relative;
}
.dock-btn:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
.dock-btn.active { background: rgba(6,182,212,0.12); color: #67e8f9; }
.dock-bar {
  position: absolute; inset-inline-start: -0.5rem;
  width: 3px; height: 20px; border-radius: 0 2px 2px 0;
  background: #06b6d4;
}
.dock-tooltip {
  position: absolute; inset-inline-start: 52px;
  background: #1e293b; color: #e2e8f0;
  padding: 0.3rem 0.6rem; border-radius: 0.4rem;
  font-size: 0.75rem; font-weight: 600; white-space: nowrap;
  border: 1px solid rgba(255,255,255,0.08); z-index: 200;
}
.dock-spacer { flex: 1; }

/* ═══ Main ═══ */
.admin-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.8rem 1.5rem; gap: 1rem; flex-wrap: wrap;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: rgba(10,15,28,0.5); backdrop-filter: blur(12px);
  position: sticky; top: 0; z-index: 50;
}
.bar-left { display: flex; align-items: center; gap: 1rem; }
.bar-title {
  margin: 0; font-size: 1.15rem; font-weight: 700; color: #f1f5f9;
}
.bar-stats { display: flex; gap: 0.6rem; }
.bar-stat {
  font-size: 0.72rem; color: #64748b;
  padding: 0.2rem 0.5rem; border-radius: 0.35rem;
  background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.04);
}
.bar-right { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
.bar-user {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.25rem 0.55rem; border-radius: 0.4rem;
  background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.05);
  font-size: 0.75rem; color: #f87171;
}
.bar-username { color: #cbd5e1; font-weight: 600; }
.bar-logout {
  padding: 0.3rem 0.65rem; border-radius: 0.4rem;
  border: 1px solid rgba(239,68,68,0.15); background: transparent;
  color: #f87171; cursor: pointer; font-family: inherit;
  font-size: 0.72rem; font-weight: 600; transition: all 0.15s;
}
.bar-logout:hover { background: rgba(239,68,68,0.08); }

.admin-content { flex: 1; padding: 1.5rem; overflow-y: auto; }
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

@media (max-width: 600px) {
  .bar-username { display: none; }
  .bar-stats { display: none; }
}
</style>
