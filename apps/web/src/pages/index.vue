<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useI18n } from '../composables/useI18n'

const router = useRouter()
const auth = useAuthStore()
const { t, locale, setLocale } = useI18n()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const formError = ref('')

async function handleLogin() {
  formError.value = ''
  auth.error = null
  if (!email.value.trim() || !password.value) {
    formError.value = 'يرجى ملء البريد الإلكتروني وكلمة السر'
    return
  }
  const ok = await auth.login(email.value.trim(), password.value)
  if (ok) {
    routeByRole()
  } else {
    formError.value = 'البريد الإلكتروني أو كلمة السر غير صحيحة'
  }
}

function handleJoin() {
  router.push('/register')
}

function routeByRole() {
  if (auth.isTeacher) router.push('/home')
  else if (auth.isStudent) router.push('/home')
  else router.push('/home')
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
    <!-- TOP-RIGHT: Language Dropdown -->
    <div class="lang-dropdown">
      <select data-testid="lang-switcher" v-model="locale" @change="setLocale(locale)" class="lang-select">
        <option value="ar">🇸🇦 العربية</option>
        <option value="en">🇬🇧 English</option>
        <option value="es">🇪🇸 Español</option>
      </select>
    </div>

    <div class="landing-inner">
      <!-- UPPER-MIDDLE: Project Description -->
      <div class="hero-section">
        <h1 class="hero-title">{{ t('landing.tagline') || 'مختبر العلوم التفاعلي' }}</h1>
        <p class="hero-desc">
          {{ t('landing.descLine1') || 'منصة تعليمية متكاملة للتجارب العلمية' }}<br>
          ⚛️ الفيزياء — 🧪 الكيمياء — 📐 الرياضيات — 🧬 البيولوجيا
        </p>
      </div>

      <!-- CENTER: Login Form -->
      <div class="login-section">
        <div class="login-card">
          <div class="form-step">
            <form @submit.prevent="handleLogin">
              <div class="field">
                <label>{{ t('auth.email') || 'البريد الإلكتروني' }}</label>
                <input v-model="email" type="email" required />
              </div>
              <div class="field">
                <label>{{ t('auth.password') || 'كلمة السر' }}</label>
                <div class="password-wrap">
                  <input v-model="password" :type="showPassword ? 'text' : 'password'" required />
                  <button type="button" class="toggle-pw" @click.prevent="showPassword = !showPassword">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>
              <p v-if="formError" class="error">{{ formError }}</p>
              <p v-else-if="auth.error" class="error">{{ auth.error }}</p>
              <div class="btn-row">
                <button type="submit" class="btn-submit" :disabled="auth.loading">
                  {{ auth.loading ? 'جارٍ...' : (t('auth.login') || 'دخول') }}
                </button>
                <button type="button" class="btn-register" :disabled="auth.loading" @click.prevent="handleJoin">
                  {{ t('auth.register') || 'إنشاء حساب' }}
                </button>
              </div>
            </form>
            <div class="guest-row">
              <span>{{ t('auth.or') || 'أو' }}</span>
            </div>
            <div class="guest-btn-row">
              <button type="button" class="btn-guest teacher" @click="enterAsTeacher">
                👨‍🏫 دخول كمعلم
              </button>
              <button data-testid="guest-login" type="button" class="btn-guest student" @click="enterAsStudent">
                🎓 دخول كطالب
              </button>
            </div>
          </div>
        </div>
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

/* ── Layout ── */
.landing-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 380px;
  width: 100%;
}

/* ── Top-Right: Language Dropdown ── */
.lang-dropdown {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
}
:global(html[dir='rtl']) .lang-dropdown {
  right: auto;
  left: 1.5rem;
}
.lang-select {
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: #e2e8f0;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  min-width: 120px;
}
.lang-select option {
  background: #1e293b;
  color: #e2e8f0;
}
.lang-select:focus {
  border-color: rgba(99,102,241,0.4);
}

/* ── Middle: Hero description ── */
.hero-section {
  text-align: center;
  color: #e2e8f0;
  margin-top: 1rem;
}
.hero-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.6rem;
  background: linear-gradient(135deg, #67e8f9, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
}
.hero-desc {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.8;
  margin: 0;
}

/* ── Center: Login card ── */
.login-section {
  width: 100%;
}
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
}
.btn-register:hover:not(:disabled) {
  background: rgba(255,255,255,0.1);
}
.btn-register:disabled { opacity: 0.6; cursor: wait; }

.guest-row {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #64748b;
}
.guest-row span { margin: 0 0.4rem; }

.guest-btn-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
}
.btn-guest {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 0.5rem;
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.btn-guest:hover {
  background: rgba(255,255,255,0.08);
  color: #e2e8f0;
}
.btn-guest.teacher:hover {
  border-color: rgba(59,130,246,0.4);
  background: rgba(59,130,246,0.1);
  color: #93c5fd;
}
.btn-guest.student:hover {
  border-color: rgba(16,185,129,0.4);
  background: rgba(16,185,129,0.1);
  color: #86efac;
}
</style>
