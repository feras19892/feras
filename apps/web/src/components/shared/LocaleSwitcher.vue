<template>
  <div class="locale-switcher">
    <select
      :value="locale"
      class="locale-select"
      :disabled="loading"
      @change="onChange($event)"
      :title="t('admin.locale.select', 'اختر اللغة')"
    >
      <option v-for="code in supported" :key="code" :value="code">
        {{ localeNames[code] || code }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, locale, setLocale, loading, supported } = useI18n();
import { localeNames, supportedLocales, type Locale } from '@/locales'

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = target.value as Locale
  if (supportedLocales.includes(value)) {
    setLocale(value)
  }
}
</script>

<style scoped>
.locale-switcher { display: inline-flex; align-items: center; }
.locale-select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  font-size: 13px;
  cursor: pointer;
}
</style>
