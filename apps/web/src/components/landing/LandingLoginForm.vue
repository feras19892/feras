<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { fetchJson } from '../../services/http'

const { t } = useI18n()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const formError = ref('')

const showForgot = ref(false)
const forgotEmail = ref('')
const forgotCode = ref('')
const forgotNewPassword = ref('')
const forgotStep = ref<'email' | 'code' | 'done'>('email')
const forgotLoading = ref(false)
const forgotError = ref('')
const devResetCode = ref('')

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

async function sendForgotEmail() {
  forgotError.value = ''
  forgotLoading.value = true
  try {
    const res = await fetchJson<{ success: boolean; devResetCode?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail.value.trim() }),
    })
    if (res.success) {
      forgotStep.value = 'code'
      if (res.devResetCode) devResetCode.value = res.devResetCode
    }
  } catch (e: any) {
    forgotError.value = e.message || 'Error'
  }
  forgotLoading.value = false
}

async function resetPassword() {
  forgotError.value = ''
  if (forgotNewPassword.value.length < 8) {
    forgotError.value = t('auth.errors.passwordTooShort')
    return
  }
  forgotLoading.value = true
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: forgotEmail.value.trim(),
        code: forgotCode.value.trim(),
        new_password: forgotNewPassword.value,
      }),
    })
    if (res.success) {
      forgotStep.value = 'done'
    } else {
      forgotError.value = res.message || 'Error'
    }
  } catch (e: any) {
    forgotError.value = e.message || 'Error'
  }
  forgotLoading.value = false
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
        <div class="forgot-link">
          <button type="button" class="link-btn" @click="showForgot = true; forgotStep = 'email'; forgotError = ''">{{ t('auth.forgotPassword', 'نسيت كلمة المرور؟') }}</button>
        </div>
        <div class="register-link">
          {{ t('auth.noAccount') }} <router-link to="/register" class="btn-register">{{ t('auth.registerBtn') }}</router-link>
        </div>
      </form>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgot" class="forgot-overlay" @click.self="showForgot = false">
      <div class="forgot-modal">
        <button class="close-btn" @click="showForgot = false">✕</button>
        <h3>{{ t('auth.forgotPassword', 'نسيت كلمة المرور؟') }}</h3>

        <!-- Step 1: Email -->
        <div v-if="forgotStep === 'email'">
          <p class="forgot-hint">{{ t('auth.forgotEmailHint', 'أدخل بريدك الإلكتروني وسيتم إرسال رمز التحقق') }}</p>
          <input v-model="forgotEmail" type="email" :placeholder="t('auth.emailLabel')" class="forgot-input" />
          <p v-if="forgotError" class="error">{{ forgotError }}</p>
          <button class="btn-submit" :disabled="forgotLoading" @click="sendForgotEmail">
            {{ forgotLoading ? '...' : t('auth.sendCode', 'إرسال الرمز') }}
          </button>
        </div>

        <!-- Step 2: Code + New Password -->
        <div v-if="forgotStep === 'code'">
          <p class="forgot-hint">{{ t('auth.forgotCodeHint', 'أدخل رمز التحقق وكلمة المرور الجديدة') }}</p>
          <p v-if="devResetCode" class="dev-code">رمز التحقق (تجريبي): <strong>{{ devResetCode }}</strong></p>
          <input v-model="forgotCode" type="text" :placeholder="t('auth.verificationCode', 'رمز التحقق')" class="forgot-input" />
          <input v-model="forgotNewPassword" type="password" :placeholder="t('auth.newPassword', 'كلمة المرور الجديدة')" class="forgot-input" />
          <p v-if="forgotError" class="error">{{ forgotError }}</p>
          <button class="btn-submit" :disabled="forgotLoading" @click="resetPassword">
            {{ forgotLoading ? '...' : t('auth.resetPassword', 'إعادة تعيين كلمة المرور') }}
          </button>
        </div>

        <!-- Step 3: Done -->
        <div v-if="forgotStep === 'done'" class="done-step">
          <p>✅ {{ t('auth.passwordResetSuccess', 'تم تغيير كلمة المرور بنجاح') }}</p>
          <button class="btn-submit" @click="showForgot = false">{{ t('common.close', 'إغلاق') }}</button>
        </div>
      </div>
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
.forgot-link { text-align: center; margin-top: 0.5rem; }
.link-btn {
  background: none; border: none; color: #94a3b8; font-size: 0.8rem;
  cursor: pointer; text-decoration: none; padding: 0;
}
.link-btn:hover { color: #67e8f9; text-decoration: underline; }
.forgot-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.forgot-modal {
  background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem;
  padding: 2rem; width: 360px; max-width: 90vw; position: relative;
}
.forgot-modal h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #f1f5f9; text-align: center; }
.close-btn {
  position: absolute; top: 0.5rem; inset-inline-end: 0.5rem;
  background: none; border: none; color: #64748b; font-size: 1.1rem; cursor: pointer;
}
.close-btn:hover { color: #e2e8f0; }
.forgot-hint { font-size: 0.82rem; color: #94a3b8; margin: 0 0 1rem; text-align: center; }
.forgot-input {
  width: 100%; padding: 0.65rem 0.9rem; border-radius: 0.5rem;
  border: 1px solid #334155; background: #1e293b; color: #e2e8f0;
  font-size: 0.9rem; box-sizing: border-box; margin-bottom: 0.7rem;
}
.forgot-input:focus { outline: none; border-color: #06b6d4; }
.dev-code { font-size: 0.8rem; color: #fbbf24; text-align: center; margin: 0.5rem 0; }
.done-step { text-align: center; }
.done-step p { color: #4ade80; margin-bottom: 1rem; }
</style>
