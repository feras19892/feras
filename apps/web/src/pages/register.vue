<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const formError = ref('');
const selectedRole = ref<'teacher' | 'student'>('student');

async function handleRegister() {
  formError.value = '';

  if (!name.value.trim() || !email.value.trim() || !password.value) {
    formError.value = 'يرجى ملء جميع الحقول';
    return;
  }
  if (password.value !== confirmPassword.value) {
    formError.value = 'كلمتا المرور غير متطابقتين';
    return;
  }
  if (password.value.length < 6) {
    formError.value = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    return;
  }

  const ok = await auth.registerWithRole(
    email.value.trim(),
    password.value,
    name.value.trim(),
    selectedRole.value
  );
  if (ok) {
    router.push('/dashboard');
  } else {
    formError.value = auth.error || 'فشل إنشاء الحساب';
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="app-header">
        <h1>إنشاء حساب جديد</h1>
        <p class="subtitle">
          {{ selectedRole === 'teacher' ? '👨‍🏫 مدرس' : '🎓 طالب' }}
        </p>
      </div>
      <form @submit.prevent="handleRegister">
        <div class="field">
          <label>الاسم الكامل</label>
          <input v-model="name" type="text" required />
        </div>
        <div class="field">
          <label>نوع الحساب</label>
          <div class="role-toggle">
            <button
              type="button"
              class="role-option"
              :class="{ active: selectedRole === 'teacher' }"
              @click="selectedRole = 'teacher'"
            >
              👨‍🏫 مدرس
            </button>
            <button
              type="button"
              class="role-option"
              :class="{ active: selectedRole === 'student' }"
              @click="selectedRole = 'student'"
            >
              🎓 طالب
            </button>
          </div>
        </div>
        <div class="field">
          <label>البريد الإلكتروني</label>
          <input v-model="email" type="email" required />
        </div>
        <div class="field">
          <label>كلمة المرور</label>
          <input v-model="password" type="password" required />
        </div>
        <div class="field">
          <label>تأكيد كلمة المرور</label>
          <input v-model="confirmPassword" type="password" required />
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <button type="submit" class="btn-submit" :disabled="auth.loading">
          {{ auth.loading ? 'جارٍ...' : 'إنشاء الحساب' }}
        </button>
      </form>
      <router-link to="/login" class="back-link">
        ← رجوع للدخول
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
