<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { fetchJson } from '../services/http'
import { useAuthStore } from '../modules/auth/stores/auth'
import type { User } from '@my-modern-app/shared-types'

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

async function handleResend() {
  formError.value = ''
  successMessage.value = ''
  if (!email.value) {
    formError.value = t('auth.errors.fillAll')
    return
  }
  resending.value = true
  try {
    const data = await fetchJson<{ success: boolean }>('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim() }),
    })
    if (!data.success) {
      formError.value = t('auth.errors.verificationFailed')
      return
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
    const data = await fetchJson<{ success: boolean; user?: User }>('/api/auth/verify-email', {
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


<style scoped src='./verify-email.css'></style>
