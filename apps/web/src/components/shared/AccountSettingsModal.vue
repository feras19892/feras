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
    avatarUrl.value = auth.user?.avatar_url || '';
    avatarPreview.value = auth.user?.avatar_url || '';
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
      if (auth.user) auth.user.avatar_url = avatarUrl.value.trim();
      avatarSuccess.value = t('shared.avatarUpdated');
      setTimeout(() => { avatarSuccess.value = ''; }, 3000);
    } else {
      avatarError.value = res.message || t('shared.avatarUpdateFailed');
    }
  } catch (e: unknown) {
    avatarError.value = e instanceof Error ? e.message : t('shared.avatarUpdateFailed');
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
  const ok = await auth.updatePassword(auth.user!.id, newPassword.value, currentPassword.value);
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
            <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" alt="avatar" />
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


<style scoped src='./AccountSettingsModal.css'></style>
