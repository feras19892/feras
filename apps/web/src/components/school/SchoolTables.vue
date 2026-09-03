<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, locale } = useI18n();
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  blockSchoolUser, unblockSchoolUser,
  type SchoolUser, type SchoolClass,
} from '../../services/school.service';
import SchoolApprovalButton from '../shared/SchoolApprovalButton.vue';
import ConfirmModal from '../shared/ConfirmModal.vue';
import SchoolExtraTabs from './SchoolExtraTabs.vue';



interface SchoolReportRow {
  id: number;
  experiment_name: string;
  student_name: string;
  class_name?: string;
  status: string;
  grade?: number | null;
  created_at?: string;
}

interface SchoolSessionRow {
  id: number; user_name: string; user_role: string; ip?: string;
  user_agent?: string; login_at: string; logout_at?: string | null;
}

interface SchoolActivityRow {
  id: number; action: string; actor_name: string; details?: string; created_at: string;
}

interface SchoolWarningRow {
  id: number; title: string; message: string; severity: string;
  user_name: string; user_role: string; created_at: string;
}

const props = defineProps<{
  activeTab: string;
  users: SchoolUser[];
  classes: SchoolClass[];
  reports: SchoolReportRow[];
  sessions: SchoolSessionRow[];
  activityLog: SchoolActivityRow[];
  schoolWarnings: SchoolWarningRow[];
  dateLocaleStr: string;
  freezeLoading: boolean;
}>();

const emit = defineEmits<{
  userRemoved: [number];
  reload: [];
  freeze: [string];
  unfreeze: [string];
}>();
const router = useRouter();

const actionError = ref('');
const actionLoading = ref(false);
const confirmTarget = ref<{ action: 'block' | 'unblock'; userId: number; userName: string } | null>(null);
const userSearch = ref('');
const classSearch = ref('');
const reportSearch = ref('');

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase();
  if (!q) return props.users;
  return props.users.filter(u =>
    u.name?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q)
  );
});

const filteredClasses = computed(() => {
  const q = classSearch.value.trim().toLowerCase();
  if (!q) return props.classes;
  return props.classes.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.code?.toLowerCase().includes(q) ||
    c.teacher_name?.toLowerCase().includes(q)
  );
});

const filteredReports = computed(() => {
  const q = reportSearch.value.trim().toLowerCase();
  if (!q) return props.reports;
  return props.reports.filter(r =>
    r.experiment_name?.toLowerCase().includes(q) ||
    r.student_name?.toLowerCase().includes(q) ||
    r.class_name?.toLowerCase().includes(q)
  );
});

function requestBlock(userId: number, userName: string) {
  confirmTarget.value = { action: 'block', userId, userName };
}

function requestUnblock(userId: number, userName: string) {
  confirmTarget.value = { action: 'unblock', userId, userName };
}

async function executeConfirmedAction() {
  if (!confirmTarget.value) return;
  const { action, userId } = confirmTarget.value;
  actionLoading.value = true;
  actionError.value = '';
  try {
    const res = action === 'block' ? await blockSchoolUser(userId) : await unblockSchoolUser(userId);
    if (res.success) emit('reload');
    else actionError.value = res.message || `Failed to ${action} user`;
  } catch (err) {
    actionError.value = `Failed to ${action} user`;
    if (import.meta.env.DEV) console.error(`${action}User failed:`, err);
  } finally {
    actionLoading.value = false;
    confirmTarget.value = null;
  }
}

function cancelConfirm() {
  confirmTarget.value = null;
}
</script>

