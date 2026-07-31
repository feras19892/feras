<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../modules/auth/stores/auth';
import { updateAvatar } from '../../services/enhancements.service';

const { t } = useI18n();
const auth = useAuthStore();
const router = useRouter();

const show = ref(false);
const activeSection = ref<'avatar' | 'name' | 'password' | 'delete'>('avatar');

// Avatar section
const avatarUrl = ref('');
const avatarPreview = ref('');
const avatarLoading = ref(false);
const avatarError = ref('');
const avatarSuccess = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

// Name section
const newName = ref('');
const nameError = ref('');
const nameSuccess = ref('');
const nameLoading = ref(false);

// Password section
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showCurrentPwd = ref(false);
const showNewPwd = ref(false);
const showConfirmPwd = ref(false);
const passwordError = ref('');
const passwordSuccess = ref('');
const passwordLoading = ref(false);

// Delete section
const deletePassword = ref('');
const showDeletePwd = ref(false);
const deleteConfirm = ref(false);
const deleteError = ref('');
const deleteLoading = ref(false);

const isTeacher = computed(() => auth.role === 'teacher' || auth.role === 'admin');
const isAdmin = computed(() => auth.role === 'admin');

watch(show, (val) => {
  if (val) {
    activeSection.value = 'avatar';
    newName.value = auth.user?.name || '';
    avatarUrl.value = (auth.user as any)?.avatar_url || '';
    avatarPreview.value = (auth.user as any)?.avatar_url || '';
    avatarError.value = '';
    avatarSuccess.value = '';
    nameError.value = '';
    nameSuccess.value = '';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    passwordError.value = '';
    passwordSuccess.value = '';
    deletePassword.value = '';
    deleteConfirm.value = false;
    deleteError.value = '';
  }
});

async function onUploadAvatar() {
  avatarError.value = '';
  avatarSuccess.value = '';
  if (!avatarUrl.value.trim()) {
    avatarError.value = t('shared.avatarUrlRequired');
    return;
  }
  avatarLoading.value = true;
  try {
    const res = await updateAvatar(avatarUrl.value.trim());
    if (res.success) {
      avatarPreview.value = avatarUrl.value.trim();
      if (auth.user) (auth.user as any).avatar_url = avatarUrl.value.trim();
      avatarSuccess.value = t('shared.avatarUpdated');
      setTimeout(() => { avatarSuccess.value = ''; }, 3000);
    } else {
      avatarError.value = res.message || t('shared.avatarUpdateFailed');
    }
  } catch (e: any) {
    avatarError.value = e?.message || t('shared.avatarUpdateFailed');
  }
  avatarLoading.value = false;
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    avatarError.value = t('shared.avatarTooLarge');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    avatarUrl.value = reader.result as string;
    avatarPreview.value = reader.result as string;
    avatarError.value = '';
  };
  reader.readAsDataURL(file);
}

async function onSaveName() {
  nameError.value = '';
  nameSuccess.value = '';

  if (!newName.value.trim() || newName.value.trim().length < 2) {
    nameError.value = t('account.nameTooShort');
    return;
  }

  if (newName.value.trim() === auth.user?.name) {
    nameError.value = t('account.noChanges');
    return;
  }

  nameLoading.value = true;
  if (isTeacher.value) {
    const result = await auth.updateProfileName(newName.value.trim());
    nameLoading.value = false;
    if (result.ok) {
      nameSuccess.value = t('account.nameUpdated');
      setTimeout(() => { show.value = false; }, 1500);
    } else {
      nameError.value = result.message;
    }
  } else {
    const result = await auth.submitNameRequest(newName.value.trim());
    nameLoading.value = false;
    if (result.ok) {
      nameSuccess.value = t('account.nameRequestSent');
      setTimeout(() => { show.value = false; }, 2000);
    } else {
      nameError.value = result.message;
    }
  }
}

async function onChangePassword() {
  passwordError.value = '';
  passwordSuccess.value = '';

  if (!currentPassword.value) {
    passwordError.value = t('account.enterCurrentPassword');
    return;
  }
  if (newPassword.value.length < 8) {
    passwordError.value = t('auth.errors.passwordTooShort');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = t('auth.errors.passwordsMismatch');
    return;
  }

  passwordLoading.value = true;
  const ok = await auth.updatePassword(auth.user!.id, newPassword.value);
  passwordLoading.value = false;

  if (ok) {
    passwordSuccess.value = t('account.passwordUpdated');
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    setTimeout(() => { passwordSuccess.value = ''; }, 3000);
  } else {
    passwordError.value = t('account.wrongPassword');
  }
}

async function onDeleteAccount() {
  deleteError.value = '';

  if (!deletePassword.value) {
    deleteError.value = t('account.enterPassword');
    return;
  }
  if (!deleteConfirm.value) {
    deleteError.value = t('account.confirmDeleteRequired');
    return;
  }

  deleteLoading.value = true;
  const result = await auth.deleteMyAccount(deletePassword.value);
  deleteLoading.value = false;

  if (result.ok) {
    show.value = false;
    router.push('/');
  } else {
    deleteError.value = result.message;
  }
}
</script>

