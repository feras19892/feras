<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAdminUserDetail } from '../../composables/admin/useAdminUserDetail';
import { impersonateUser, resetUserPassword, updateAdminUser } from '../../services/admin.service';

const props = defineProps<{
  userId: number;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'refresh'): void;
}>();

const { t } = useI18n();
const { profile, loading, error, load, ban, unban, sendWarning, addNote } = useAdminUserDetail();

const showWarnModal = ref(false);
const warnTitle = ref('');
const warnMsg = ref('');
const warnSeverity = ref<'low'|'normal'|'high'|'critical'>('normal');
const newNote = ref('');
const sending = ref(false);
const showResetModal = ref(false);
const newPassword = ref('');
const resetLoading = ref(false);
const showEditModal = ref(false);
const editName = ref('');
const editEmail = ref('');
const editLoading = ref(false);
const editError = ref('');

async function onBan() {
  const reason = prompt(t('adminUser.banReasonPrompt'));
  if (!reason) return;
  await ban(props.userId, reason);
  emit('refresh');
}

async function onUnban() {
  if (!confirm(t('adminUser.unbanConfirm'))) return;
  await unban(props.userId);
  emit('refresh');
}

async function onImpersonate() {
  if (!confirm(`${t('adminUser.impersonateConfirm')} ${profile.value?.user?.name}?\n${t('adminUser.willLogoutAdmin')}`)) return;
  const res = await impersonateUser(props.userId);
  if (res.success) {
    window.location.href = '/home';
  }
}

async function onResetPassword() {
  if (!newPassword.value || newPassword.value.length < 6) { alert(t('adminUser.passwordMin')); return; }
  resetLoading.value = true;
  const res = await resetUserPassword(props.userId, newPassword.value);
  resetLoading.value = false;
  if (res.success) {
    showResetModal.value = false;
    newPassword.value = '';
    alert(t('adminUser.passwordResetSuccess'));
  }
}

async function onSendWarning() {
  sending.value = true;
  await sendWarning(props.userId, warnTitle.value, warnMsg.value, warnSeverity.value);
  sending.value = false;
  showWarnModal.value = false;
  warnTitle.value = '';
  warnMsg.value = '';
}

async function onAddNote() {
  if (!newNote.value.trim()) return;
  await addNote(props.userId, newNote.value);
  newNote.value = '';
}

async function onEditUser() {
  if (!editName.value.trim() || !editEmail.value.trim()) { editError.value = t('adminUser.fillFields'); return; }
  editLoading.value = true;
  editError.value = '';
  try {
    const res = await updateAdminUser(props.userId, { name: editName.value.trim(), email: editEmail.value.trim() });
    if (!res.success) { editError.value = res.message || 'Failed'; }
    else { showEditModal.value = false; await load(props.userId); emit('refresh'); }
  } catch (err: unknown) {
    editError.value = (err instanceof Error ? err.message : '') || 'Failed';
  } finally { editLoading.value = false; }
}

function openEditModal() {
  if (profile.value?.user) {
    editName.value = profile.value.user.name;
    editEmail.value = profile.value.user.email;
  }
  editError.value = '';
  showEditModal.value = true;
}

function formatDate(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString() : '—';
}

onMounted(() => load(props.userId));
</script>

