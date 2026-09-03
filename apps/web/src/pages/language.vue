<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '../stores/i18n.store'
import { localeNames, supportedLocales, type Locale } from '../locales'

const router = useRouter()
const i18n = useI18nStore()

const changing = ref(false)
const error = ref('')

async function pick(lang: Locale) {
  if (!supportedLocales.includes(lang) || changing.value) return
  changing.value = true
  error.value = ''
  try {
    await i18n.setLocale(lang)
    const previous = router.options?.history?.state?.back as string | undefined
    if (previous && !previous.startsWith('/language')) {
      router.back()
    } else {
      router.replace('/')
    }
  } catch (e) {
    error.value = i18n.loadError || 'فشل تغيير اللغة'
  } finally {
    changing.value = false
  }
}
</script>

<template>
  <div class="lang-page">
    <div class="lang-card">
      <h1 class="title">{{ i18n.t('landing.chooseLang', 'Choose Language') }}</h1>
      <p v-if="error" class="error-text">{{ error }}</p>
      <div class="options">
        <button
          v-for="loc in i18n.supported"
          :key="loc"
          class="option-btn"
          :disabled="changing"
          @click="pick(loc)"
        >
          <span class="flag">{{ localeNames[loc] ? localeNames[loc][0] : '•' }}</span>
          <span class="name">{{ localeNames[loc] }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lang-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  padding: 1rem;
}
.lang-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.title {
  color: #e2e8f0;
  font-size: 1.25rem;
  text-align: center;
  font-weight: 600;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.option-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.option-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}
.option-btn:active {
  transform: scale(0.98);
}
.flag {
  font-size: 1.3rem;
  line-height: 1;
}
.name {
  font-weight: 500;
}
</style>
