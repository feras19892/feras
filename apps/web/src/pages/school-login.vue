<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '../modules/auth/stores/auth';
import { loginSchool } from '../services/school.service';





const router = useRouter();

const auth = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const formError = ref('');
const loading = ref(false);

async function handleLogin() {
  formError.value = '';
  if (!email.value.trim() || !password.value) {
    formError.value = t('auth.errors.fillAll');
    return;
  }

  loading.value = true;
  const result = await loginSchool(email.value.trim(), password.value);
  loading.value = false;

  if (result.success && result.school) {
    auth.setSchoolSession(result.school);
    router.push('/school');
  } else {
    formError.value = result.message || t('auth.errors.loginFailed');
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="app-header">
        <h1>🏫 {{ t('school.loginTitle') }}</h1>
        <p class="subtitle">{{ t('school.loginSubtitle') }}</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>{{ t('auth.emailLabel') }}</label>
          <input v-model="email" type="email" required autocomplete="username" />
        </div>
        <div class="field">
          <label>{{ t('auth.passwordLabel') }}</label>
          <div class="password-wrapper">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required autocomplete="current-password" />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? t('auth.loading') : t('school.loginBtn') }}
        </button>
      </form>
      <router-link to="/school/register" class="back-link">
        ← {{ t('school.registerLink') }}
      </router-link>
      <router-link to="/login" class="back-link">
        ← {{ t('auth.backToLogin') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0b1220, #0f172a, #1e3a5f);
  padding: 1rem;
}
.login-card {
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
  margin-top: 0.8rem;
  text-decoration: none;
}
.back-link:hover { color: #67e8f9; }
</style>
