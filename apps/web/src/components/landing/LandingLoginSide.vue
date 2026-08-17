<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import LandingLoginForm from './LandingLoginForm.vue'

const { t } = useI18n()

const props = defineProps<{
  formError: string
  authError: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'login', payload: { email: string; password: string }): void
  (e: 'register'): void
}>()
</script>

<template>
  <div class="login-side">
    <div class="login-glow"></div>

    <div class="login-top">
      <span class="login-top-brand">⚛️ PhysLab</span>
    </div>

    <div class="login-center">
      <div class="login-heading-wrap">
        <h2 class="login-heading">{{ t('landing.navLogin') }}</h2>
        <span class="login-heading-accent"></span>
      </div>

      <div class="login-card-wrap">
        <LandingLoginForm :loading="props.loading" @login="emit('login', $event)" @register="emit('register')" />
      </div>

      <p v-if="formError" class="error">{{ formError }}</p>
      <p v-else-if="authError" class="error">{{ authError }}</p>

    </div>

    <footer class="login-footer">
      <span>⚛️ PhysLab — {{ t('landing.footerRights') }}</span>
      <span class="footer-sub">{{ t('landing.footerMadeWith') }}</span>
      <div class="footer-links">
        <router-link to="/privacy">{{ t('legal.privacyLink') }}</router-link>
        <span>·</span>
        <router-link to="/terms">{{ t('legal.termsLink') }}</router-link>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.login-side {
  flex: 1; direction: ltr; display: flex; flex-direction: column; align-items: center;
  padding: 1.2rem 1.5rem 0; position: relative; overflow: hidden;
  position: sticky; top: 0; height: 100vh; align-self: flex-start;
}
.login-glow {
  position: absolute; top: -15%; left: 50%; transform: translateX(-50%);
  width: 500px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%); pointer-events: none;
}
.login-top {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.5rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.login-top-brand { font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.3px; }
.login-center {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.6rem; width: 100%; max-width: 360px; padding: 0.5rem 0 1rem;
  overflow-y: auto;
}
.login-heading-wrap { text-align: center; margin-bottom: 0.3rem; }
.login-heading { font-size: 1.35rem; font-weight: 800; color: #f1f5f9; margin: 0; }
.login-heading-accent { display: block; width: 48px; height: 3px; border-radius: 999px; background: linear-gradient(90deg, #6366f1, #a78bfa, #06b6d4); margin: 0.5rem auto 0; }
.login-card-wrap { width: 100%; }
.login-divider { width: 100%; display: flex; align-items: center; gap: 0.8rem; margin: 0.8rem 0 0.2rem; }
.login-divider::before, .login-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
.login-divider span { font-size: 0.72rem; color: #64748b; font-weight: 500; }

.login-info-panel { width: 100%; margin-top: 1.2rem; display: flex; flex-direction: column; gap: 1rem; }
.login-trust { display: flex; justify-content: space-around; gap: 0.5rem; padding: 0.8rem 0.5rem; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); }
.trust-item { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
.trust-icon { font-size: 1.1rem; }
.trust-text { font-size: 0.65rem; color: #94a3b8; text-align: center; line-height: 1.3; }
.login-mini-stats { display: flex; justify-content: center; gap: 2rem; }
.mini-stat { display: flex; flex-direction: column; align-items: center; }
.mini-stat-num { font-size: 1.3rem; font-weight: 800; background: linear-gradient(135deg, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.mini-stat-label { font-size: 0.65rem; color: #64748b; }
.login-perks { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.8rem 1rem; border-radius: 12px; background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.03)); border: 1px solid rgba(99,102,241,0.08); }
.perk-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4; }
.perk-check { flex-shrink: 0; width: 18px; height: 18px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: #a5b4fc; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.15); }

.error { color: #fca5a5; font-size: 0.8rem; margin: 0.2rem 0; text-align: center; }
.school-link {
  display: block;
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.2);
  color: #67e8f9;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  margin-top: 0.4rem;
  transition: all 0.2s;
}
.school-link:hover { background: rgba(6, 182, 212, 0.15); border-color: rgba(6, 182, 212, 0.4); }
.school-login-link {
  display: block;
  text-align: center;
  padding: 0.4rem 1rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  margin-top: 0.2rem;
  transition: color 0.2s;
}
.school-login-link:hover { color: #94a3b8; }
.login-footer { text-align: center; padding: 1rem; border-top: 1px solid rgba(255,255,255,0.04); color: #475569; font-size: 0.72rem; display: flex; flex-direction: column; gap: 0.15rem; width: 100%; }
.footer-sub { font-size: 0.7rem; opacity: 0.7; }
.footer-links { display: flex; gap: 0.4rem; align-items: center; justify-content: center; margin-top: 0.3rem; }
.footer-links a { color: #64748b; text-decoration: none; font-size: 0.7rem; }
.footer-links a:hover { color: #94a3b8; text-decoration: underline; }
.footer-links span { color: #334155; font-size: 0.7rem; }
</style>
