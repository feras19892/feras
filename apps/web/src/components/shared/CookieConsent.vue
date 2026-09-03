<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction, locale } = useI18n();
import { ref, computed, onMounted } from 'vue';


const STORAGE_KEY = 'physlab-cookie-consent';
const consent = ref<string | null>(null);

const visible = computed(() => consent.value === null);

const messages: Record<string, { title: string; body: string; accept: string; more: string }> = {
  ar: {
    title: 'نستخدم ملفات تعريف ارتباط ضرورية فقط',
    body: 'نستخدم ملفات تعريف الارتباط الضرورية لجلسة تسجيل الدخول فقط. لا نستخدم التتبع أو الإعلانات.',
    accept: 'موافق',
    more: 'سياسة الخصوصية',
  },
  en: {
    title: 'We only use essential cookies',
    body: 'We use cookies only for login sessions. We do not use tracking or advertising cookies.',
    accept: 'Accept',
    more: 'Privacy Policy',
  },
  es: {
    title: 'Solo usamos cookies esenciales',
    body: 'Usamos cookies solo para las sesiones de inicio de sesión. No usamos cookies de seguimiento ni publicidad.',
    accept: 'Aceptar',
    more: 'Política de Privacidad',
  },
};

const m = computed(() => messages[locale.value] ?? messages.en);

function accept() {
  localStorage.setItem(STORAGE_KEY, 'essential');
  consent.value = 'essential';
}

onMounted(() => {
  consent.value = localStorage.getItem(STORAGE_KEY);
});
</script>

<template>
  <div v-if="visible" class="cookie-banner" role="dialog" aria-live="polite">
    <div class="cookie-content">
      <p class="cookie-title">{{ m.title }}</p>
      <p class="cookie-body">{{ m.body }}</p>
    </div>
    <div class="cookie-actions">
      <button class="cookie-accept" @click="accept">{{ m.accept }}</button>
      <router-link to="/privacy" class="cookie-link">{{ m.more }}</router-link>
    </div>
  </div>
</template>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.96);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  backdrop-filter: blur(8px);
}

.cookie-content {
  flex: 1;
}

.cookie-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0 0 0.25rem;
}

.cookie-body {
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.cookie-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cookie-accept {
  background: #67e8f9;
  color: #0f172a;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
}

.cookie-accept:hover {
  background: #5ee7f1;
}

.cookie-link {
  color: #67e8f9;
  font-size: 0.85rem;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .cookie-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .cookie-actions {
    justify-content: flex-end;
  }
}
</style>
