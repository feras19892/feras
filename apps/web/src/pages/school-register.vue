<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import { registerSchool } from '../services/school.service';

const router = useRouter();
const { t } = useI18n();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const maxStudents = ref(50);
const maxTeachers = ref(10);
const showPassword = ref(false);
const formError = ref('');
const loading = ref(false);
const successCode = ref('');
const agreedToTerms = ref(false);

async function handleRegister() {
  formError.value = '';
  successCode.value = '';

  if (!name.value.trim() || !email.value.trim() || !password.value) {
    formError.value = t('auth.errors.fillAll');
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
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
  if (!agreedToTerms.value) {
    formError.value = t('legal.mustAgree');
    return;
  }

  loading.value = true;
  const result = await registerSchool(name.value.trim(), email.value.trim(), password.value, maxStudents.value, maxTeachers.value);
  loading.value = false;

  if (result.success && result.code) {
    successCode.value = result.code;
  } else {
    formError.value = result.message || t('auth.errors.registerFailed');
  }
}

function goToLogin() {
  router.push('/school/login');
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="app-header">
        <h1>🏫 {{ t('school.registerTitle') }}</h1>
        <p class="subtitle">{{ t('school.registerSubtitle') }}</p>
      </div>

      <!-- Success: show code -->
      <div v-if="successCode" class="success-box">
        <h2>✅ {{ t('school.registerSuccess') }}</h2>
        <p>{{ t('school.yourCode') }}:</p>
        <div class="code-display">{{ successCode }}</div>
        <p class="code-hint">{{ t('school.codeHint') }}</p>
        <button class="btn-submit" @click="goToLogin">{{ t('school.goToLogin') }}</button>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="handleRegister">
        <div class="field">
          <label>{{ t('school.nameLabel') }}</label>
          <input v-model="name" type="text" required :placeholder="t('school.namePlaceholder')" />
        </div>
        <div class="field">
          <label>{{ t('auth.emailLabel') }}</label>
          <input v-model="email" type="email" required autocomplete="username" />
        </div>
        <div class="field">
          <label>{{ t('auth.passwordLabel') }}</label>
          <div class="password-wrapper">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required autocomplete="new-password" />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>{{ t('auth.confirmPasswordLabel') }}</label>
          <input v-model="confirmPassword" type="password" required autocomplete="new-password" />
        </div>
        <div class="field-row">
          <div class="field half">
            <label>{{ t('school.maxStudents') }}</label>
            <input v-model.number="maxStudents" type="number" min="1" max="10000" required />
          </div>
          <div class="field half">
            <label>{{ t('school.maxTeachers') }}</label>
            <input v-model.number="maxTeachers" type="number" min="1" max="500" required />
          </div>
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <label class="terms-check">
          <input type="checkbox" v-model="agreedToTerms" />
          <span>{{ t('legal.agreePrefix') }}
            <router-link to="/terms" target="_blank">{{ t('legal.termsLink') }}</router-link>
            {{ t('legal.andWord') }}
            <router-link to="/privacy" target="_blank">{{ t('legal.privacyLink') }}</router-link>
          </span>
        </label>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? t('auth.loading') : t('school.registerBtn') }}
        </button>
      </form>

      <router-link to="/login" class="back-link">← {{ t('auth.backToLogin') }}</router-link>
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
  width: 420px;
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
.app-header { text-align: center; margin-bottom: 1.5rem; }
.app-header h1 { margin: 0 0 0.4rem; font-size: 1.3rem; color: #67e8f9; }
.app-header .subtitle { margin: 0; font-size: 0.85rem; color: #94a3b8; }
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
.password-wrapper { position: relative; display: flex; align-items: center; }
.password-wrapper input { flex: 1; padding-inline-end: 2.4rem; }
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
.error { color: #fca5a5; font-size: 0.8rem; margin: 0.5rem 0; }
.terms-check {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.8rem 0;
  font-size: 0.78rem;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1.5;
}
.terms-check input { width: auto; margin-top: 0.2rem; accent-color: #06b6d4; }
.terms-check a { color: #67e8f9; text-decoration: none; }
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
.back-link {
  display: block;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 1rem;
  text-decoration: none;
}
.back-link:hover { color: #67e8f9; }

.success-box { text-align: center; padding: 1rem 0; }
.success-box h2 { color: #4ade80; font-size: 1.1rem; margin: 0 0 0.8rem; }
.code-display {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.2rem;
  color: #67e8f9;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.8rem;
  padding: 0.8rem;
  margin: 0.8rem 0;
  font-family: monospace;
}
.code-hint { font-size: 0.8rem; color: #94a3b8; margin: 0.5rem 0 1rem; }
</style>
