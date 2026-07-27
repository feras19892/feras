<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';
import { useI18n } from '../composables/useI18n';
import { useAdmin } from '../composables/useAdmin';
import AdminDashboard from '../components/admin/AdminDashboard.vue';
import AdminUserManager from '../components/admin/AdminUserManager.vue';
import AdminUserDetail from '../components/admin/AdminUserDetail.vue';
import AdminClassManager from '../components/admin/AdminClassManager.vue';
import AdminReportViewer from '../components/admin/AdminReportViewer.vue';
import AdminSmartReports from '../components/admin/AdminSmartReports.vue';
import AdminFeedbackPanel from '../components/admin/AdminFeedbackPanel.vue';
import AdminSystemHealth from '../components/admin/AdminSystemHealth.vue';
import AdminExportPanel from '../components/admin/AdminExportPanel.vue';
import AdminSystemSettings from '../components/admin/AdminSystemSettings.vue';
import AdminChatMonitor from '../components/admin/AdminChatMonitor.vue';
import AdminGlobalSearch from '../components/admin/AdminGlobalSearch.vue';
import AdminAuditLog from '../components/admin/AdminAuditLog.vue';
import NotificationBell from '../components/shared/NotificationBell.vue';
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();

if (!auth.isAdmin) { router.push('/home'); }

const activeSection = ref<'overview' | 'users' | 'classes' | 'reports' | 'smart' | 'feedback' | 'health' | 'export' | 'settings' | 'chat' | 'audit'>('overview');
const selectedUserId = ref<number | null>(null);

const {
  loading, errorMsg,
  users, classes, reports, feedback, stats,
  loadAll,
  handleRemoveUser, handleChangeRole, handleAddUser, handleRemoveClass,
} = useAdmin();

function openUserDetail(id: number) {
  selectedUserId.value = id;
}

function closeUserDetail() {
  selectedUserId.value = null;
}

function selectClass(_id: string) {
  activeSection.value = 'classes';
}

function selectReport(id: number) {
  activeSection.value = 'reports';
  router.push(`/report/${id}`);
}

onMounted(loadAll);
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <div>
        <h1>{{ t('admin.title') }}</h1>
        <span class="subtitle">{{ t('admin.subtitle') }}</span>
      </div>
      <AdminGlobalSearch
        :users="users"
        :classes="classes"
        :reports="reports"
        :feedback="feedback"
        @select-user="openUserDetail"
        @select-class="selectClass"
        @select-report="selectReport"
      />
      <div class="admin-header-right">
        <AccountSettingsModal />
        <NotificationBell />
        <button class="btn-experiments" @click="router.push({ path: '/home', query: { view: 'experiments' } })">🔬 {{ t('admin.experiments') }}</button>
      </div>
    </div>

    <div class="admin-nav">
      <button :class="{ active: activeSection === 'overview' }" @click="activeSection = 'overview'">
        {{ t('admin.overview') }}
      </button>
      <button :class="{ active: activeSection === 'users' }" @click="activeSection = 'users'">
        {{ t('admin.users', { count: users.length }) }}
      </button>
      <button :class="{ active: activeSection === 'classes' }" @click="activeSection = 'classes'">
        {{ t('admin.classes', { count: classes.length }) }}
      </button>
      <button :class="{ active: activeSection === 'reports' }" @click="activeSection = 'reports'">
        {{ t('admin.reports', { count: reports.length }) }}
      </button>
      <button :class="{ active: activeSection === 'smart' }" @click="activeSection = 'smart'">
        {{ t('admin.smart') }}
      </button>
      <button :class="{ active: activeSection === 'feedback' }" @click="activeSection = 'feedback'">
        {{ t('admin.feedback') }}
      </button>
      <button :class="{ active: activeSection === 'health' }" @click="activeSection = 'health'">
        {{ t('admin.health') }}
      </button>
      <button :class="{ active: activeSection === 'export' }" @click="activeSection = 'export'">
        {{ t('admin.export') }}
      </button>
      <button :class="{ active: activeSection === 'settings' }" @click="activeSection = 'settings'">
        {{ t('admin.settings') }}
      </button>
      <button :class="{ active: activeSection === 'chat' }" @click="activeSection = 'chat'">
        {{ t('admin.chatMonitor') }}
      </button>
      <button :class="{ active: activeSection === 'audit' }" @click="activeSection = 'audit'">
        {{ t('admin.auditLog') }}
      </button>
    </div>

    <div v-if="loading" class="loading"><div class="admin-spinner"></div></div>
    <div v-else-if="errorMsg" class="error-box">❌ {{ errorMsg }}</div>

    <template v-else-if="stats">
      <AdminDashboard v-if="activeSection === 'overview'" />
      <template v-else-if="activeSection === 'users'">
        <AdminUserDetail
          v-if="selectedUserId"
          :user-id="selectedUserId"
          @back="closeUserDetail"
          @refresh="loadAll"
        />
        <AdminUserManager
          v-else
          :users="users"
          @refresh="loadAll"
          @delete="handleRemoveUser"
          @change-role="handleChangeRole"
          @add="handleAddUser"
          @view="openUserDetail"
        />
      </template>
      <AdminClassManager
        v-else-if="activeSection === 'classes'"
        :classes="classes"
        @delete="handleRemoveClass"
        @refresh="loadAll"
      />
      <AdminReportViewer
        v-else-if="activeSection === 'reports'"
        :reports="reports"
        @refresh="loadAll"
      />
      <AdminSmartReports v-else-if="activeSection === 'smart'" />
      <AdminFeedbackPanel v-else-if="activeSection === 'feedback'" />
      <AdminSystemHealth v-else-if="activeSection === 'health'" />
      <AdminExportPanel v-else-if="activeSection === 'export'" />
      <AdminSystemSettings v-else-if="activeSection === 'settings'" />
      <AdminChatMonitor v-else-if="activeSection === 'chat'" />
      <AdminAuditLog v-else-if="activeSection === 'audit'" />
    </template>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
  padding: 1.5rem;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  gap: 1rem;
  flex-wrap: wrap;
}
.admin-header h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #f87171, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.subtitle { font-size: 0.8rem; color: #64748b; }
.admin-header-right { display: flex; align-items: center; gap: 0.75rem; }
.btn-experiments {
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(99,102,241,0.3);
  background: rgba(99,102,241,0.1);
  color: #a5b4fc;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  transition: all 0.15s;
}
.btn-experiments:hover { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.5); }

.admin-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.admin-nav button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(15,23,42,0.6);
  color: #94a3b8;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: all 0.2s;
}
.admin-nav button.active {
  background: rgba(99,102,241,0.2);
  color: #a5b4fc;
  border-color: rgba(99,102,241,0.3);
}
.admin-nav button:hover:not(.active) { border-color: rgba(255,255,255,0.15); }

.loading { text-align: center; padding: 3rem; color: #64748b; }
.admin-spinner { width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #818cf8; border-radius: 50%; animation: admin-spin 0.8s linear infinite; margin: 0 auto; }
@keyframes admin-spin { to { transform: rotate(360deg); } }
.error-box { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(239,68,68,0.2); text-align: center; margin-bottom: 1rem; }
</style>