<template>
  <div class="user-detail">
    <button class="back-btn" @click="$emit('back')">{{ t('adminUser.back') }}</button>

    <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>
    <template v-else-if="profile?.user">
      <!-- Header -->
      <div class="user-header">
        <div>
          <h2>{{ profile.user.name }}</h2>
          <p class="email">{{ profile.user.email }}</p>
          <span class="role-badge" :class="profile.user.role">{{ profile.user.role }}</span>
          <span v-if="profile.user.blocked_at" class="banned-badge">{{ t('adminUser.banned') }}</span>
        </div>
        <div class="actions">
          <button class="btn-edit" @click="openEditModal">{{ t('adminUser.editProfile') }}</button>
          <button class="btn-impersonate" @click="onImpersonate">{{ t('adminUser.impersonate') }}</button>
          <button class="btn-reset" @click="showResetModal = true">{{ t('adminUser.resetPassword') }}</button>
          <button v-if="!profile.user.blocked_at" class="btn-ban" @click="onBan">{{ t('adminUser.ban') }}</button>
          <button v-else class="btn-unban" @click="onUnban">{{ t('adminUser.unban') }}</button>
          <button class="btn-warn" @click="showWarnModal = true">{{ t('adminUser.warn') }}</button>
        </div>
      </div>

      <!-- Warning Modal -->
      <div v-if="showWarnModal" class="modal-overlay" @click.self="showWarnModal = false">
        <div class="modal">
          <h4>{{ t('adminUser.sendWarning') }}</h4>
          <input v-model="warnTitle" :placeholder="t('adminUser.warningTitle')" />
          <textarea v-model="warnMsg" rows="3" :placeholder="t('adminUser.warningMessage')"></textarea>
          <select v-model="warnSeverity">
            <option value="low">{{ t('adminUser.severityLow') }}</option>
            <option value="normal">{{ t('adminUser.severityNormal') }}</option>
            <option value="high">{{ t('adminUser.severityHigh') }}</option>
            <option value="critical">{{ t('adminUser.severityCritical') }}</option>
          </select>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showWarnModal = false">{{ t('common.cancel') }}</button>
            <button class="btn-submit" :disabled="sending" @click="onSendWarning">{{ sending ? '...' : t('common.send') }}</button>
          </div>
        </div>
      </div>

      <!-- Reset Password Modal -->
      <div v-if="showResetModal" class="modal-overlay" @click.self="showResetModal = false">
        <div class="modal">
          <h4>{{ t('adminUser.resetPassword') }}</h4>
          <input v-model="newPassword" type="password" :placeholder="t('adminUser.newPassword')" />
          <div class="modal-actions">
            <button class="btn-cancel" @click="showResetModal = false">{{ t('common.cancel') }}</button>
            <button class="btn-submit" :disabled="resetLoading" @click="onResetPassword">{{ resetLoading ? '...' : t('adminUser.setPassword') }}</button>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal">
          <h4>{{ t('adminUser.editProfile') }}</h4>
          <div class="form-row">
            <label>{{ t('admin.name') }}</label>
            <input v-model="editName" />
          </div>
          <div class="form-row">
            <label>{{ t('adminUser.email') }}</label>
            <input v-model="editEmail" type="email" />
          </div>
          <p v-if="editError" class="msg error">{{ editError }}</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showEditModal = false">{{ t('common.cancel') }}</button>
            <button class="btn-submit" :disabled="editLoading" @click="onEditUser">{{ editLoading ? '...' : t('common.save') }}</button>
          </div>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="info-grid">
        <div class="info-card">
          <h4>{{ t('adminUser.info') }}</h4>
          <p><strong>{{ t('adminUser.id') }}:</strong> {{ profile.user.id }}</p>
          <p><strong>{{ t('adminUser.email') }}:</strong> {{ profile.user.email }}</p>
          <p><strong>{{ t('adminUser.role') }}:</strong> {{ profile.user.role }}</p>
          <p><strong>{{ t('adminUser.since') }}:</strong> {{ formatDate(profile.user.created_at) }}</p>
          <p><strong>{{ t('adminUser.emailVerified') }}:</strong> {{ formatDate(profile.user.email_verified_at) }}</p>
          <p v-if="profile.user.blocked_at"><strong>{{ t('adminUser.bannedSince') }}:</strong> {{ formatDate(profile.user.blocked_at) }}</p>
          <p v-if="profile.user.block_reason"><strong>{{ t('adminUser.banReason') }}:</strong> {{ profile.user.block_reason }}</p>
        </div>

        <div class="info-card">
          <h4>{{ t('adminUser.classes') }} ({{ profile.classes?.length ?? 0 }})</h4>
          <ul v-if="profile.classes?.length">
            <li v-for="c in profile.classes" :key="c.id">{{ c.name }} ({{ c.student_count }} {{ t('adminUser.studentUnit') }})</li>
          </ul>
          <p v-else class="empty">{{ t('adminUser.noClasses') }}</p>
        </div>

        <div class="info-card">
          <h4>{{ t('adminUser.reports') }} ({{ profile.reports?.length ?? 0 }})</h4>
          <ul v-if="profile.reports?.length">
            <li v-for="r in profile.reports" :key="r.id">
              {{ r.experiment_name }} — {{ r.status }} {{ r.grade ? `(${t('adminUser.grade')}: ${r.grade})` : '' }}
            </li>
          </ul>
          <p v-else class="empty">{{ t('adminUser.noReports') }}</p>
        </div>

        <div class="info-card">
          <h4>{{ t('adminUser.warnings') }} ({{ profile.warnings?.length ?? 0 }})</h4>
          <ul v-if="profile.warnings?.length">
            <li v-for="w in profile.warnings" :key="w.id" :class="w.severity">
              {{ w.title }} ({{ w.severity }}) {{ w.is_read ? '✓' : '●' }}
            </li>
          </ul>
          <p v-else class="empty">{{ t('adminUser.noWarnings') }}</p>
        </div>

        <div class="info-card">
          <h4>{{ t('adminUser.adminNotes') }}</h4>
          <ul v-if="profile.notes?.length">
            <li v-for="n in profile.notes" :key="n.id">
              <strong>{{ n.admin_name }}:</strong> {{ n.note }} <small>{{ formatDate(n.created_at) }}</small>
            </li>
          </ul>
          <p v-else class="empty">{{ t('adminUser.noNotes') }}</p>
          <div class="note-input">
            <input v-model="newNote" :placeholder="t('adminUser.addNotePlaceholder')" @keyup.enter="onAddNote" />
            <button @click="onAddNote">+</button>
          </div>
        </div>

        <div class="info-card full">
          <h4>{{ t('adminUser.recentActivity') }}</h4>
          <ul v-if="profile.activity?.length">
            <li v-for="a in profile.activity" :key="a.created_at">
              {{ a.action }} {{ a.details ? `— ${a.details}` : '' }} <small>{{ formatDate(a.created_at) }}</small>
            </li>
          </ul>
          <p v-else class="empty">{{ t('adminUser.noActivity') }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.user-detail { color: #e2e8f0; }
.back-btn { background: none; border: none; color: #67e8f9; cursor: pointer; font-size: 0.9rem; margin-bottom: 1rem; padding: 0; }
.loading { text-align: center; padding: 2rem; color: #64748b; }
.error { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }

.user-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.user-header h2 { margin: 0; font-size: 1.3rem; }
.email { margin: 0.2rem 0; color: #94a3b8; font-size: 0.85rem; }
.role-badge { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; font-weight: 700; margin-inline-start: 0.5rem; }
.role-badge.admin { background: rgba(248,113,113,0.2); color: #f87171; }
.role-badge.teacher { background: rgba(96,165,250,0.2); color: #60a5fa; }
.role-badge.student { background: rgba(52,211,153,0.2); color: #34d399; }
.banned-badge { background: rgba(239,68,68,0.2); color: #f87171; padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; }
.actions { display: flex; gap: 0.5rem; }
.actions button { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: none; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.8rem; }
.btn-ban { background: rgba(239,68,68,0.15); color: #f87171; }
.btn-unban { background: rgba(52,211,153,0.15); color: #34d399; }
.btn-warn { background: rgba(251,191,36,0.15); color: #fbbf24; }
.btn-impersonate { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.btn-reset { background: rgba(103,232,249,0.15); color: #67e8f9; }
.btn-edit { background: rgba(251,191,36,0.15); color: #fbbf24; }
.form-row { margin-bottom: 0.75rem; }
.form-row label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.25rem; }
.form-row input { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; box-sizing: border-box; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.5rem; width: 100%; max-width: 420px; }
.modal h4 { margin: 0 0 1rem; color: #e2e8f0; }
.modal input, .modal textarea, .modal select { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; margin-bottom: 0.5rem; box-sizing: border-box; }
.modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.modal-actions button { flex: 1; padding: 0.55rem; border-radius: 0.5rem; font-family: inherit; font-weight: 700; cursor: pointer; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
.info-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; }
.info-card.full { grid-column: 1 / -1; }
.info-card h4 { margin: 0 0 0.75rem; font-size: 0.95rem; color: #a5b4fc; }
.info-card p { margin: 0.3rem 0; font-size: 0.85rem; }
.info-card ul { margin: 0; padding-inline-start: 1.2rem; font-size: 0.85rem; }
.info-card li { margin-bottom: 0.3rem; }
.info-card li.low { color: #94a3b8; }
.info-card li.normal { color: #fbbf24; }
.info-card li.high { color: #fb923c; }
.info-card li.critical { color: #f87171; font-weight: 700; }
.empty { color: #64748b; font-style: italic; }
.note-input { display: flex; gap: 0.4rem; margin-top: 0.5rem; }
.note-input input { flex: 1; padding: 0.4rem; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; }
.note-input button { padding: 0.4rem 0.7rem; border-radius: 0.35rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-weight: 700; }
small { color: #64748b; font-size: 0.75rem; }
</style>
