<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { RouterView } from 'vue-router';
import { useI18nStore } from './stores/i18n.store';
import { runStartupDiagnostics } from './composables/experiment/useStartupDiagnostics';
import { useAuthStore } from './modules/auth/stores/auth';
import { usePreferencesStore } from './stores/preferences.store';
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts';
import CommandPalette from './components/shared/CommandPalette.vue';
import GlobalConfirmDialog from './components/shared/GlobalConfirmDialog.vue';
import ToastContainer from './components/shared/ToastContainer.vue';
import FeedbackButton from './components/shared/FeedbackButton.vue';
import CookieConsent from './components/shared/CookieConsent.vue';


const i18n = useI18nStore();
const router = useRouter();
const auth = useAuthStore();
const prefs = usePreferencesStore();
useKeyboardShortcuts();

function applyTheme() {
  document.documentElement.setAttribute('data-theme', prefs.prefs.theme);
}

function applyFontSize() {
  document.documentElement.setAttribute('data-font-size', prefs.prefs.fontSize);
}

function applyDensity() {
  document.documentElement.setAttribute('data-density', prefs.prefs.compactTables ? 'compact' : 'comfortable');
}

watch(() => prefs.prefs.theme, applyTheme);
watch(() => prefs.prefs.fontSize, applyFontSize);
watch(() => prefs.prefs.compactTables, applyDensity);

function onSessionExpired() {
  auth.clearSession();
  auth.clearSchoolSession();
  if (router.currentRoute.value.meta.requiresAuth) {
    router.push('/');
  }
}

onMounted(() => {
  runStartupDiagnostics();
  applyTheme();
  applyFontSize();
  applyDensity();
  window.addEventListener('auth:session-expired', onSessionExpired);
});

onUnmounted(() => {
  window.removeEventListener('auth:session-expired', onSessionExpired);
});
</script>

<template>
  <div class="app" :dir="i18n.direction">
    <Suspense>
      <RouterView />
      <template #fallback>
        <div class="skeleton-loader">
          <div class="skeleton-spinner" />
          <p>جاري التحميل...</p>
        </div>
      </template>
    </Suspense>
    <CommandPalette />
    <GlobalConfirmDialog />
    <ToastContainer />
    <FeedbackButton />
    <CookieConsent />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Ensure all text respects the dir attribute by default */
body, .app {
  text-align: start;
}

/* Neutralize vite-plugin-vue-devtools' dev-only bug that mirrors the
   entire page via `html[dir="rtl"] { transform: scaleX(-1) }` */
html[dir='rtl'] {
  transform: none !important;
}

.app {
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.skeleton-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ── Font Size ── */
[data-font-size="small"] { font-size: 13px; }
[data-font-size="medium"] { font-size: 14px; }
[data-font-size="large"] { font-size: 16px; }
[data-font-size="large"] .app { font-size: 16px; }
[data-font-size="small"] .app { font-size: 13px; }
[data-font-size="medium"] .app { font-size: 14px; }

/* ── Compact Density ── */
[data-density="compact"] .info-card { padding: 10px; }
[data-density="compact"] .info-card h4 { margin-bottom: 8px; font-size: 14px; }
[data-density="compact"] table th,
[data-density="compact"] table td { padding: 6px 8px; font-size: 12px; }
[data-density="compact"] .btn { padding: 5px 10px; font-size: 11px; }
[data-density="compact"] .form-input { padding: 6px 10px; }

/* ── Light Theme (imported in main.ts) ── */

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
