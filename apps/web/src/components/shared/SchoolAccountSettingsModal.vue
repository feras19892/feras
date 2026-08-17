<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAuthStore } from '../../modules/auth/stores/auth';
import { updateSchoolName, changeSchoolPassword } from '../../services/school.service';
import { useI18n } from '../../composables/useI18n';

const auth = useAuthStore();
const { t } = useI18n();

const show = ref(false);
const activeSection = ref<'name' | 'password'>('name');

const newName = ref('');
const nameError = ref('');
const nameSuccess = ref('');
const nameLoading = ref(false);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showCurrentPwd = ref(false);
const showNewPwd = ref(false);
const showConfirmPwd = ref(false);
const passwordError = ref('');
const passwordSuccess = ref('');
const passwordLoading = ref(false);

const schoolName = computed(() => auth.schoolSession?.name || '');
const schoolEmail = computed(() => auth.schoolSession?.email || '');

watch(show, (val) => {
  if (val) {
    activeSection.value = 'name';
    newName.value = schoolName.value;
    nameError.value = '';
    nameSuccess.value = '';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    passwordError.value = '';
    passwordSuccess.value = '';
  }
});

async function onSaveName() {
  nameError.value = '';
  nameSuccess.value = '';
  if (!newName.value.trim()) {
    nameError.value = t('school.acctNameRequired');
    return;
  }
  if (newName.value.trim() === schoolName.value) {
    nameError.value = t('school.acctNameUnchanged');
    return;
  }
  nameLoading.value = true;
  try {
    const res = await updateSchoolName(newName.value.trim());
    if (res.success && res.school) {
      auth.setSchoolSession(res.school);
      nameSuccess.value = t('school.acctNameUpdated');
    } else {
      nameError.value = res.message || t('school.acctUpdateFailed');
    }
  } catch {
    nameError.value = t('school.acctUpdateFailed');
  }
  nameLoading.value = false;
}

async function onChangePassword() {
  passwordError.value = '';
  passwordSuccess.value = '';
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = t('school.acctAllFieldsRequired');
    return;
  }
  if (newPassword.value.length < 6) {
    passwordError.value = t('school.acctPwdTooShort');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = t('school.acctPwdMismatch');
    return;
  }
  passwordLoading.value = true;
  try {
    const res = await changeSchoolPassword(currentPassword.value, newPassword.value);
    if (res.success) {
      passwordSuccess.value = t('school.acctPwdChanged');
      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
    } else {
      passwordError.value = res.message || t('school.acctPwdChangeFailed');
    }
  } catch {
    passwordError.value = t('school.acctPwdChangeFailed');
  }
  passwordLoading.value = false;
}
</script>

