<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { locale, setLocale, t } = useI18n()

async function onChange(ev: Event) {
  const val = (ev.target as HTMLSelectElement).value
  await setLocale(val as 'ar' | 'en' | 'es')
}
</script>

<template>
  <div class="lang-dropdown">
    <select data-testid="lang-switcher" :value="locale" @change="onChange" class="lang-select">
      <option value="ar">🇸🇦 {{ t('landing.langArabic') }}</option>
      <option value="en">🇬🇧 {{ t('landing.langEnglish') }}</option>
      <option value="es">🇪🇸 {{ t('landing.langSpanish') }}</option>
    </select>
  </div>
</template>

<style scoped>
.lang-dropdown {
  position: static;
  z-index: 10;
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
</style>
