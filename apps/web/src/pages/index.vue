<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useI18n } from '../composables/useI18n'
import LandingLangSwitcher from '../components/landing/LandingLangSwitcher.vue'
import LandingHeroSection from '../components/landing/LandingHeroSection.vue'
import LandingLoginForm from '../components/landing/LandingLoginForm.vue'
import LandingGuestButtons from '../components/landing/LandingGuestButtons.vue'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const formError = ref('')

async function handleLogin(payload: { email: string; password: string }) {
  formError.value = ''
  auth.error = null
  const ok = await auth.login(payload.email, payload.password)
  if (ok) {
    routeByRole()
  } else {
    formError.value = t('auth.errors.invalidCredentials')
  }
}

function handleJoin() {
  router.push('/register')
}

function routeByRole() {
  router.push('/home')
}

function enterAsTeacher() {
  auth.loginAsGuest('teacher')
  router.push('/home')
}

function enterAsStudent() {
  auth.loginAsGuest('student')
  router.push('/home')
}
</script>

<template>
  <div class="landing-page">
    <LandingLangSwitcher />

    <div class="landing-inner">
      <LandingHeroSection />

      <div class="login-section">
        <LandingLoginForm @login="handleLogin" @register="handleJoin" />
        <p v-if="formError" class="error">{{ formError }}</p>
        <p v-else-if="auth.error" class="error">{{ auth.error }}</p>
        <LandingGuestButtons @enter-as-teacher="enterAsTeacher" @enter-as-student="enterAsStudent" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}
.landing-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 380px;
  width: 100%;
}
.login-section {
  width: 100%;
}
.error {
  color: #fca5a5;
  font-size: 0.8rem;
  margin: 0.5rem 0;
  text-align: center;
}
</style>