<template>
  <div class="school-acct-wrapper">
    <button class="acct-btn" @click="show = true" :title="t('account.settings')">⚙️</button>

    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="show = false">
        <div class="modal-card">
          <div class="modal-header">
            <h2>{{ t('school.acctTitle') }}</h2>
            <button class="close-btn" @click="show = false">✕</button>
          </div>

          <div class="modal-body">
            <div class="section-tabs">
              <button :class="['tab', { active: activeSection === 'name' }]" @click="activeSection = 'name'">👤 {{ t('account.editName') }}</button>
              <button :class="['tab', { active: activeSection === 'password' }]" @click="activeSection = 'password'">🔒 {{ t('account.changePassword') }}</button>
            </div>

            <!-- Name Section -->
            <div v-if="activeSection === 'name'" class="section">
              <div class="field-group">
                <label class="field-label">{{ t('school.acctEmail') }}</label>
                <input :value="schoolEmail" class="field-input" disabled />
              </div>
              <div class="field-group">
                <label class="field-label">{{ t('school.acctSchoolName') }}</label>
                <input v-model="newName" class="field-input" @keyup.enter="onSaveName" />
              </div>
              <p v-if="nameError" class="field-error">{{ nameError }}</p>
              <p v-if="nameSuccess" class="field-success">{{ nameSuccess }}</p>
              <button class="save-btn" :disabled="nameLoading" @click="onSaveName">
                {{ nameLoading ? '...' : t('common.save') }}
              </button>
            </div>

            <!-- Password Section -->
            <div v-if="activeSection === 'password'" class="section">
              <div class="field-group">
                <label class="field-label">{{ t('account.currentPassword') }}</label>
                <div class="pwd-input">
                  <input :type="showCurrentPwd ? 'text' : 'password'" v-model="currentPassword" class="field-input" />
                  <button class="pwd-toggle" @click="showCurrentPwd = !showCurrentPwd">{{ showCurrentPwd ? '🙈' : '👁️' }}</button>
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">{{ t('account.newPassword') }}</label>
                <div class="pwd-input">
                  <input :type="showNewPwd ? 'text' : 'password'" v-model="newPassword" class="field-input" />
                  <button class="pwd-toggle" @click="showNewPwd = !showNewPwd">{{ showNewPwd ? '🙈' : '👁️' }}</button>
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">{{ t('account.confirmPassword') }}</label>
                <div class="pwd-input">
                  <input :type="showConfirmPwd ? 'text' : 'password'" v-model="confirmPassword" class="field-input" />
                  <button class="pwd-toggle" @click="showConfirmPwd = !showConfirmPwd">{{ showConfirmPwd ? '🙈' : '👁️' }}</button>
                </div>
              </div>
              <p v-if="passwordError" class="field-error">{{ passwordError }}</p>
              <p v-if="passwordSuccess" class="field-success">{{ passwordSuccess }}</p>
              <button class="save-btn" :disabled="passwordLoading" @click="onChangePassword">
                {{ passwordLoading ? '...' : t('school.acctChangePwd') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.school-acct-wrapper { display: inline-flex; }
.acct-btn {
  width: 38px; height: 38px; border-radius: 0.6rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(15,23,42,0.6);
  font-size: 1.1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.acct-btn:hover { border-color: rgba(6,182,212,0.3); background: rgba(6,182,212,0.08); }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px); display: flex;
  align-items: center; justify-content: center; z-index: 500;
}
.modal-card {
  background: rgba(15,23,42,0.97); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.8rem; width: 90%; max-width: 420px;
  display: flex; flex-direction: column; overflow: hidden;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.modal-header h2 { margin: 0; font-size: 1rem; color: #e2e8f0; }
.close-btn {
  background: none; border: none; color: #94a3b8;
  font-size: 1.1rem; cursor: pointer; padding: 0.3rem 0.5rem;
  border-radius: 0.35rem; transition: all 0.15s;
}
.close-btn:hover { background: rgba(255,255,255,0.05); color: #f87171; }

.modal-body { padding: 1.25rem; }

.section-tabs { display: flex; gap: 0.4rem; margin-bottom: 1.25rem; }
.tab {
  flex: 1; padding: 0.5rem; border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: #94a3b8; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.tab.active {
  border-color: rgba(99,102,241,0.4);
  background: rgba(99,102,241,0.1);
  color: #a5b4fc;
}

.section { display: flex; flex-direction: column; gap: 0.8rem; }

.field-group { display: flex; flex-direction: column; gap: 0.3rem; }
.field-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.field-input {
  padding: 0.55rem 0.7rem; border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3); color: #e2e8f0;
  font-size: 0.85rem; font-family: inherit;
}
.field-input:focus { outline: none; border-color: rgba(99,102,241,0.4); }
.field-input:disabled { opacity: 0.5; cursor: not-allowed; }

.pwd-input { position: relative; display: flex; align-items: center; }
.pwd-input .field-input { flex: 1; padding-inline-end: 2.2rem; }
.pwd-toggle {
  position: absolute; inset-inline-end: 0.5rem;
  background: none; border: none; cursor: pointer;
  font-size: 0.9rem; padding: 0.2rem;
}

.field-error { color: #f87171; font-size: 0.78rem; margin: 0; }
.field-success { color: #4ade80; font-size: 0.78rem; margin: 0; }

.save-btn {
  padding: 0.55rem 1rem; border-radius: 0.4rem; border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 0.15s;
}
.save-btn:disabled { opacity: 0.6; cursor: wait; }
.save-btn:hover:not(:disabled) { opacity: 0.9; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
