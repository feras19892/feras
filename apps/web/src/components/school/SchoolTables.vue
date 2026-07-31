<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useRouter } from 'vue-router';
import {
  removeSchoolUser, blockSchoolUser, unblockSchoolUser,
  type SchoolUser, type SchoolClass,
} from '../../services/school.service';

interface SchoolReportRow {
  id: number;
  experiment_name: string;
  student_name: string;
  class_name?: string;
  status: string;
  grade?: number | null;
  created_at: string;
}

interface SchoolSessionRow {
  id: number;
  user_name: string;
  user_role: string;
  ip?: string;
  user_agent?: string;
  login_at: string;
  logout_at?: string | null;
}

interface SchoolActivityRow {
  id: number;
  action: string;
  actor_name: string;
  details?: string;
  created_at: string;
}

interface SchoolWarningRow {
  id: number;
  title: string;
  message: string;
  severity: string;
  user_name: string;
  user_role: string;
  created_at: string;
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

const { t } = useI18n();
const router = useRouter();

const actionError = ref('');

async function handleRemoveUser(userId: number) {
  if (!confirm(t('school.confirmRemoveUser'))) return;
  actionError.value = '';
  try {
    const res = await removeSchoolUser(userId);
    if (res.success) emit('userRemoved', userId);
    else actionError.value = res.message || 'Failed to remove user';
  } catch (err) {
    actionError.value = 'Failed to remove user';
    if (import.meta.env.DEV) console.error('removeUser failed:', err);
  }
}

async function handleBlockUser(userId: number) {
  actionError.value = '';
  try {
    const res = await blockSchoolUser(userId);
    if (res.success) emit('reload');
    else actionError.value = res.message || 'Failed to block user';
  } catch (err) {
    actionError.value = 'Failed to block user';
    if (import.meta.env.DEV) console.error('blockUser failed:', err);
  }
}

async function handleUnblockUser(userId: number) {
  actionError.value = '';
  try {
    const res = await unblockSchoolUser(userId);
    if (res.success) emit('reload');
    else actionError.value = res.message || 'Failed to unblock user';
  } catch (err) {
    actionError.value = 'Failed to unblock user';
    if (import.meta.env.DEV) console.error('unblockUser failed:', err);
  }
}
</script>

<template>
  <div v-if="actionError" class="action-error">⚠️ {{ actionError }}</div>
  <!-- Users Tab -->
  <div v-if="activeTab === 'users'" class="tab-panel">
    <div v-if="users.length === 0" class="empty-state">
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
        <tr v-for="u in users" :key="u.id" class="clickable-row" @click="router.push(`/school/user/${u.id}`)">
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td><span class="role-tag" :class="u.role">{{ u.role === 'teacher' ? '👨‍🏫' : '🎓' }} {{ u.role }}</span></td>
          <td><span v-if="u.blocked_at" class="status-tag blocked">{{ t('school.statusBlocked') }}</span><span v-else class="status-tag active">{{ t('school.statusActive') }}</span></td>
          <td>{{ new Date(u.created_at).toLocaleDateString(dateLocaleStr) }}</td>
          <td class="action-cell" @click.stop>
            <button class="mini-btn view" @click="router.push(`/school/user/${u.id}`)" :title="t('school.btnView')">👁️</button>
            <button v-if="u.blocked_at" class="mini-btn unblock" @click="handleUnblockUser(u.id)" :title="t('school.btnUnblock')">🔓</button>
            <button v-else class="mini-btn block" @click="handleBlockUser(u.id)" :title="t('school.btnBlock')">🚫</button>
            <button class="mini-btn remove" @click="handleRemoveUser(u.id)" :title="t('school.btnRemove')">✕</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Classes Tab -->
  <div v-if="activeTab === 'classes'" class="tab-panel">
    <div v-if="classes.length === 0" class="empty-state">
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
        <tr v-for="c in classes" :key="c.id" class="clickable-row" @click="router.push(`/school/class/${c.id}`)">
          <td>{{ c.name }}</td>
          <td><code>{{ c.code }}</code></td>
          <td>{{ c.teacher_name }}</td>
          <td>{{ c.student_count }}</td>
          <td>{{ new Date(c.created_at).toLocaleDateString(dateLocaleStr) }}</td>
          <td @click.stop>
            <button v-if="!c.is_frozen" class="freeze-btn" :disabled="freezeLoading" @click="emit('freeze', c.id)" :title="t('school.freezeClass')">{{ t('school.freezeClass') }}</button>
            <button v-else class="unfreeze-btn" :disabled="freezeLoading" @click="emit('unfreeze', c.id)" :title="t('school.unfreezeClass')">{{ t('school.unfreezeClass') }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Reports Tab -->
  <div v-if="activeTab === 'reports'" class="tab-panel">
    <div v-if="reports.length === 0" class="empty-state"><div class="empty-icon">📄</div><p>{{ t('school.noReports') }}</p></div>
    <table v-else class="data-table">
      <thead><tr><th>{{ t('school.thExperiment') }}</th><th>{{ t('school.thStudent') }}</th><th>{{ t('school.thClassCol') }}</th><th>{{ t('school.thStatus') }}</th><th>{{ t('school.thGrade') }}</th><th>{{ t('school.thDate') }}</th><th></th></tr></thead>
      <tbody>
        <tr v-for="r in reports" :key="r.id" class="clickable-row" @click="router.push(`/report/${r.id}`)">
          <td>{{ r.experiment_name }}</td>
          <td>{{ r.student_name }}</td>
          <td>{{ r.class_name || '—' }}</td>
          <td><span class="status-tag" :class="r.status">{{ r.status }}</span></td>
          <td>{{ r.grade != null ? r.grade : '—' }}</td>
          <td>{{ new Date(r.created_at).toLocaleDateString(dateLocaleStr) }}</td>
          <td @click.stop><button class="mini-btn view" @click="router.push(`/report/${r.id}`)" :title="t('school.btnOpen')">👁️</button></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Sessions Tab -->
  <div v-if="activeTab === 'sessions'" class="tab-panel">
    <div v-if="sessions.length === 0" class="empty-state"><div class="empty-icon">🔑</div><p>{{ t('school.noSessions') }}</p></div>
    <table v-else class="data-table">
      <thead><tr><th>{{ t('school.thUser') }}</th><th>{{ t('school.thRole') }}</th><th>{{ t('school.thIP') }}</th><th>{{ t('school.thBrowser') }}</th><th>{{ t('school.thLogin') }}</th><th>{{ t('school.thLogout') }}</th></tr></thead>
      <tbody>
        <tr v-for="s in sessions" :key="s.id">
          <td>{{ s.user_name }}</td>
          <td><span class="role-tag" :class="s.user_role">{{ s.user_role === 'teacher' ? '👨‍🏫' : '🎓' }} {{ s.user_role }}</span></td>
          <td>{{ s.ip || '—' }}</td>
          <td class="ua-cell">{{ s.user_agent || '—' }}</td>
          <td>{{ new Date(s.login_at).toLocaleString(dateLocaleStr) }}</td>
          <td>{{ s.logout_at ? new Date(s.logout_at).toLocaleString(dateLocaleStr) : t('school.sessionActive') }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Activity Tab -->
  <div v-if="activeTab === 'activity'" class="tab-panel">
    <div v-if="activityLog.length === 0" class="empty-state"><div class="empty-icon">📝</div><p>{{ t('school.noActivity') }}</p></div>
    <div v-else class="activity-list">
      <div v-for="a in activityLog" :key="a.id" class="activity-item">
        <div class="activity-dot"></div>
        <div class="activity-body">
          <span class="activity-action">{{ a.action }}</span>
          <span class="activity-actor">{{ a.actor_name }}</span>
          <span class="activity-details">{{ a.details }}</span>
          <span class="activity-date">{{ new Date(a.created_at).toLocaleString(dateLocaleStr) }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Warnings Tab -->
  <div v-if="activeTab === 'warnings'" class="tab-panel">
    <div v-if="schoolWarnings.length === 0" class="empty-state"><div class="empty-icon">⚠️</div><p>{{ t('school.noWarnings') }}</p></div>
    <div v-else class="warnings-list">
      <div v-for="w in schoolWarnings" :key="w.id" class="warning-card" :class="w.severity">
        <div class="warning-header">
          <span class="warning-sev" :class="w.severity">{{ w.severity }}</span>
          <span class="warning-title">{{ w.title }}</span>
          <span class="warning-user">{{ w.user_name }} ({{ w.user_role }})</span>
        </div>
        <p class="warning-msg">{{ w.message }}</p>
        <span class="warning-date">{{ new Date(w.created_at).toLocaleString(dateLocaleStr) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: start; padding: 0.6rem 0.8rem; font-size: 0.8rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.06); }
.data-table td { padding: 0.6rem 0.8rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.clickable-row { cursor: pointer; transition: background 0.12s; }
.clickable-row:hover { background: rgba(6,182,212,0.06); }
.role-tag { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; }
.role-tag.teacher { background: rgba(129,140,248,0.15); color: #a5b4fc; }
.role-tag.student { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-tag { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; }
.status-tag.active { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-tag.blocked { background: rgba(239,68,68,0.15); color: #f87171; }
.status-tag.submitted { background: rgba(59,130,246,0.15); color: #60a5fa; }
.status-tag.graded { background: rgba(168,85,247,0.15); color: #c084fc; }
.status-tag.draft { background: rgba(100,116,139,0.15); color: #94a3b8; }
.action-cell { display: flex; gap: 0.3rem; }
.mini-btn { width: 28px; height: 28px; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); cursor: pointer; font-size: 0.8rem; }
.mini-btn.view:hover { background: rgba(6,182,212,0.15); border-color: rgba(6,182,212,0.3); }
.mini-btn.block:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); }
.mini-btn.unblock:hover { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); }
.mini-btn.remove:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); }
.ua-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #475569; font-size: 0.72rem; }
.freeze-btn { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); border-radius: 0.3rem; padding: 0.2rem 0.5rem; font-size: 0.72rem; cursor: pointer; }
.freeze-btn:hover { background: rgba(59,130,246,0.25); }
.freeze-btn:disabled { opacity: 0.4; }
.unfreeze-btn { background: rgba(249,115,22,0.15); color: #fb923c; border: 1px solid rgba(249,115,22,0.3); border-radius: 0.3rem; padding: 0.2rem 0.5rem; font-size: 0.72rem; cursor: pointer; }
.unfreeze-btn:hover { background: rgba(249,115,22,0.25); }
.unfreeze-btn:disabled { opacity: 0.4; }
.activity-list { display: flex; flex-direction: column; gap: 0.5rem; }
.activity-item { display: flex; gap: 0.6rem; align-items: flex-start; }
.activity-dot { width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; margin-top: 0.35rem; flex-shrink: 0; }
.activity-body { flex: 1; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.04); border-radius: 0.4rem; padding: 0.5rem 0.7rem; }
.activity-action { font-size: 0.82rem; font-weight: 700; color: #67e8f9; display: block; }
.activity-actor { font-size: 0.75rem; color: #94a3b8; display: inline-block; margin-inline-start: 0.3rem; }
.activity-details { font-size: 0.78rem; color: #94a3b8; display: block; margin-top: 0.15rem; }
.activity-date { font-size: 0.68rem; color: #475569; display: block; margin-top: 0.2rem; }
.warnings-list { display: flex; flex-direction: column; gap: 0.5rem; }
.warning-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.7rem; }
.warning-card.high { border-color: rgba(245,158,11,0.2); }
.warning-card.critical { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.04); }
.warning-header { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.3rem; }
.warning-sev { padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.65rem; font-weight: 700; }
.warning-sev.low { background: rgba(100,116,139,0.2); color: #94a3b8; }
.warning-sev.normal { background: rgba(6,182,212,0.15); color: #67e8f9; }
.warning-sev.high { background: rgba(245,158,11,0.15); color: #fcd34d; }
.warning-sev.critical { background: rgba(239,68,68,0.15); color: #fca5a5; }
.warning-title { font-size: 0.82rem; font-weight: 700; color: #f1f5f9; }
.warning-user { font-size: 0.72rem; color: #64748b; margin-inline-start: auto; }
.warning-msg { font-size: 0.78rem; color: #94a3b8; margin: 0.2rem 0; }
.warning-date { font-size: 0.68rem; color: #475569; }
.empty-state { text-align: center; padding: 3rem; color: #64748b; }
.empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
.action-error { background: rgba(239,68,68,0.1); color: #f87171; padding: 0.6rem 1rem; border-radius: 0.5rem; border: 1px solid rgba(239,68,68,0.2); margin-bottom: 0.8rem; font-size: 0.85rem; }
</style>
