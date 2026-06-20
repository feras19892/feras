<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const formError = ref('');

async function handleLogin() {
  formError.value = '';
  auth.error = null;

  if (!email.value.trim() || !password.value) {
    formError.value = 'يرجى ملء البريد الإلكتروني وكلمة السر';
    return;
  }

  const ok = await auth.login(email.value.trim(), password.value);
  if (ok) {
    router.push('/dashboard');
    return;
  }

  formError.value = 'البريد الإلكتروني أو كلمة السر غير صحيحة';
}

function enterAsGuest() {
  auth.loginAsGuest();
  router.push('/dashboard');
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>البريد الإلكتروني</label>
          <input v-model="email" type="email" required autocomplete="username" name="email" />
        </div>
        <div class="field">
          <label>كلمة السر</label>
          <div class="password-wrap">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required autocomplete="current-password" name="password" />
            <button type="button" class="toggle-pw" @click.prevent="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <p v-else-if="auth.error" class="error">{{ auth.error }}</p>
        <div class="btn-row">
          <button type="submit" class="btn-submit" :disabled="auth.loading">
            {{ auth.loading ? 'جارٍ...' : 'تسجيل الدخول' }}
          </button>
          <router-link to="/register" class="btn-register">
            إنشاء حساب
          </router-link>
        </div>
      </form>
      <div class="guest-row">
        <span>أو</span>
        <button type="button" class="link" @click="enterAsGuest">
          دخول سريع كضيف
        </button>
      </div>
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
  width: 380px;
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
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
.password-wrap { position: relative; }
.password-wrap input { padding-left: 2.5rem; }
.toggle-pw {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
}
.toggle-pw:hover { opacity: 1; }
.error { color: #fca5a5; font-size: 0.8rem; margin: 0.5rem 0; }
.btn-row { display: flex; gap: 0.6rem; margin-top: 0.5rem; }
.btn-submit {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
  text-align: center;
}
.btn-submit:disabled { opacity: 0.6; cursor: wait; }
.btn-register {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 0.5rem;
  background: rgba(255,255,255,0.06);
  color: #e2e8f0;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-register:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); }
.guest-row { text-align: center; margin-top: 1rem; font-size: 0.8rem; color: #64748b; }
.link { background: none; border: none; color: #67e8f9; cursor: pointer; font-size: 0.8rem; text-decoration: underline; }
</style>
