<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { fetchJson } from '../services/http'
import { useAuthStore } from '../modules/auth/stores/auth'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

const email = ref<string>((route.query.email as string) || '')
const code = ref('')
const formError = ref('')
const successMessage = ref('')
const loading = ref(false)
const resending = ref(false)

// Dev-only helper: show code returned from backend when not in production
const devCodeHint = ref<string | null>((route.query.devCode as string) || null)

async function handleResend() {
  formError.value = ''
  successMessage.value = ''
  if (!email.value) {
    formError.value = t('auth.errors.fillAll')
    return
  }
  resending.value = true
  try {
    const data = await fetchJson<{ success: boolean; devVerificationCode?: string }>('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim() }),
    })
    if (!data.success) {
      formError.value = t('auth.errors.verificationFailed')
      return
    }
    if (data.devVerificationCode) {
      devCodeHint.value = data.devVerificationCode
    }
    successMessage.value = t('auth.resendSuccess')
  } catch {
    formError.value = t('auth.errors.verificationFailed')
  } finally {
    resending.value = false
  }
}

async function handleVerify() {
  formError.value = ''
  successMessage.value = ''
  if (!email.value || !code.value) {
    formError.value = t('auth.errors.fillAll')
    return
  }
  loading.value = true
  try {
    const data = await fetchJson<{ success: boolean; user?: any }>('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), code: code.value.trim() }),
    })
    if (!data.success) {
      formError.value = t('auth.errors.verificationFailed')
      return
    }
    if (data.user) {
      auth.setSession(data.user)
    }
    successMessage.value = t('auth.verificationSuccess')
    setTimeout(() => {
      router.push('/home')
    }, 800)
  } catch (err) {
    formError.value = t('auth.errors.verificationFailed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="verify-page">
    <div class="verify-card">
      <h1 class="title">{{ t('auth.verifyTitle') }}</h1>
      <p class="subtitle">{{ t('auth.verifySubtitle') }}</p>

      <div class="field">
        <label>{{ t('auth.emailLabel') }}</label>
        <input v-model="email" type="email" autocomplete="email" />
      </div>

      <div class="field">
        <label>{{ t('auth.codeLabel') }}</label>
        <input v-model="code" type="text" inputmode="numeric" autocomplete="one-time-code" />
      </div>

      <p v-if="devCodeHint" class="dev-hint">
        {{ t('auth.devCodeHint') }}: <strong>{{ devCodeHint }}</strong>
      </p>

      <p v-if="formError" class="error">{{ formError }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <button type="button" class="btn-submit" :disabled="loading" @click="handleVerify">
        {{ loading ? t('auth.loading') : t('auth.verifyBtn') }}
      </button>

      <button type="button" class="resend-link" :disabled="resending" @click="handleResend">
        {{ resending ? t('auth.loading') : t('auth.resendCode') }}
      </button>

      <button type="button" class="back-link" @click="router.push('/')">
        ← {{ t('auth.backToLogin') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.verify-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #020617, #0f172a, #1e293b);
  padding: 1rem;
}

.verify-card {
  width: 360px;
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(15, 23, 42, 0.96);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.9);
}

.title {
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
  color: #7dd3fc;
}

.subtitle {
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  color: #9ca3af;
}

.field {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
  color: #cbd5e1;
}

input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid #334155;
  background: #020617;
  color: #e5e7eb;
  font-size: 0.9rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #06b6d4;
}

.dev-hint {
  font-size: 0.8rem;
  color: #a5b4fc;
  background: rgba(79, 70, 229, 0.18);
  border-radius: 0.5rem;
  padding: 0.5rem 0.6rem;
  margin-bottom: 0.5rem;
}

.error {
  color: #fecaca;
  font-size: 0.8rem;
  margin: 0.4rem 0;
}

.success {
  color: #bbf7d0;
  font-size: 0.8rem;
  margin: 0.4rem 0;
}

.btn-submit {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #06b6d4, #22c55e);
  color: #f9fafb;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: wait;
}

.back-link {
  display: block;
  width: 100%;
  margin-top: 1rem;
  text-align: center;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 0.85rem;
}

.back-link:hover {
  color: #7dd3fc;
}

.resend-link {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  text-align: center;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.8rem;
}

.resend-link:hover:not(:disabled) {
  color: #7dd3fc;
}

.resend-link:disabled {
  opacity: 0.5;
  cursor: wait;
}
</style>
