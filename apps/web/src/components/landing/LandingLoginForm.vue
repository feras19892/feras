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
          <router-link to="/register" class="btn-register">
            {{ t('auth.registerBtn') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  width: 100%;
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
}
.field {
  margin-bottom: 1rem;
  text-align: right;
}
:global(html[dir='ltr']) .field {
  text-align: left;
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
  left: 0.6rem;
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
  display: flex;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
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
}
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
}
.btn-register:hover {
  background: rgba(255,255,255,0.1);
}
</style>
