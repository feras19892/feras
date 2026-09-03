<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, onMounted } from 'vue';
import { useConfirmDialog } from '../../composables/useConfirmDialog';
import { useAdminUserDetail } from '../../composables/admin/useAdminUserDetail';
import { impersonateUser } from '../../services/admin.service';
import { setTokens } from '../../services/http';
import AdminDirectMessage from './AdminDirectMessage.vue';
import UserDetailModals from './UserDetailModals.vue';
const props = defineProps<{ userId: number }>();
const emit = defineEmits<{ (e: 'back'): void; (e: 'refresh'): void }>();
const { profile, loading, error, load, ban, unban, addNote } = useAdminUserDetail();

const showWarnModal = ref(false);
const showResetModal = ref(false);
const showEditModal = ref(false);
const showChatModal = ref(false);
const newNote = ref('');

async function onBan() {
  const reason = prompt(t('adminUser.banReasonPrompt'));
  if (!reason) return;
  await ban(props.userId, reason);
  emit('refresh');
}

const { confirmDialog } = useConfirmDialog();

async function onUnban() {
  const ok = await confirmDialog({ message: t('adminUser.unbanConfirm'), variant: 'success' });
  if (!ok) return;
  await unban(props.userId);
  emit('refresh');
}

async function onImpersonate() {
  const ok = await confirmDialog({ message: `${t('adminUser.impersonateConfirm')} ${profile.value?.user?.name}?\n${t('adminUser.willLogoutAdmin')}`, variant: 'danger' });
  if (!ok) return;
  const password = prompt(t('adminUser.impersonateConfirm') + ' — ' + t('account.confirmPassword') + ':');
  if (!password) return;
  try {
    const res = await impersonateUser(props.userId, password);
    if (res.success && res.token) { setTokens(res.token, res.refreshToken); localStorage.setItem('auth_user', JSON.stringify(res.user)); localStorage.removeItem('school_session'); window.location.href = `/#/${res.user.role}`; }
  } catch {
    await confirmDialog({ message: t('auth.errors.invalidCredentials'), variant: 'danger', icon: '⚠️' });
  }
}

async function onAddNote() {
  if (!newNote.value.trim()) return;
  await addNote(props.userId, newNote.value);
  newNote.value = '';
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
      <div class="user-header">
        <div>
          <h2>{{ profile.user.name }}</h2>
          <p class="email">{{ profile.user.email }}</p>
          <span class="role-badge" :class="profile.user.role">{{ profile.user.role }}</span>
          <span v-if="profile.user.blocked_at" class="banned-badge">{{ t('adminUser.banned') }}</span>
        </div>
        <div class="actions">
          <button class="btn-edit" @click="showEditModal = true">{{ t('adminUser.editProfile') }}</button>
          <button class="btn-impersonate" @click="onImpersonate">{{ t('adminUser.impersonate') }}</button>
          <button class="btn-reset" @click="showResetModal = true">{{ t('adminUser.resetPassword') }}</button>
          <button v-if="!profile.user.blocked_at" class="btn-ban" @click="onBan">{{ t('adminUser.ban') }}</button>
          <button v-else class="btn-unban" @click="onUnban">{{ t('adminUser.unban') }}</button>
          <button class="btn-warn" @click="showWarnModal = true">{{ t('adminUser.warn') }}</button>
          <button class="btn-chat" @click="showChatModal = true">{{ t('adminExtras.udMessage') }}</button>
        </div>
      </div>

      <UserDetailModals
        :user-id="props.userId"
        :show-warn="showWarnModal"
        :show-reset="showResetModal"
        :show-edit="showEditModal"
        :user-name="profile.user.name"
        :user-email="profile.user.email"
        @close-warn="showWarnModal = false"
        @close-reset="showResetModal = false"
        @close-edit="showEditModal = false"
        @refresh="emit('refresh')"
      />

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
            <li v-for="r in profile.reports" :key="r.id">{{ r.experiment_name }} — {{ r.status }} {{ r.grade ? `(${t('adminUser.grade')}: ${r.grade})` : '' }}</li>
          </ul>
          <p v-else class="empty">{{ t('adminUser.noReports') }}</p>
        </div>
        <div class="info-card">
          <h4>{{ t('adminUser.warnings') }} ({{ profile.warnings?.length ?? 0 }})</h4>
          <ul v-if="profile.warnings?.length">
            <li v-for="w in profile.warnings" :key="w.id" :class="w.severity">{{ w.title }} ({{ w.severity }}) {{ w.is_read ? '✓' : '●' }}</li>
          </ul>
          <p v-else class="empty">{{ t('adminUser.noWarnings') }}</p>
        </div>
        <div class="info-card">
          <h4>{{ t('adminUser.adminNotes') }}</h4>
          <ul v-if="profile.notes?.length">
            <li v-for="n in profile.notes" :key="n.id"><strong>{{ n.admin_name }}:</strong> {{ n.note }} <small>{{ formatDate(n.created_at) }}</small></li>
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
            <li v-for="a in profile.activity" :key="a.created_at">{{ a.action }} {{ a.details ? `— ${a.details}` : '' }} <small>{{ formatDate(a.created_at) }}</small></li>
          </ul>
          <p v-else class="empty">{{ t('adminUser.noActivity') }}</p>
        </div>
      </div>
    </template>

    <AdminDirectMessage v-if="showChatModal && profile?.user" :user-id="profile.user.id" :user-name="profile.user.name" @close="showChatModal = false" />
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
.btn-chat { background: rgba(6,182,212,0.15); color: #67e8f9; }
.btn-impersonate { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.btn-reset { background: rgba(103,232,249,0.15); color: #67e8f9; }
.btn-edit { background: rgba(251,191,36,0.15); color: #fbbf24; }
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
