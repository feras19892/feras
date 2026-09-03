<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { registerSchool } from '../services/school.service';





const router = useRouter();

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

  if (result.success) {
    goToLogin();
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


<style scoped src='./school-register.css'></style>
