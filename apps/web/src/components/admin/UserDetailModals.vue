<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useConfirmDialog } from '../../composables/useConfirmDialog';
import { resetUserPassword, updateAdminUser, sendAdminWarning } from '../../services/admin.service';

const props = defineProps<{
  userId: number
  showWarn: boolean
  showReset: boolean
  showEdit: boolean
  userName: string
  userEmail: string
}>();

const emit = defineEmits<{
  (e: 'close-warn'): void
  (e: 'close-reset'): void
  (e: 'close-edit'): void
  (e: 'refresh'): void
}>();

const { t } = useI18n();

const warnTitle = ref('');
const warnMsg = ref('');
const warnSeverity = ref<'low'|'normal'|'high'|'critical'>('normal');
const sending = ref(false);
const newPassword = ref('');
const resetLoading = ref(false);
const editName = ref('');
const editEmail = ref('');
const editLoading = ref(false);
const editError = ref('');

watch(() => props.showEdit, (v) => {
  if (v) {
    editName.value = props.userName;
    editEmail.value = props.userEmail;
    editError.value = '';
  }
});

async function onSendWarning() {
  sending.value = true;
  await sendAdminWarning(props.userId, warnTitle.value, warnMsg.value, warnSeverity.value);
  sending.value = false;
  emit('close-warn');
  emit('refresh');
  warnTitle.value = '';
  warnMsg.value = '';
}

const { confirmDialog } = useConfirmDialog();

async function onResetPassword() {
  if (!newPassword.value || newPassword.value.length < 6) { await confirmDialog({ message: t('adminUser.passwordMin'), variant: 'danger', icon: '⚠️' }); return; }
  resetLoading.value = true;
  const res = await resetUserPassword(props.userId, newPassword.value);
  resetLoading.value = false;
  if (res.success) {
    emit('close-reset');
    newPassword.value = '';
    await confirmDialog({ message: t('adminUser.passwordResetSuccess'), variant: 'success', icon: '✅' });
  }
}

async function onEditUser() {
  if (!editName.value.trim() || !editEmail.value.trim()) { editError.value = t('adminUser.fillFields'); return; }
  editLoading.value = true;
  editError.value = '';
  try {
    const res = await updateAdminUser(props.userId, { name: editName.value.trim(), email: editEmail.value.trim() });
    if (!res.success) editError.value = res.message || 'Failed';
    else { emit('close-edit'); emit('refresh'); }
  } catch (err: unknown) {
    editError.value = (err instanceof Error ? err.message : '') || 'Failed';
  } finally { editLoading.value = false; }
}
</script>

<template>
  <!-- Warning Modal -->
  <div v-if="showWarn" class="modal-overlay" @click.self="emit('close-warn')">
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
        <button class="btn-cancel" @click="emit('close-warn')">{{ t('common.cancel') }}</button>
        <button class="btn-submit" :disabled="sending" @click="onSendWarning">{{ sending ? '...' : t('common.send') }}</button>
      </div>
    </div>
  </div>

  <!-- Reset Password Modal -->
  <div v-if="showReset" class="modal-overlay" @click.self="emit('close-reset')">
    <div class="modal">
      <h4>{{ t('adminUser.resetPassword') }}</h4>
      <input v-model="newPassword" type="password" :placeholder="t('adminUser.newPassword')" />
      <div class="modal-actions">
        <button class="btn-cancel" @click="emit('close-reset')">{{ t('common.cancel') }}</button>
        <button class="btn-submit" :disabled="resetLoading" @click="onResetPassword">{{ resetLoading ? '...' : t('adminUser.setPassword') }}</button>
      </div>
    </div>
  </div>

  <!-- Edit User Modal -->
  <div v-if="showEdit" class="modal-overlay" @click.self="emit('close-edit')">
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
        <button class="btn-cancel" @click="emit('close-edit')">{{ t('common.cancel') }}</button>
        <button class="btn-submit" :disabled="editLoading" @click="onEditUser">{{ editLoading ? '...' : t('common.save') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.5rem; width: 100%; max-width: 420px; }
.modal h4 { margin: 0 0 1rem; color: #e2e8f0; }
.modal input, .modal textarea, .modal select { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; margin-bottom: 0.5rem; box-sizing: border-box; }
.form-row { margin-bottom: 0.75rem; }
.form-row label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.25rem; }
.form-row input { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; box-sizing: border-box; }
.modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.modal-actions button { flex: 1; padding: 0.55rem; border-radius: 0.5rem; font-family: inherit; font-weight: 700; cursor: pointer; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
.msg.error { color: #f87171; font-size: 0.85rem; margin: 0.5rem 0; }
</style>
