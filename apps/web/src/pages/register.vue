<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';
import { useI18n } from '../composables/useI18n';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();

onMounted(() => {
  localStorage.clear();
  auth.user = null;
  auth.guestMode = false;
  auth.guestRole = null;
  auth.currentClassId = null;
  auth.classes = [];
});

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const formError = ref('');
const selectedRole = ref<'teacher' | 'student'>('student');

async function handleRegister() {
  formError.value = '';

  const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`.trim();
  const trimmedEmail = email.value.trim();
  if (!fullName || !trimmedEmail || !password.value) {
    formError.value = t('auth.errors.fillAll');
    return;
  }
  if (fullName.length < 2) {
    formError.value = t('auth.errors.nameTooShort');
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    formError.value = t('auth.errors.invalidEmail');
    return;
  }
  if (password.value !== confirmPassword.value) {
    formError.value = t('auth.errors.passwordsMismatch');
    return;
  }
  if (password.value.length < 8) {
    formError.value = t('auth.errors.passwordTooShort');
    return;
  }

  const ok = await auth.registerWithRole(
    email.value.trim(),
    password.value,
    fullName,
    selectedRole.value
  );
  if (ok) {
    router.push('/dashboard');
  } else {
    formError.value = auth.error || t('auth.errors.registerFailed');
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="app-header">
        <h1>{{ t('auth.registerTitle') }}</h1>
        <p class="subtitle">
          {{ selectedRole === 'teacher' ? t('auth.roleTeacher') : t('auth.roleStudent') }}
        </p>
      </div>
      <form @submit.prevent="handleRegister">
        <div class="field-row">
          <div class="field half">
            <label>{{ t('auth.firstNameLabel', 'First Name') }}</label>
            <input v-model="firstName" type="text" required autocomplete="given-name" name="firstName" />
          </div>
          <div class="field half">
            <label>{{ t('auth.lastNameLabel', 'Last Name') }}</label>
            <input v-model="lastName" type="text" required autocomplete="family-name" name="lastName" />
          </div>
        </div>
        <div class="field">
          <label>{{ t('auth.roleLabel') }}</label>
          <div class="role-toggle">
            <button
              type="button"
              class="role-option"
              :class="{ active: selectedRole === 'teacher' }"
              @click="selectedRole = 'teacher'"
            >
              {{ t('auth.roleTeacher') }}
            </button>
            <button
              type="button"
              class="role-option"
              :class="{ active: selectedRole === 'student' }"
              @click="selectedRole = 'student'"
            >
              {{ t('auth.roleStudent') }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>{{ t('auth.emailLabel') }}</label>
          <input v-model="email" type="email" required autocomplete="username" name="email" />
        </div>
        <div class="field">
          <label>{{ t('auth.passwordLabel') }}</label>
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              name="password"
            />
            <button
              type="button"
              class="eye-btn"
              @click="showPassword = !showPassword"
              :title="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>{{ t('auth.confirmPasswordLabel') }}</label>
          <div class="password-wrapper">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              name="confirmPassword"
            />
            <button
              type="button"
              class="eye-btn"
              @click="showConfirmPassword = !showConfirmPassword"
              :title="showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <button type="submit" class="btn-submit" :disabled="auth.loading">
          {{ auth.loading ? t('auth.loading') : t('auth.registerBtn') }}
        </button>
      </form>
      <router-link to="/login" class="back-link">
        ← {{ t('auth.backToLogin') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0b1220, #0f172a, #1e3a5f);
  padding: 1rem;
}
.register-card {
  width: 400px;
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
.app-header { text-align: center; margin-bottom: 1.5rem; }
.app-header h1 { margin: 0 0 0.4rem; font-size: 1.3rem; color: #67e8f9; }
.app-header .subtitle { margin: 0; font-size: 0.9rem; color: #94a3b8; }
.field { margin-bottom: 1rem; }
label { display: block; font-size: 0.8rem; margin-bottom: 0.35rem; color: #cbd5e1; }
input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid #334155;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.9rem;
  box-sizing: border-box;
}
input:focus { outline: none; border-color: #06b6d4; }
.field-row { display: flex; gap: 0.5rem; }
.field.half { flex: 1; margin-bottom: 0; }
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.password-wrapper input {
  flex: 1;
  padding-inline-end: 2.4rem;
}
.eye-btn {
  position: absolute;
  inset-inline-end: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  color: #94a3b8;
  line-height: 1;
}
.eye-btn:hover { color: #e2e8f0; }
.error { color: #fca5a5; font-size: 0.8rem; margin: 0.5rem 0; }
.btn-submit {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}
.btn-submit:disabled { opacity: 0.6; cursor: wait; }
.role-toggle { display: flex; gap: 0.5rem; }
.role-option {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.5rem;
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.role-option:hover { background: rgba(255,255,255,0.08); }
.role-option.active {
  background: rgba(99,102,241,0.2);
  border-color: rgba(99,102,241,0.4);
  color: #e0e7ff;
}
.back-link {
  display: block;
  text-align: center;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 1rem;
  text-decoration: none;
}
.back-link:hover { color: #67e8f9; }
</style>