<template>
  <div v-if="actionError" class="action-error">⚠️ {{ actionError }}</div>
  <!-- Users Tab -->
  <div v-if="activeTab === 'users'" class="tab-panel">
    <div class="tab-header-row">
      <input v-model="userSearch" class="tab-search" :placeholder="t('school.searchUsers')" />
      <SchoolApprovalButton
        type="user_creation"
        :target-user-id="0"
        target-user-name="New User"
        :label="'+ ' + t('school.requestAddUser')"
      />
    </div>
    <div v-if="filteredUsers.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <p>{{ t('school.noUsers') }}</p>
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>{{ t('school.thName') }}</th>
          <th>{{ t('school.thEmail') }}</th>
          <th>{{ t('school.thRole') }}</th>
          <th>{{ t('school.thStatus') }}</th>
          <th>{{ t('school.thJoined') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in filteredUsers" :key="u.id" class="clickable-row" @click="router.push(`/school/user/${u.id}`)">
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td><span class="role-tag" :class="u.role">{{ u.role === 'teacher' ? '👨‍🏫' : '🎓' }} {{ u.role }}</span></td>
          <td><span v-if="u.blocked_at" class="status-tag blocked">{{ t('school.statusBlocked') }}</span><span v-else class="status-tag active">{{ t('school.statusActive') }}</span></td>
          <td>{{ new Date(u.created_at).toLocaleDateString(dateLocaleStr) }}</td>
          <td class="action-cell" @click.stop>
            <button class="mini-btn view" @click="router.push(`/school/user/${u.id}`)" :title="t('school.btnView')">👁️</button>
            <button v-if="u.blocked_at" class="mini-btn unblock" @click="requestUnblock(u.id, u.name)" :title="t('school.btnUnblock')">🔓</button>
            <button v-else class="mini-btn block" @click="requestBlock(u.id, u.name)" :title="t('school.btnBlock')">🚫</button>
            <SchoolApprovalButton
              type="user_edit"
              :target-user-id="u.id"
              :target-user-name="u.name"
              :metadata="JSON.stringify({ action: 'remove', user_id: u.id, user_email: u.email })"
              label="✕"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Classes Tab -->
  <div v-if="activeTab === 'classes'" class="tab-panel">
    <div class="tab-header-row">
      <input v-model="classSearch" class="tab-search" :placeholder="t('school.searchClasses')" />
      <SchoolApprovalButton
        type="class_creation"
        :target-user-id="0"
        target-user-name="New Class"
        :label="'+ ' + t('school.requestAddClass')"
      />
    </div>
    <div v-if="filteredClasses.length === 0" class="empty-state">
      <div class="empty-icon">🏫</div>
      <p>{{ t('school.noClasses') }}</p>
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>{{ t('school.thClass') }}</th>
          <th>{{ t('school.thCode') }}</th>
          <th>{{ t('school.thTeacher') }}</th>
          <th>{{ t('school.thStudents') }}</th>
          <th>{{ t('school.thCreated') }}</th>
          <th>{{ t('school.thActions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in filteredClasses" :key="c.id" class="clickable-row" @click="router.push(`/school/class/${c.id}`)">
          <td>{{ c.name }}</td>
          <td><code>{{ c.code }}</code></td>
          <td>{{ c.teacher_name }}</td>
          <td>{{ c.student_count }}</td>
          <td>{{ new Date(c.created_at).toLocaleDateString(dateLocaleStr) }}</td>
          <td @click.stop>
            <button v-if="!c.is_frozen" class="freeze-btn" :disabled="freezeLoading" @click="emit('freeze', c.id)" :title="t('school.freezeClass')">{{ t('school.freezeClass') }}</button>
            <button v-else class="unfreeze-btn" :disabled="freezeLoading" @click="emit('unfreeze', c.id)" :title="t('school.unfreezeClass')">{{ t('school.unfreezeClass') }}</button>
            <SchoolApprovalButton
              type="class_edit"
              :target-user-id="0"
              target-user-name="Edit Class"
              :class-id="c.id"
              :metadata="JSON.stringify({ class_id: c.id, class_name: c.name })"
              label="✏️"
            />
            <SchoolApprovalButton
              type="class_deletion"
              :target-user-id="0"
              target-user-name="Class"
              :class-id="c.id"
              :metadata="JSON.stringify({ class_id: c.id, class_name: c.name })"
              label="🗑️"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Reports Tab -->
  <div v-if="activeTab === 'reports'" class="tab-panel">
    <div class="tab-header-row">
      <input v-model="reportSearch" class="tab-search" :placeholder="t('school.searchReports')" />
    </div>
    <div v-if="filteredReports.length === 0" class="empty-state"><div class="empty-icon">📄</div><p>{{ t('school.noReports') }}</p></div>
    <table v-else class="data-table">
      <thead><tr><th>{{ t('school.thExperiment') }}</th><th>{{ t('school.thStudent') }}</th><th>{{ t('school.thClassCol') }}</th><th>{{ t('school.thStatus') }}</th><th>{{ t('school.thGrade') }}</th><th>{{ t('school.thDate') }}</th><th></th></tr></thead>
      <tbody>
        <tr v-for="r in filteredReports" :key="r.id" class="clickable-row" @click="router.push(`/report/${r.id}`)">
          <td>{{ r.experiment_name }}</td>
          <td>{{ r.student_name }}</td>
          <td>{{ r.class_name || '—' }}</td>
          <td><span class="status-tag" :class="r.status">{{ r.status }}</span></td>
          <td>{{ r.grade != null ? r.grade : '—' }}</td>
          <td>{{ r.created_at ? new Date(r.created_at).toLocaleDateString(dateLocaleStr) : '—' }}</td>
          <td @click.stop>
            <button class="mini-btn view" @click="router.push(`/report/${r.id}`)" :title="t('school.btnOpen')">👁️</button>
            <SchoolApprovalButton
              type="report_deletion"
              :target-user-id="0"
              target-user-name="Report"
              :report-id="r.id"
              :metadata="JSON.stringify({ report_id: r.id, experiment_name: r.experiment_name })"
              label="🗑️"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Sessions / Activity / Warnings Tabs -->
  <SchoolExtraTabs
    v-if="['sessions', 'activity', 'warnings'].includes(activeTab)"
    :active-tab="activeTab"
    :sessions="sessions"
    :activity-log="activityLog"
    :school-warnings="schoolWarnings"
    :date-locale-str="dateLocaleStr"
  />

  <!-- Confirmation Modal -->
  <ConfirmModal
    v-if="confirmTarget"
    :open="!!confirmTarget"
    :icon="confirmTarget.action === 'block' ? '🚫' : '🔓'"
    :title="confirmTarget.action === 'block' ? t('school.confirmBlockTitle') : t('school.confirmUnblockTitle')"
    :message="(confirmTarget.action === 'block' ? t('school.confirmBlockMsg') : t('school.confirmUnblockMsg')) + ' <strong>' + confirmTarget.userName + '</strong>؟'"
    :confirm-label="confirmTarget.action === 'block' ? t('school.btnBlock') : t('school.btnUnblock')"
    :cancel-label="t('shared.cancel') || 'إلغاء'"
    :variant="confirmTarget.action === 'block' ? 'danger' : 'success'"
    :loading="actionLoading"
    @confirm="executeConfirmedAction"
    @cancel="cancelConfirm"
  />
</template>

<style scoped src="./school-tables.css"></style>