<template>
  <button class="edit-account-btn" @click="show = true">
    <span>⚙️</span>
    <span>{{ t('account.settings') }}</span>
  </button>

  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="show = false">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <h3>⚙️ {{ t('account.settings') }}</h3>
          <button class="close-btn" @click="show = false">✕</button>
        </div>

        <!-- User info bar -->
        <div class="user-bar">
          <div class="user-avatar">
            <img v-if="(auth.user as any)?.avatar_url" :src="(auth.user as any).avatar_url" alt="avatar" />
            <span v-else>{{ isAdmin ? '🛡️' : isTeacher ? '👨‍🏫' : '🎓' }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ auth.user?.name }}</span>
            <span class="user-email">📧 {{ auth.user?.email }}</span>
          </div>
          <span class="user-email-locked" :title="t('account.emailLocked')">🔒</span>
        </div>

        <!-- Section tabs -->
        <div class="section-tabs">
          <button :class="['sec-tab', { active: activeSection === 'avatar' }]" @click="activeSection = 'avatar'">
            <span>📸</span> {{ t('shared.avatarTab') }}
          </button>
          <button :class="['sec-tab', { active: activeSection === 'name' }]" @click="activeSection = 'name'">
            <span>✏️</span> {{ t('account.editName') }}
          </button>
          <button :class="['sec-tab', { active: activeSection === 'password' }]" @click="activeSection = 'password'">
            <span>🔑</span> {{ t('account.changePassword') }}
          </button>
          <button v-if="!isAdmin" :class="['sec-tab', { active: activeSection === 'delete' }]" @click="activeSection = 'delete'">
            <span>🗑️</span> {{ t('account.deleteAccount') }}
          </button>
        </div>

        <!-- Avatar section -->
        <div v-if="activeSection === 'avatar'" class="section-body">
          <div class="avatar-preview-wrap">
            <img v-if="avatarPreview" :src="avatarPreview" class="avatar-preview-img" alt="avatar" />
            <div v-else class="avatar-placeholder">{{ isAdmin ? '🛡️' : isTeacher ? '👨‍🏫' : '🎓' }}</div>
          </div>
          <div class="field">
            <label>{{ t('shared.avatarUrlLabel') }}</label>
            <input v-model="avatarUrl" type="text" placeholder="https://example.com/photo.jpg" />
          </div>
          <div class="avatar-upload-row">
            <button class="btn-upload" @click="fileInput?.click()">{{ t('shared.avatarChooseFile') }}</button>
            <input ref="fileInput" type="file" accept="image/*" @change="onFileSelected" style="display:none" />
          </div>
          <p class="info-note">{{ t('shared.avatarInfoNote') }}</p>
          <p v-if="avatarError" class="error">{{ avatarError }}</p>
          <p v-if="avatarSuccess" class="success">{{ avatarSuccess }}</p>
          <button class="btn-primary" :disabled="avatarLoading" @click="onUploadAvatar">
            {{ avatarLoading ? t('auth.loading') : t('shared.avatarSave') }}
          </button>
        </div>

        <!-- Name section -->
        <div v-if="activeSection === 'name'" class="section-body">
          <div class="field">
            <label>{{ t('account.newName') }}</label>
            <input v-model="newName" type="text" @keyup.enter="onSaveName" />
          </div>
          <p v-if="!isTeacher" class="info-note">
            💡 {{ t('account.nameRequestHint') }}
          </p>
          <p v-if="nameError" class="error">{{ nameError }}</p>
          <p v-if="nameSuccess" class="success">{{ nameSuccess }}</p>
          <button class="btn-primary" :disabled="nameLoading" @click="onSaveName">
            {{ nameLoading ? t('auth.loading') : (isTeacher ? t('common.save') : t('account.sendRequest')) }}
          </button>
        </div>

        <!-- Password section -->
        <div v-if="activeSection === 'password'" class="section-body">
          <div class="field">
            <label>{{ t('account.currentPassword') }}</label>
            <div class="pwd-input">
              <input v-model="currentPassword" :type="showCurrentPwd ? 'text' : 'password'" />
              <button class="pwd-toggle" @click="showCurrentPwd = !showCurrentPwd">{{ showCurrentPwd ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          <div class="field">
            <label>{{ t('account.newPassword') }}</label>
            <div class="pwd-input">
              <input v-model="newPassword" :type="showNewPwd ? 'text' : 'password'" />
              <button class="pwd-toggle" @click="showNewPwd = !showNewPwd">{{ showNewPwd ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          <div class="field">
            <label>{{ t('account.confirmPassword') }}</label>
            <div class="pwd-input">
              <input v-model="confirmPassword" :type="showConfirmPwd ? 'text' : 'password'" @keyup.enter="onChangePassword" />
              <button class="pwd-toggle" @click="showConfirmPwd = !showConfirmPwd">{{ showConfirmPwd ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          <p v-if="passwordError" class="error">{{ passwordError }}</p>
          <p v-if="passwordSuccess" class="success">{{ passwordSuccess }}</p>
          <button class="btn-primary" :disabled="passwordLoading" @click="onChangePassword">
            {{ passwordLoading ? t('auth.loading') : t('account.changePassword') }}
          </button>
        </div>

        <!-- Delete section -->
        <div v-if="activeSection === 'delete'" class="section-body">
          <div class="delete-warning">
            <span class="warn-icon">⚠️</span>
            <p>{{ t('account.deleteWarning') }}</p>
          </div>
          <div class="field">
            <label>{{ t('account.currentPassword') }}</label>
            <div class="pwd-input">
              <input v-model="deletePassword" :type="showDeletePwd ? 'text' : 'password'" />
              <button class="pwd-toggle" @click="showDeletePwd = !showDeletePwd">{{ showDeletePwd ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          <label class="confirm-check">
            <input type="checkbox" v-model="deleteConfirm" />
            <span>{{ t('account.deleteConfirmText') }}</span>
          </label>
          <p v-if="deleteError" class="error">{{ deleteError }}</p>
          <button class="btn-danger" :disabled="deleteLoading" @click="onDeleteAccount">
            {{ deleteLoading ? t('auth.loading') : t('account.deleteAccount') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.edit-account-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.08);
  color: #c7d2fe;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.edit-account-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}
.modal-card {
  width: 100%;
  max-width: 440px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.2rem;
  color: #e2e8f0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  background: linear-gradient(135deg, #67e8f9, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.close-btn {
  width: 30px;
  height: 30px;
  border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
}
.close-btn:hover { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }

.user-bar {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  background: rgba(99, 102, 241, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.user-info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.user-name { font-size: 0.9rem; font-weight: 700; color: #f1f5f9; }
.user-email { font-size: 0.75rem; color: #94a3b8; }
.user-email-locked { font-size: 0.9rem; }

.section-tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.8rem 1.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.sec-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.6rem 0.4rem;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}
.sec-tab:hover { color: #94a3b8; background: rgba(255,255,255,0.02); }
.sec-tab.active { color: #a5b4fc; border-bottom-color: #818cf8; }

.section-body { padding: 1.2rem 1.5rem; }

.field { margin-bottom: 0.9rem; }
.field label {
  display: block;
  font-size: 0.78rem;
  margin-bottom: 0.3rem;
  color: #cbd5e1;
  font-weight: 600;
}
.field input {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid #334155;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 0.88rem;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.field input:focus { outline: none; border-color: #06b6d4; }

.pwd-input { position: relative; }
.pwd-input input { padding-inline-end: 2.5rem; }
.pwd-toggle {
  position: absolute;
  inset-inline-end: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.2rem;
  opacity: 0.7;
}
.pwd-toggle:hover { opacity: 1; }

.info-note {
  font-size: 0.75rem;
  color: #94a3b8;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 0.5rem;
  padding: 0.6rem 0.8rem;
  margin: 0 0 0.8rem;
  line-height: 1.5;
}

.error { color: #fca5a5; font-size: 0.8rem; margin: 0.5rem 0; }
.success { color: #6ee7b7; font-size: 0.8rem; margin: 0.5rem 0; }

.btn-primary {
  width: 100%;
  padding: 0.7rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: inherit;
  transition: all 0.15s;
  margin-top: 0.3rem;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(6,182,212,0.25); }
.btn-primary:disabled { opacity: 0.6; cursor: wait; transform: none; }

.btn-danger {
  width: 100%;
  padding: 0.7rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: inherit;
  transition: all 0.15s;
  margin-top: 0.3rem;
}
.btn-danger:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(239,68,68,0.25); }
.btn-danger:disabled { opacity: 0.6; cursor: wait; transform: none; }

.delete-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.8rem;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  margin-bottom: 1rem;
}
.warn-icon { font-size: 1.2rem; flex-shrink: 0; }
.delete-warning p {
  margin: 0;
  font-size: 0.78rem;
  color: #fca5a5;
  line-height: 1.5;
}

.confirm-check {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.8rem 0;
  font-size: 0.78rem;
  color: #cbd5e1;
  cursor: pointer;
  line-height: 1.5;
}
.confirm-check input { width: auto; margin-top: 0.2rem; accent-color: #ef4444; }

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-preview-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.avatar-preview-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(99,102,241,0.3);
}
.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.avatar-upload-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.btn-upload {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(99,102,241,0.25);
  background: rgba(99,102,241,0.08);
  color: #c7d2fe;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.82rem;
}
.btn-upload:hover { background: rgba(99,102,241,0.15); }

@media (max-width: 480px) {
  .modal-card { max-width: 100%; }
  .section-tabs { flex-wrap: wrap; }
  .sec-tab { font-size: 0.72rem; }
}
</style>
