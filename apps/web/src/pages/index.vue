<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useI18n } from '../composables/useI18n'
import LandingInfoSide from '../components/landing/LandingInfoSide.vue'
import LandingLoginSide from '../components/landing/LandingLoginSide.vue'
import LandingFeatureDetail from '../components/landing/LandingFeatureDetail.vue'
import FeedbackModal from '../components/shared/FeedbackModal.vue'

const { t, direction } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const formError = ref('')
const showFeedback = ref(false)
const activeFeat = ref<number | null>(null)
const featColors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#ef4444']

async function handleLogin(payload: { email: string; password: string }) {
  formError.value = ''
  auth.error = null
  const ok = await auth.login(payload.email, payload.password)
  if (ok) router.push('/home')
  else formError.value = t('auth.errors.invalidCredentials')
}

function handleJoin() { router.push('/register') }

function scrollToLoginAfterDetail() {
  activeFeat.value = null
  document.querySelector('.login-side')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function enterAsTeacher() { auth.loginAsGuest('teacher'); router.push('/home') }
function enterAsStudent() { auth.loginAsGuest('student'); router.push('/home') }
</script>

<template>
  <div class="split-page" :class="{ rtl: direction === 'rtl' }">
    <LandingInfoSide
      :feat-colors="featColors"
      @feat-click="activeFeat = $event"
      @show-feedback="showFeedback = true"
    />

    <LandingFeatureDetail
      :active-feat="activeFeat"
      :feat-colors="featColors"
      @close="activeFeat = null"
      @cta="scrollToLoginAfterDetail"
    />

    <FeedbackModal v-model:show="showFeedback" />

    <LandingLoginSide
      :form-error="formError"
      :auth-error="auth.error"
      @login="handleLogin"
      @register="handleJoin"
      @enter-as-teacher="enterAsTeacher"
      @enter-as-student="enterAsStudent"
    />
  </div>
</template>

<style scoped>
.split-page {
  min-height: 100vh;
  display: flex;
  direction: ltr;
  background: #0a0f1c;
  color: #e2e8f0;
}
.split-page.rtl { flex-direction: row; }
.split-page.rtl :deep(.info-side) { order: 1; direction: rtl; }
.split-page.rtl :deep(.login-side) { order: 2; direction: rtl; }

@media (max-width: 900px) {
  .split-page, .split-page.rtl { flex-direction: column; }
  .split-page.rtl :deep(.info-side),
  .split-page.rtl :deep(.login-side) { order: initial; }
  .split-page :deep(.login-side) { position: static; height: auto; }
}
</style>
