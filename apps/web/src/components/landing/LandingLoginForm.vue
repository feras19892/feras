<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const formError = ref('')

const emit = defineEmits<{
  (e: 'login', payload: { email: string; password: string }): void
  (e: 'register'): void
}>()

function handleLogin() {
  formError.value = ''
  if (!email.value.trim() || !password.value) {
    formError.value = t('auth.errors.fillAll')
    return
  }
  emit('login', { email: email.value.trim(), password: password.value })
}
</script>

<template>
  <div class="login-card">
    <div class="form-step">
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>{{ t('auth.emailLabel') }}</label>
          <input v-model="email" type="email" required autocomplete="username" name="email" />
        </div>
        <div class="field">
          <label>{{ t('auth.passwordLabel') }}</label>
          <div class="password-wrap">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required autocomplete="current-password" name="password" />
            <button type="button" class="toggle-pw" @click.prevent="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <div class="btn-row">
          <button type="submit" class="btn-submit">
            {{ t('auth.loginBtn') }}
          </button>
        </div>
        <div class="register-link">
          {{ t('auth.noAccount') }} <router-link to="/register" class="btn-register">{{ t('auth.registerBtn') }}</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  width: 100%;
  padding: 1.5rem;
  border-radius: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.field {
  margin-bottom: 1rem;
  text-align: start;
}
.field label {
  display: block;
  font-size: 0.82rem;
  margin-bottom: 0.35rem;
  color: #cbd5e1;
}
.field input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border-radius: 0.5rem;
  border: 1px solid #334155;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.9rem;
  box-sizing: border-box;
}
.field input:focus {
  outline: none;
  border-color: #06b6d4;
}
.password-wrap {
  position: relative;
}
.toggle-pw {
  position: absolute;
  inset-inline-start: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
}
.toggle-pw:hover { opacity: 1; }
.error {
  color: #fca5a5;
  font-size: 0.8rem;
  margin: 0.5rem 0;
}
.btn-row {
  margin-top: 0.5rem;
}
.btn-submit {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(99,102,241,0.25);
}
.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(99,102,241,0.35);
}
.register-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.82rem;
  color: #64748b;
}
.btn-register {
  color: #a5b4fc;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}
.btn-register:hover {
  color: #c7d2fe;
  text-decoration: underline;
}
</style>
